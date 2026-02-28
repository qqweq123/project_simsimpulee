---
title: Database Schema Design & Normalization
author: Data Architecture Director
created_date: 2026-02-25
last_updated: "2026-02-27"
status: Active
dependencies: ["supabase-postgres-best-practices", "database-schema-designer"]
---

# 02. 데이터베이스 스키마 설계 및 정규화 (Database Schema Design)

> **목적**: Mellow Wave 플랫폼의 근간이 되는 PostgreSQL(Supabase) 데이터베이스의 물리적 구조를 정의합니다. `database-schema-designer` 스킬의 철학에 따라 향후 빅데이터 분석과 시스템 확장에 유리하도록 스키마 분리(Schema Separation)와 JSONB 활용을 강제합니다.

---

## 1. 아키텍처 설계 원칙 (Design Principles)

1. **관심사 분리 (Separation of Concerns)**: 테스트 메타데이터(설문지), 유저 생성 데이터(결과 및 프로필), 그리고 통계용 이벤트 로그는 물리적으로 완벽히 격리된 테이블에서 관리되어야 합니다.
2. **JSONB의 적극적 활용 (NoSQL-like Flexibility)**: 질문 항목이나 가중치처럼 구조가 유동적이거나 읽기(Read) 작업이 압도적으로 많은 데이터는 정규화를 풀어 `JSONB` 컬럼에 통합하여 프론트엔드 Fetch 횟수를 최소화합니다.
3. **가명 정보 처리 (Anonymous Tracking)**: GDPR 등 개인정보보호법 준수를 위해, 회원 가입 이전의 트래픽은 이름이나 연락처 없이 브라우저 고유 식별자(`UUID`) 기반으로만 수집합니다.

---

## 2. 핵심 テーブル 스키마 (Core Table Schemas)

### A. Test_Meta_DB (`tests_metadata`)
테스트의 뼈대 정보를 담은 불변(또는 관리자만 수정하는) 테이블입니다. 잦은 Join을 피하기 위해 *JSONB를 활용*합니다.

| Column Name | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK, Default `uuid_generate_v4()` | 테스트 고유 ID |
| `slug` | `text` | Unique, Not Null | URL용 식별자 (예: `island`, `tarot`) |
| `title` | `text` | Not Null | 테스트의 공식 명칭 |
| `hashtags` | `text[]` | | 검색 및 트렌드 분석을 위한 해시태그 캐싱 컬럼 |
| `content_data` | `jsonb` | Not Null | 질문 목록, 선택지, 가중치, 해설 텍스트 등을 통째로 담은 직렬화 데이터. |
| `is_active` | `boolean` | Default `true` | 서비스 노출 여부 |
| `created_at` | `timestamptz` | Default `now()` | 생성일시 |

> 💡 **최적화 포인트**: `content_data` 내부의 특정 키셋을 검색할 일이 많다면 GIN 인덱스(`CREATE INDEX idx_tests_content ON tests_metadata USING GIN (content_data);`)를 적용합니다. 단, 보통 프론트엔드에서 `slug`로 1회 Fetch 후 랜더링하므로 B-Tree 인덱스(`slug`)가 더 중요합니다.

### B. User_Result_DB (`user_results`)
사용자가 테스트를 완료하고 최종 도출된 결과를 저장하는 핵심 테이블입니다. (유저 파라미터 보관용)

| Column Name | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK, Default `uuid_generate_v4()` | 결과 데이터 고유 ID |
| `user_session_id` | `uuid` | Not Null, (FK to `users.id` if authenticated) | 브라우저 또는 회원 고유 UUID |
| `test_id` | `uuid` | FK to `tests_metadata.id` | 응시한 테스트 ID |
| `result_type` | `text` | Not Null | 최종 도출된 결과 타입 (예: `leader`) |
| `personal_param`| `text` | | 결과 기반 고유 파라미터 (예: `6xxx24sx`) 향후 마이페이지 활용 |
| `utm_source` | `text` | | 유입 경로 (카카오, 인스타그램 등) |
| `is_shared` | `boolean` | Default `false` | 유저가 결과 공유 버튼을 눌렀는지 여부 |
| `created_at` | `timestamptz` | Default `now()` | 테스트 완료 일시 |

> 💡 **다중 테스트(어뷰징) 보정 로직**: 동일한 `user_session_id`와 `test_id` 조합의 데이터가 삽입될 때, `created_at` 기준으로 첫 번째와 두 번째(최대)까지만 코어 데이터로 인정하며, 초과분은 뷰(View) 쿼리에서 필터링하거나 별도의 흥행 카운터용 통계 테이플로 논리적 분리를 진행해야 합니다.

### C. Event_Log_DB (`event_logs`)
문항별 체류 시간, 이탈률 극빈 구역 등을 파악하기 위한 행동 추적(Telemetry) 테이블입니다.

| Column Name | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | `bigint` | PK, Identity Generation | 로그의 높은 쓰기 빈도를 감안한 시퀀스 ID |
| `user_session_id` | `uuid` | Not Null | 브라우저 고유 UUID |
| `test_id` | `uuid` | FK to `tests_metadata.id` | 진행 중인 테스트 ID |
| `question_index`| `smallint` | | 현재 유저가 위치한 문항 번호 |
| `dwell_time_ms` | `integer` | | 체류 시간 (밀리초) - `document.hidden` API로 보정된 순수 시간 |
| `event_type` | `text` | Not Null | `start`, `answer`, `drop`, `share_click` 등 |
| `created_at` | `timestamptz` | Default `now()` | 로그 발생 일시 |

> 💡 **최적화 포인트**: 이 테이블은 쓰기가 폭주(Write-heavy)하므로 파티셔닝(예: 시간/월 단위) 설계를 고려해야 합니다. 또한, 인간이 아닌 봇(Bot)의 트래픽을 거르기 위해 클라이언트 측에서 삽입한 Honeypot 변수가 활성화된 채 들어온 로그는 Supabase API 단발성 Insert 단계에서 즉각 폐기(Drop)되어야 합니다.
