# Mellow Wave: Master Data Architecture & Governance Guideline

**최종 수정 일시**: 2026-02-27 18:20 (KST)
**작성자**: Mellow Wave 데이터 통합 처리 총괄 디렉터 (Data Architecture Director)
**문서 상태**: SSOT (Single Source of Truth) - 통합 마스터 문서

> **목적**: 본 문서는 기존에 파편화되어 있던 통합 표준 규격서(`standard_architecture_guide.md`), 로드맵(`phase2_advanced_architecture_roadmap.md`), 실행 명세서(`phase2_execution_plan.md`)를 데이터 거버넌스 및 엔터프라이즈 아키텍처 관점에서 단일 진실의 공급원(SSOT)으로 완전히 통합한 문서입니다. `phase2_implementation_log.md` 등의 실무 징수 명세서는 별도로 이관되었으며, 본 문서는 전체 시스템의 설계 지침이자 데이터베이스(Supabase) 구조의 검증 기준으로 작용합니다.

---

## Chapter 1. 프론트엔드 및 데이터 파이프라인 표준 규격 (Foundation) - [완료] (완료일자: 2026-02-27)

모놀리식 하드코딩 환경에서 벗어나, Data-Driven 및 서버리스(Serverless) 파이프라인으로 전환한 프론트엔드 기저 아키텍처입니다.

*   **에셋 최적화 (WebP & CDN)**: 모든 비트맵 레이어는 무거운 PNG 형태를 버리고, `sharp` 크롭 파이프라인을 거쳐 극단적으로 압축된 `WebP` 포맷으로 트랜스포밍된 후 Supabase CDN(`test_image` 버킷)에서 글로벌 분산 캐싱됩니다.
*   **이미지-드리븐 모듈화**: 프론트엔드의 하드코딩 텍스트를 JSON 스키마 기반 배열(`hotContentsMock`)로 100% 분리하여, 빌드 사이클 없이 PM/마케터가 CDN 경로만으로 UI를 실시간 업데이트할 수 있게 되었습니다.
*   **하이브리드 풀-블리드 레이아웃 (V9)**: 모바일 사용성을 극대화하기 위해 추천 배너 영역을 화면 양면 끝까지 찢는`-mx-8` 네거티브 마진과 `rounded-2xl` 라운드 모서리를 강제 규격화(1200x330 파노라마)했습니다.

> 🛡️ **[Data Director 리뷰 & 보완점]**:
> *   **데이터 분석 이슈**: 프론트엔드 이미지 파이프라인은 완벽하게 이관되었으나, 현재 CDN의 Cache Hit Ratio 동향 측정이나 대역폭(Bandwidth) 모니터링 체계가 미비합니다.
> *   **보완 전략 (Cost Optimization)**: Supabase Storage 대시보드와 클라우드 워치독을 연동하여 가장 조회가 덜 되는 구형 배너 에셋은 Cold Storage로 자동 이관(Archiving)시키는 생명주기(Lifecycle) 규칙 도입이 필요합니다.

---

## Chapter 2. 코드 검토 및 보안/템플릿 구조화 (Code Refactoring & Security) - [완료] (완료일자: 2026-02-27)

*   **모듈 단위 분할 (Separation of Concerns)**: 단일 자바스크립트에 난립하던 로직을 `core/` (연산, 렌더링, 검증) 및 `utils/` (텔레메트리, 허니팟) 디렉터리로 팩토리얼 분할했습니다.
*   **상태 무결성 검증 (Viral By-Pass)**: `validator.js`를 통해 URL 쿼리의 `mode`를 파싱합니다. 직접 시험을 푸는 자(`mode=owner`)에게는 엄격한 `sessionStorage` 증명서를 요구하되, 지인의 링크로 획득된 신규 유입자(`mode=viewer`)에게는 검증을 프리패스(By-pass)하여 접근 차단율을 0%로 만들었습니다.

> 🛡️ **[Data Director 리뷰 & 보완점]**:
> *   **데이터 보안 이슈**: 현재 세션 증명서로 발급되는 키(`island_test_started`)는 평문 텍스트입니다. 클라이언트 사이드 변조 위험이 일부분 남아있습니다.
> *   **보완 전략 (Data Governance)**: JWT(JSON Web Token) 혹은 HMAC 암호화 해시 서명을 부여하여 브라우저 로컬 스토리지의 위변조(Tampering)를 원천 차단하는 PII(개인정보 식별불가) 암호화 전략의 엣지 도입을 권장합니다.

---

## Chapter 3. 전면적 데이터베이스화 및 SEO 엣지 함수 (Database & Edge) - [완료] (완료일자: 2026-02-27)

Mellow Wave의 핵심 자산인 데이터를 Supabase PostgreSQL 환경으로 완벽히 마이그레이션했습니다.

*   **3-Tier 스키마 구조 (SSOT)**: 
    1.  `Test_Meta_DB`: 문항, 가중치, 해설은 조인(Join) 성능을 아끼기 위해 JSONB 필드 단일 컬럼에 욱여넣어 NoSQL의 장점을 취했습니다.
    2.  `User_Result_DB`: 코어 데이터 타겟.
    3.  `Event_Log_DB`: Dwell Time을 포함한 로그 전용 버킷 팩토리.
*   **보안 아키텍처 (RLS & Gatekeeper)**: Data Governance의 기본 원칙을 수호하기 위해 브라우저 발급 익명키(Anon Key)의 인서트 통로인 Row Level Security(RLS)를 "100% 차단(Deny All)" 했습니다. 오직 권한을 위임받은 DB 내부의 `log_user_result` (SECURITY DEFINER) RPC 프로시저를 통해서만 트랜잭션이 한 줄씩 통과됩니다.
*   **SEO 서버리스 렌더링**: 자바스크립트를 지원하지 않는 카카오/페북 크롤러 봇에 대응하여, Supabase Deno 환경의 `seo-render` 엣지 함수를 배치해 순수 HTML 오픈그래프(OG Tag)를 동적으로 주입하고 있습니다.

> 🛡️ **[Data Director 리뷰 & 보완점]**:
> *   **데이터 품질 무결성 이슈**: JSONB 필드 사용은 스키마 리스너 관리에 뛰어나지만, 프론트에서 잘못된 Key값으로 JSON을 주입 시 구조가 붕괴됩니다.
> *   **보완 전략 (Data Quality Management)**: PostgreSQL 내부에 JSON 스키마 벨리데이션(Schema Validation) 체크 제약조건(Check Constraints)을 추가하여 쓰레기값 삽입을 DB 차원에서 에러로 팅겨내는(Rejection) 무결성 보존 룰셋이 시급합니다.

---

## Chapter 4. 극정밀 텔레메트리 엔진 및 어뷰징 쉴드 (Telemetry & Anti-Abuse) - [완료] (완료일자: 2026-02-27)

순도 100%의 분석 리포트를 창출하기 위한 공학적 필터링 거름망입니다.

*   **체류 시간 왜곡 방지 (Visibility API)**: 유저가 다른 탭으로 가거나 스마트폰을 내릴 때 타이머를 정지하는 `document.hidden` 기반의 순수 고민 시간(Dwell Time) 측정 로직. 최대 10분의 Max Capping을 적용해 아웃라이어를 거뒀습니다.
*   **허니팟 (Honeypot Trap)**: 시각 장애인 리더기도 읽을 수 없게 `aria-hidden` 처리된 CSS 은닉형 `<input>`을 주입하여, 무지성 크롤러 봇이 클릭하는 순간 해당 트래픽을 데이터베이스 적재 직전 즉각 Drop 시켜 쓰레기 데이터를 걸러냅니다. (자사 QA 봇을 위한 `x-agent-bypass` 쿠키 패스 포함).

> 🛡️ **[Data Director 리뷰 & 보완점]**:
> *   **비용 및 리소스 이슈**: 유저가 완주하지 않고 중도 이탈(Drop-off) 할 경우 `pagehide` 이벤트를 통해 상태가 비동기 로깅됩니다. 그러나 악의적인 봇넷(DDoS)이 지속적으로 이벤트를 쏠 위험이 존재합니다.
> *   **보완 전략 (Cost Optimization)**: Application 레벨에서 허니팟을 잡는 것을 넘어, Supabase API Gateway 측에 Rate Limiting (IP당 1분 내 접속 한도) 정책을 도입해 불필요한 컴퓨팅 연산 호출 대금을 통제해야 합니다.

---

## Chapter 5. 공유/추천 로직 확충 (Recommendation & UX) - [완료] (완료일자: 2026-02-27)

*   **바이럴 어트리뷰션 무결성 보장 (UTM Caching)**: 공유 링크 최초 진입 유저의 UTM 파라미터가 소실되지 않도록, 최상단에서 URL 파편을 캐치하여 `sessionStorage`에 Pin(기명)합니다. DB 징수 단계에서 이 캐시를 전송해 유입 경로 마스킹을 막습니다.
*   **6-SNS 풀 라인업 및 타켓 СUI**: 타겟 본인(`owner`)에게는 카카오, 인스타, 페북, 쓰레드, X, URL복사라는 6개의 폭발적인 공유 SVG 네이티브 버튼 진열을 제공하고, 타고 들어온 유저(`viewer`)에게는 이를 통째로 교체해 단 하나의 "나도 테스트 시작하기" CTA 라벨을 부여해 군중 이탈을 제어했습니다.

> 🛡️ **[Data Director 리뷰 & 보완점]**:
> *   **데이터 계보 분석 이슈**: 현재 `utm_source` 컬럼 하나로 바이럴 기여자를 잡고 있어 카카오에서 온지 인스타에서 온지만 판별 가능합니다.
> *   **보완 전략 (Data Lineage)**: 어떤 UUID를 가진 유저가 시작한 링크 사슬인지 K-Factor를 정밀 추적하기 위해 공유 URL에 `?inviter=uuid` 파라미터를 추가하고 이를 DB의 `parent_user_uuid` 컬럼으로 트래킹하는 Network Node Analysis 아키텍처 수립이 수반되어야 합니다.

---

## Chapter 6. 차기 로드맵 (Phase 3 Parked Items) - [미완료]

*   **[미완료]** 이탈률(Drop-off) 방지 맞춤형 UI 구조 설계 및 미시 체류시간 조정.
*   **[미완료]** 데이터 마트(Data Mart) 연결: Supabase에 수집된 Event_Log_DB들을 BigQuery나 Redash로 복제 파이프라인(ELT)을 뚫어 마케터가 쿼리 없이 시각화 볼륨을 볼 수 있는 대시보드 구축.
*   **[미완료]** 조합형 공감성 증대 로직 적용.

> 🛡️ **[Data Director 코멘트]**: 차기 로드맵들은 데이터 활용(Data Enablement)의 방점에 서 있습니다. ETL 파이프라인 구축을 위한 인스턴스 설계 및 DBT 툴 체인 도입을 선제적으로 연구해야 합니다.
