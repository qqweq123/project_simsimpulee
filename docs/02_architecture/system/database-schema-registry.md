---
title: "Mellow Wave Database Schema & Extraction Registry"
author: "Director of Data Architecture"
last_updated: "2026-03-01"
status: "Active"
tags: ["Supabase", "Data Architecture", "SQL", "ETL", "Schema"]
---

<!-- فایل 기능 서술: Mellow Wave 플랫폼의 중앙 데이터베이스(Supabase) 스키마 정의 및 트래픽 분석을 위한 원시 데이터 추출(Extraction) 쿼리들에 대한 데이터 공학적 마스터 명세서입니다. -->

# 🗄️ Database Schema & Extraction Registry

데이터 통합 처리 총괄 디렉터(@dataarchitecturedirector) 및 Mellow Wave 데이터 거버넌스 원칙에 입각하여 작성된 **단일 진실 공급원(SSOT, Single Source of Truth)** 문서입니다. 

본 문서는 `Test_Meta_DB` 및 텔레메트리 파이프라인의 설계 철학, 테이블 명세, 그리고 실무진 및 분석 조직에서 곧바로 활용할 수 있는 **데이터 추출(Extraction) 쿼리 라이브러리**를 제공합니다.

---

## 🏗️ 1. Architecture Philosophy (설계 철학)

1. **지표의 분리 (Separation of Metrics)**: 바이럴 마케팅 목적의 **'단순 진입(Starts)'** 트래픽과 서비스 품질 분석 목적의 **'실제 완료(Completions)'** 트래픽을 데이터베이스 컬럼 설계 단계부터 원천 분리했습니다. 
2. **보안 및 무결성 제어 (RLS & RPC)**: 프론트엔드가 직접 DB 컬럼을 수정(`Update`)하는 것을 원천 차단했습니다. 모든 데이터는 Postgres Stored Procedure(`RPC`)를 통해서만 단방향(One-way)으로 누적되며 경합 조건(Race Condition) 시 원자성(Atomicity)을 잃지 않습니다. `[lock-01]` `[security-01]`

---

## 📊 2. Table Specifications (테이블 명세)

### 2.1. `Test_Meta_DB` (핵심 통계 마스터 테이블)

| Column Name | Type | Key | Default | Description & Lineage |
| :--- | :--- | :--- | :--- | :--- |
| **`test_id`** | `text` | **PK** | - | 테스트 고유 마이크로-엔드포인트 (e.g., `island`, `dopamine`, `love`). O(1) 포인트 스캔 인덱스 채용. |
| **`participants_count`** | `bigint` | | `0` | **[Public/Marketing]** 문항 1페이지 진입 즉시 트리거 누적. 랜딩 페이지 카운터 연동 노출 값. |
| **`completions_count`** | `bigint` | | `0` | **[Internal/Raw]** 결과지 페이지(`result.html`) 도달 시에만 누적되는 폐쇄형 통계 값. |
| **`created_at`** | `timestamp(tz)` | | `now()` | 레코드 최초 생성(인서트) 시간 |

### 2.2. `Test_Dropoff_Logs` (이탈률/체류시간 로깅 테이블)

| Column Name | Type | Key | Default | Description & Lineage |
| :--- | :--- | :--- | :--- | :--- |
| **`uuid`** | `text` | **PK (복합)** | - | 사용자의 브라우저 세션 UUID. |
| **`test_id`** | `text` | **PK (복합)** | - | 해당 세션이 수행 중인 테스트 ID. |
| **`dwell_time`** | `integer` | | - | 마지막 이벤트에서 기록된 순수 체류시간(초). 비동기 비콘으로 동일 세션 핑(Ping)이 오면 덮어씁니다(Upsert). |
| **`created_at`** | `timestamp(tz)` | | `now()` | 마지막 갱신 시간 (시간순 이탈 트렌드 분석용). |

*보안 속성*: `Test_Dropoff_Logs`는 RLS가 `RESTRICT` 에 준하게 설정되어 있으며 오직 `log_test_dropoff` RPC(SECURITY DEFINER)를 통해서만 안전하게 Upsert 됩니다.

### 2.3. Data Lifecycle & Indexing (데이터 수명 주기 및 인덱싱)

1. **데이터 캡핑(Outlier Capping)**
   - `telemetry.js` 단에서 브라우저를 켜두고 잠수타는 허수 유저(Outlier)를 막기 위해 최대 체류시간을 **10분(600초)**으로 하드 리미트(Hard Limit) 걸어 데이터 오염을 1선에서 차단합니다.
   
2. **시계열 인덱싱 (B-Tree Indexing)**
   - `Test_Dropoff_Logs` 테이블에 `idx_test_dropoff_logs_created_at` B-Tree 인덱스가 적용되어 있습니다. 이를 통해 시계열 디버깅 쿼리 시 Full Table Scan 발동을 억제합니다. `[schema-01]`

3. **데이터 Retension 정책 제언**
   - `Test_Dropoff_Logs`는 1 row per Session으로 무한 증식하는 시계열 성격을 띱니다. 데이터 스토리지 최적화를 위해 PG_CRON이나 Supabase Edge Function을 활용해 **"생성된지 90일이 지난 로깅 데이터는 삭제(또는 Cold Storage로 아카이빙)하는 정책"**을 추후 배치 작업으로 도입할 것을 권장합니다.

---

## 🔎 3. Data Extraction SQL Library (추출 쿼리 라이브러리)

마케팅 부서, 기획자, 데이터 사이언티스트가 경영 지표 및 프로덕트 결함을 분석하기 위해 Supabase SQL Editor에서 직접 실행할 수 있는 **정제된 쿼리셋**입니다.

### 💡 Query 1: 완주율 및 이탈률 종합 리포트 분석 (Funnel Analytics)
> 가장 핵심이 되는 경영 지표 쿼리입니다. 각 테스트마다 시도한 사람 대비 끝까지 살아남은 사람의 퍼센티지(Drop-off rate)를 산출합니다.

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
**목적:** 어떤 테스트가 유저를 지루하게 만들어서(낮은 완주율) 중도 하차시키는지 파악하여 문항 수나 타겟 수정(Growth Hacking)에 활용합니다.

---

### 💡 Query 2: 평균 체류시간 산출 (Engagement Retention)
> 사용자가 얼마나 앱에서 오래 머물렀는지(Engagement) 평가합니다. 이탈 로그 테이블(Dropoff Logs)을 쿼리합니다.

```sql
SELECT 
    test_id AS "테스트 명",
    COUNT(uuid) AS "수집된 세션 수",
    ROUND(AVG(dwell_time), 1) AS "평균 체류시간(초)",
    MAX(dwell_time) AS "최대 체류시간(초)",
    ROUND(AVG(dwell_time) / 60, 2) AS "평균 체류시간(분)"
FROM 
    public."Test_Dropoff_Logs"
WHERE 
    dwell_time > 0 -- 유효 세션만 카운트
GROUP BY 
    test_id
ORDER BY 
    AVG(dwell_time) DESC;
```
**목적:** 페이지에 머무르는 시간이 긴 테스트일수록 유저가 몰입했다는 증거이며, 하단부 광고 배너(CPM) 단가 협상 시 강력한 마케팅 데이터로 활용할 수 있습니다.

---

### 💡 Query 3: 급상승 트래픽 필터링 - 최근 24시간 미완료 이탈 세션 (Spike Debugging)
> `completions` 통계와 별개로, 체류시간 스냅샷을 기반으로 누가 어디서 나갔는지 원시 데이터를 조회합니다.

```sql
SELECT 
    uuid AS "익명 세션 ID",
    test_id AS "테스트 명",
    dwell_time AS "나가기 직전 체류시간(초)",
    created_at AS "접속 시간"
FROM 
    public."Test_Dropoff_Logs"
WHERE 
    created_at >= NOW() - INTERVAL '24 hours'
    -- 예: 특정 체류시간(예: 5초 이하)의 즉각 이탈 매크로/봇/오진입 골라내기
    AND dwell_time <= 5
ORDER BY 
    created_at DESC
LIMIT 50;
```
**목적:** 특정 밈이나 광고(X, Instagram)를 통해 유입되었으나 내용이 기대와 달라 5초 만에 뒤로가기를 누른 무효 트래픽 사이즈를 산정합니다.

---

## 🛠️ 4. Data Lineage Flow (데이터 계보 흐름 요약)

1. **User Land (Browser)**
   - 랜딩 `index.html`: SEO용 JSON 스키마를 베이스로 `<CountUp>` 시작 -> **SWR**로 `Test_Meta_DB` 조회해 애니메이션 연장 (Read Only)
   - 문항 `question.html`: 진입 즉시 `increment_test_participants` RPC 호출 -> `participants_count` +1
   - 결과 `result.html`: 도달 즉시 `increment_test_completions` RPC 호출 -> `completions_count` +1

2. **Network Layer (Supabase API)**
   - 오직 RPC를 타거나 Primary Key (`eq('test_id')`) 조회를 수행하여 API 비용 및 DB CPU 부하 최소화.
   - `sessionStorage` 멱등성 캐시를 발급해 연속 F5 연타 방어.

3. **Storage Layer (Postgres DB)**
   - `ROW LEVEL SECURITY` 가 철저히 걸려있어 해커가 통계값을 임의 변조하는 것 불가능. 
   - 인서트 시 무조건 `ON CONFLICT DO UPDATE` 로 락(Lock)을 획득하여 병목 지연(Thrashing) 방지.
   - 대규모 쿼리 스파이크에 대응하기 위한 B-Tree Indexing(`created_at DESC`) 완료 배치.

*이 공식 문서는 데이터 통합 처리 총괄 디렉터의 최종 검토 및 승인을 거쳐 `docs/02_architecture/system` 폴더의 Master Registry로 동결 보관됩니다.*
