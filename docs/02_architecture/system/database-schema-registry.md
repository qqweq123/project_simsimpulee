---
title: "Mellow Wave Database Schema & Extraction Registry"
author: "Director of Data Architecture & General Engineer"
last_updated: "2026-03-02"
status: "Active"
tags: ["Supabase", "Data Architecture", "SQL", "ETL", "Schema", "RPC", "Security"]
---

<!-- 파일 기능 서술: Mellow Wave 플랫폼의 중앙 데이터베이스(Supabase) 스키마 정의, RPC 함수 시그니처, 보안 정책, 데이터 계보, 그리고 분석용 추출 쿼리 라이브러리를 포괄하는 데이터 공학적 마스터 명세서입니다. -->

# 🗄️ Database Schema & Extraction Registry

데이터 통합 처리 총괄 디렉터(@dataarchitecturedirector) 및 총괄 수석 엔지니어(@general-engineer)의 합동 감사를 거쳐 작성된 **단일 진실 공급원(SSOT, Single Source of Truth)** 문서입니다. 

본 문서는 `Test_Meta_DB` 및 텔레메트리 파이프라인의 설계 철학, 테이블 명세, RPC 함수 시그니처, 보안 정책, 그리고 실무진 및 분석 조직에서 곧바로 활용할 수 있는 **데이터 추출(Extraction) 쿼리 라이브러리**를 제공합니다.

---

## 🏗️ 1. Architecture Philosophy (설계 철학)

1. **지표의 분리 (Separation of Metrics)**: 바이럴 마케팅 목적의 **'단순 진입(Starts)'** 트래픽과 서비스 품질 분석 목적의 **'실제 완료(Completions)'** 트래픽을 데이터베이스 컬럼 설계 단계부터 원천 분리했습니다. 
2. **보안 및 무결성 제어 (RLS & RPC)**: 프론트엔드가 직접 DB 컬럼을 수정(`Update`)하는 것을 원천 차단했습니다. 모든 데이터는 Postgres Stored Procedure(`RPC`)를 통해서만 단방향(One-way)으로 누적되며 경합 조건(Race Condition) 시 원자성(Atomicity)을 잃지 않습니다. `[lock-01]` `[security-01]`
3. **프론트엔드 멱등성 보장 (Idempotency)**: `sessionStorage` 플래그(`${testId}_counted`, `${testId}_completed_counted`)를 통해 동일 세션 내 중복 RPC 호출을 프론트엔드 1선에서 차단합니다.

---

## 📊 2. Table Specifications (테이블 명세)

### 2.1. `Test_Meta_DB` (핵심 통계 마스터 테이블)

| Column Name | Type | Key | Default | Description & Lineage |
| :--- | :--- | :--- | :--- | :--- |
| **`test_id`** | `text` | **PK** | - | 테스트 고유 마이크로-엔드포인트 (e.g., `island`, `dopamine`, `love`). O(1) 포인트 스캔 인덱스 채용. |
| **`participants_count`** | `bigint` | | `0` | **[Public/Marketing]** 문항 1페이지 진입 즉시 트리거 누적. 랜딩 페이지 카운터 연동 노출 값. |
| **`completions_count`** | `bigint` | | `0` | **[Internal/Raw]** 결과지 페이지(`result.html`) 도달 시에만 누적되는 폐쇄형 통계 값. |
| **`created_at`** | `timestamptz` | | `now()` | 레코드 최초 생성(INSERT) 시간. Upsert 시에도 변경되지 않는 불변(Immutable) 타임스탬프. |

**보안 정책**: RLS 활성화, `SELECT`만 `public`에 허용. `INSERT`/`UPDATE`는 오직 `SECURITY DEFINER` RPC를 통해서만 수행.

### 2.2. `Test_Dropoff_Logs` (이탈률/체류시간 로깅 테이블)

| Column Name | Type | Key | Default | Description & Lineage |
| :--- | :--- | :--- | :--- | :--- |
| **`uuid`** | `text` | **PK (복합)** | - | 사용자의 브라우저 세션 UUID. |
| **`test_id`** | `text` | **PK (복합)** | - | 해당 세션이 수행 중인 테스트 ID. |
| **`dwell_time`** | `integer` | | - | 순수 체류시간. **단위: 밀리초(ms)**. 프론트엔드(`telemetry.js`)에서 `performance.now()` 기반으로 측정된 원시(raw) 밀리초 값이 그대로 적재됩니다. 분석 쿼리에서 `/ 1000`으로 초 단위 변환하여 사용합니다. |
| **`last_question_index`** | `smallint` | | `NULL` | **[마이크로 퍼널]** 이탈 직전 마지막으로 머물렀던 문항 번호 (0-indexed). ✅ RPC 연동 완료 |
| **`created_at`** | `timestamptz` | | `now()` | 레코드 최초 생성 시간. **Upsert 시 `now()`로 갱신**되어 마지막 핑(Ping) 시점을 기록합니다 (`ON CONFLICT DO UPDATE SET created_at = now()`). |

**보안 정책**: RLS `RESTRICT` 준하. 오직 `log_test_dropoff` RPC(SECURITY DEFINER)를 통해서만 Upsert.

### 2.3. Data Lifecycle & Indexing (데이터 수명 주기 및 인덱싱)

1. **데이터 캡핑(Outlier Capping)**
   - `telemetry.js` 단에서 `DWELL_TIME_MAX_CAP = 300000`(5분, 밀리초)으로 하드 리미트. 잠수타는 허수 세션의 데이터 오염을 1선에서 차단합니다.
   
2. **시계열 인덱싱 (B-Tree Indexing)**
   - `Test_Dropoff_Logs` 테이블에 `idx_test_dropoff_logs_created_at` B-Tree 인덱스가 적용되어 있습니다. 시계열 디버깅 쿼리 시 Full Table Scan 발동을 억제합니다. `[schema-01]`

3. **데이터 Retention 정책 제언**
   - `Test_Dropoff_Logs`는 1 row per Session으로 무한 증식하는 시계열 성격을 띱니다. **90일 이상 경과한 로깅 데이터는 PG_CRON 배치로 삭제(또는 Cold Storage 아카이빙)**할 것을 권장합니다.

---

## ⚙️ 3. RPC Function Signatures (Stored Procedure 명세)

> 프론트엔드가 직접 호출하는 모든 RPC 함수의 시그니처, 보안 속성, 내부 동작을 명세합니다.

### 3-1. `increment_test_participants(p_test_id text)`

| 속성 | 값 |
|---|---|
| **호출 시점** | `question.html` 진입 (`TestService.incrementParticipantCount`) |
| **Security** | `SECURITY DEFINER` (RLS 우회) |
| **내부 동작** | `INSERT ... ON CONFLICT (test_id) DO UPDATE SET participants_count = participants_count + 1` |
| **프론트엔드 멱등성** | `sessionStorage.getItem('${testId}_counted')` 체크 |
| **Grant** | `anon`, `authenticated` |

### 3-2. `increment_test_completions(p_test_id text)`

| 속성 | 값 |
|---|---|
| **호출 시점** | `result.html` 도달 (`TestService.incrementCompletionCount`) |
| **Security** | `SECURITY DEFINER` |
| **내부 동작** | `INSERT ... ON CONFLICT (test_id) DO UPDATE SET completions_count = completions_count + 1` |
| **프론트엔드 멱등성** | `sessionStorage.getItem('${testId}_completed_counted')` 체크 |
| **Grant** | `anon`, `authenticated` |

### 3-3. `log_test_dropoff(p_uuid text, p_test_id text, p_dwell_time integer)`

| 속성 | 값 |
|---|---|
| **호출 시점** | `visibilitychange` → `hidden` 이벤트 (`telemetry.js`, `fetch keepalive`) |
| **Security** | `SECURITY DEFINER` |
| **내부 동작** | `INSERT ... ON CONFLICT (uuid, test_id) DO UPDATE SET dwell_time = EXCLUDED.dwell_time, created_at = now()` |
| **프론트엔드 멱등성** | 동일 세션의 반복 핑은 Upsert로 최신 값 덮어쓰기 |
| **Grant** | `anon`, `authenticated` |

### 3-4. `cleanup_old_dropoff_logs() (PROCEDURE)`

| 속성 | 값 |
|---|---|
| **용도** | 90일이 지난 이탈 데이터를 청크 삭제하여 DB 블로트 방지 (Phase 3.3) |
| **Security** | `SECURITY DEFINER` (최고 시스템 로직 권한) |
| **내부 동작** | `DELETE ... WHERE created_at < NOW() - 90 days LIMIT 10000` 반복 (Batch Delete Loop) + `COMMIT;`을 통한 Auto-Vacuum 유발 |
| **Safety Cap** | 1일 1회 스케줄 당 최대 100만 건 하드캡(무한 루프 방어) |
| **Grant** | 없음 (API 무단 호출 방지를 위해 `REVOKE ALL` 처리) |

---

## 🔴 4. Deep Audit Findings (심층 감사 발견 사항)

> 소스 코드(`telemetry.js`, `testService.js`, `supabase_rpc_setup.sql`)와 본 스키마 문서 간의 교차 검증에서 발견된 모순 및 미흡 사항입니다.

### 4-1. 🚨 `dwell_time` 단위 모순 (Critical)

| 구분 | 실제 값 |
|---|---|
| `telemetry.js` 전송값 | `accumulatedTime` = `performance.now()` 기반 **밀리초(ms)** |
| `getPureDwellTime()` 반환값 | `Math.floor(total)` = **밀리초 정수** |
| 기존 문서 기술 | "순수 체류시간(**초**)" ← **모순** |
| SQL 컬럼 타입 | `integer` (단위 무관) |

**결론**: 실제 적재되는 값은 밀리초입니다. 본 문서 §2.2를 "밀리초(ms)" 단위로 수정 완료했습니다.  
**분석 쿼리 영향**: `AVG(dwell_time)` → `AVG(dwell_time) / 1000`으로 초 변환 필요.

### 4-2. 🚨 `testId` 하드코딩 (Critical — `telemetry.js` L29)

```javascript
// 현재 코드 (문제)
const testId = sessionStorage.getItem('dopamine_test_started') ? 'dopamine' : 'island_survival';
```

- `'island_survival'`이라는 값은 DB의 `test_id = 'island'`와 **불일치**합니다.
- 3번째 이상의 테스트(`demon`, `love` 등)에서는 항상 `'island_survival'`로 잘못 기록됩니다.
- **해결 완료**: Phase 2에서 `TestRunner.testId`를 동적으로 주입하도록 리팩토링 및 검증 완료.

### 4-3. `last_question_index` SQL/RPC 미반영 (Resolved)

- 문서(§2.2)에는 컬럼이 정의되었으나, **실제 SQL(`supabase_rpc_setup.sql`)에는 컬럼이 없고**, `log_test_dropoff` RPC 시그니처에도 `p_last_question_index` 파라미터가 없었습니다.
- **해결 완료**: Phase 1에서 ALTER TABLE 및 RPC 재생성 적용 완료, Phase 2 프론트엔드 연동 완료.

### 4-4. `getTestStats()` 무제한 SELECT

- `testService.js`의 `getTestStats()`가 `LIMIT` 없이 전체 행을 조회합니다.
- 현재 6개 테스트뿐이므로 문제가 없으나, 테스트 수가 100개 이상으로 늘어나면 불필요한 페이로드가 발생합니다.
- **해법**: 현재는 관찰 유지. 테스트 수 50개 초과 시 페이지네이션 도입.

### 4-5. Seed Data 무결성

- `supabase_rpc_setup.sql`의 Seed Data에서 `completions_count`가 모두 `0`입니다.
- `participants_count`는 SEO 초기값(5231 등)이 주입되어 있으나, 실제 완료자 수는 알 수 없는 상태입니다.
- **판정**: 설계 의도에 부합 (completions는 실서비스 이후에만 누적). 모순 아님.

---

## 🔎 5. Data Extraction SQL Library (추출 쿼리 라이브러리)

마케팅 부서, 기획자, 데이터 사이언티스트가 Supabase SQL Editor에서 직접 실행할 수 있는 **정제된 쿼리셋**입니다.

> ⚠️ `dwell_time`은 **밀리초(ms)** 단위로 적재됩니다. 초 단위 표시를 위해 `/ 1000` 변환을 적용합니다.

### 💡 Query 1: 완주율 및 이탈률 종합 리포트 (Funnel Analytics)

```sql
SELECT 
    test_id AS "테스트 명",
    participants_count AS "테스트 진입 유저 (Total Starts)",
    completions_count AS "결과 도달 유저 (Total Completions)",
    participants_count - completions_count AS "중도 이탈 유저 (Drop-offs)",
    ROUND((completions_count::numeric / NULLIF(participants_count, 0)) * 100, 2) || '%' AS "완주율 (Completion Rate)"
FROM 
    public."Test_Meta_DB"
ORDER BY 
    participants_count DESC;
```
**목적:** 어떤 테스트가 유저를 지루하게 만들어서(낮은 완주율) 중도 하차시키는지 파악.

---

### 💡 Query 2: 평균 체류시간 산출 (Engagement Retention)

```sql
SELECT 
    test_id AS "테스트 명",
    COUNT(uuid) AS "수집된 세션 수",
    ROUND(AVG(dwell_time) / 1000, 1) AS "평균 체류시간(초)",
    ROUND(MAX(dwell_time) / 1000, 1) AS "최대 체류시간(초)",
    ROUND(AVG(dwell_time) / 60000, 2) AS "평균 체류시간(분)"
FROM 
    public."Test_Dropoff_Logs"
WHERE 
    dwell_time > 0
GROUP BY 
    test_id
ORDER BY 
    AVG(dwell_time) DESC;
```
**목적:** 체류시간이 긴 테스트 = 유저 몰입의 증거. 광고 CPM 단가 협상 시 마케팅 데이터로 활용.

---

### 💡 Query 3: 급상승 트래픽 필터링 - 최근 24시간 즉각 이탈 세션 (Spike Debugging)

```sql
SELECT 
    uuid AS "익명 세션 ID",
    test_id AS "테스트 명",
    ROUND(dwell_time / 1000, 1) AS "나가기 직전 체류시간(초)",
    created_at AS "접속 시간"
FROM 
    public."Test_Dropoff_Logs"
WHERE 
    created_at >= NOW() - INTERVAL '24 hours'
    AND dwell_time <= 5000  -- 5초(5000ms) 이하 즉각 이탈
ORDER BY 
    created_at DESC
LIMIT 50;
```
**목적:** 밈/광고 유입 후 5초 만에 이탈한 무효 트래픽 사이즈 산정.

---

### 💡 Query 4: 문항별 이탈률 분석 (Micro-Funnel Question-Level Drop-off)

> ✅ `last_question_index` DB 컬럼 및 프론트엔드 연동이 모두 완료되어 즉시 사용 가능합니다 (Phase 1, 2 완료).

```sql
SELECT 
    test_id AS "테스트 명",
    last_question_index AS "이탈 문항 번호",
    COUNT(*) AS "이탈 세션 수",
    ROUND(AVG(dwell_time) / 1000, 1) AS "해당 문항 평균 체류시간(초)"
FROM 
    public."Test_Dropoff_Logs"
WHERE 
    last_question_index IS NOT NULL
    AND test_id = 'island'
GROUP BY 
    test_id, last_question_index
ORDER BY 
    "이탈 세션 수" DESC;
```
**목적:** "7번 문항에서 다 나가는구나!" 파악 → 해당 문항 텍스트 수정으로 완주율 극대화.

---

## 🛠️ 5.5. Data Lineage Flow (데이터 계보 흐름 요약)

1. **User Land (Browser)**
   - 랜딩 `index.html`: JSON-LD 스키마를 베이스로 CountUp 시작 → **SWR**로 `Test_Meta_DB` 조회해 애니메이션 연장 (Read Only)
   - 문항 `question.html`: 진입 즉시 `increment_test_participants` RPC 호출 → `participants_count` +1
   - 결과 `result.html`: 도달 즉시 `increment_test_completions` RPC 호출 → `completions_count` +1

2. **Network Layer (Supabase API)**
   - 오직 RPC를 타거나 Primary Key (`eq('test_id')`) 조회를 수행하여 API 비용 및 DB CPU 부하 최소화.
   - `sessionStorage` 멱등성 캐시를 발급해 연속 F5 연타 방어.

3. **Storage Layer (Postgres DB)**
   - `ROW LEVEL SECURITY`가 걸려있어 해커가 통계값을 임의 변조 불가능.
   - 인서트 시 `ON CONFLICT DO UPDATE`로 락(Lock)을 획득하여 병목 지연(Thrashing) 방지.
   - B-Tree Indexing(`created_at DESC`) 완료 배치.

---

## 🔐 5.7. Future-Proof Auth Architecture (향후 로그인 연동 가이드)

> 현재의 익명 세션(Anonymous Session) 기반 데이터 파이프라인을, 향후 로그인(Supabase Auth) 도입 시 매끄럽게 확장하는 데이터 엔지니어링 룰셋입니다.

### 5.7.1. 스키마 확장 전략 (Non-Destructive Migration)
기존 `Test_Dropoff_Logs` 테이블을 엎거나 마이그레이션할 필요가 없습니다. 익명 트래픽과 로그인 트래픽은 **병합 병렬 구조**를 가집니다.

```sql
-- 향후 로그인 도입 시 컬럼 1개만 추가
ALTER TABLE "Test_Dropoff_Logs" 
ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT NULL;
```

### 5.7.2. 분리 로깅 (Shadow Identity vs Authenticated User)
- **비로그인 유저**: 기존처럼 `session_uuid` 기반 매크로 퍼널 데이터(경험의 흐름, 문항별 이탈률)로 집계됩니다. (`user_id`는 `NULL`)
- **로그인 유저**: 브라우저 `session_uuid`와 함께 백엔드의 고정된 `user_id`가 페어링되어 적재됩니다.
- **분석적 이점**: 쿼리 하나만으로 **"회원(충성 유저)"의 이탈률과 "비회원(단순 유입 유저)"의 이탈률을 분리(Segment)하여 관찰**할 수 있습니다. 

### 5.7.3. 텔레메트리 페이로드 확장 (`telemetry.js`)
프론트엔드에서는 인증 토큰(Access Token)이 있으면 로깅 RPC 호출 시 `Authorization: Bearer <token>`을 태워 보냅니다. 백엔드(Supabase RPC)는 `auth.uid()` 함수를 통해 유저를 식별하고 `user_id` 컬럼에 자동 적재하게 됩니다. (즉, 페이로드에 `user_id`를 명시적으로 보낼 필요조차 없는 최고급 보안 구조입니다.)

---

## 🗺️ 6. Execution Roadmap (실행 로드맵)

> 현재 개발 상황과 난이도를 고려하여, 발견된 이슈를 **우선순위 순서대로** 해결합니다.

### Phase 1: 즉시 실행 가능 (난이도 ★☆☆, DB 마이그레이션)

| 순서 | 작업 | 파일 | 설명 |
|---|---|---|---|
| 1-1 | `last_question_index` 컬럼 추가 | Supabase SQL Editor | **[완료]** `ALTER TABLE "Test_Dropoff_Logs" ADD COLUMN ...` |
| 1-2 | `log_test_dropoff` RPC 시그니처 확장 | Supabase SQL Editor | **[완료]** 파라미터 추가 및 함수 재생성 |
| 1-3 | `supabase_rpc_setup.sql` 문서 동기화 | `docs/architecture/` | **[완료]** 위 변경사항을 SQL 파일에 통합 |

### Phase 2: 프론트엔드 리팩토링 (난이도 ★★☆) - 완료

| 순서 | 작업 | 파일 | 설명 |
|---|---|---|---|
| 2-1 | `telemetry.js` testId 하드코딩 제거 | `src/core/telemetry/` | **[완료]** 동적 `testId` 파라미터로 주입 |
| 2-2 | `telemetry.js` `last_question_index` 전송 | `src/core/telemetry/` | **[완료]** `sessionStorage` 캐시 추출 및 RPC 전송 |
| 2-3 | `validator.js` 기본값 제거 | `src/core/security/` | **[완료]** 하드코딩 제거 및 `TestRunner` 리팩토링 |

### Phase 3: 관찰 및 장기 과제 (난이도 ★★★)

| 순서 | 작업 | 설명 |
|---|---|---|
| 3-1 | Rate Limiting 도입 | Vercel Edge Middleware IP 기반 요청 제한 (§13 Shadow Ban 정책 참조) |
| 3-2 | `getTestStats()` 페이지네이션 | 테스트 수 50개 초과 시점에 도입 |
| 3-3 | Data Retention 배치 | **[완료]** PG_CRON(`cleanup_old_dropoff_logs`) 적용, 90일 경과 데이터 청크 삭제 아키텍처 수립 |

---

*이 공식 문서는 데이터 통합 처리 총괄 디렉터(@dataarchitecturedirector) 및 총괄 수석 엔지니어(@general-engineer)의 합동 감사 및 최종 승인을 거쳐 `docs/02_architecture/system` 폴더의 Master Registry로 동결 보관됩니다.*
