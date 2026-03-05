# 🏝️ 무인도 생존 테스트 (Island Test) 종합 기능 명세 및 아키텍처 개념도

본 문서는 Mellow Wave의 표준 템플릿(Blueprint)으로 승격된 `island_test`에 적용된 모든 프론트엔드, 백엔드, 데이터 공학, 보안 기능들을 총망라한 요약 개념도입니다. 기술 부채가 없는 가장 선진화된 아키텍처 요소를 집대성했습니다.

---

## 1. 아키텍처 및 코어 엔진 (Architecture & Core Engine)
**레거시의 스파게티 절차 지향 코드를 엔터프라이즈급 객체 지향 계층(Tier)으로 분리한 핵심 엔진부입니다.**

- **FSD (Feature-Sliced Design) 패턴 적용**:
  `island` 폴더 내부에는 순수 문항/결과 데이터(`data.js`)만 존재하고, 계산식과 렌더링 로직은 중앙 집중 프레임워크인 `src/core/engine/`으로 스크립트를 완전 분리했습니다.
  - `TestRunner` (진행 및 페이지 라우팅 엔진)
  - `ScoreCalculator` (다이내믹 점수 및 조합 계산기)
  - `ResultRenderer` (그래프 및 UI 페인트 엔진)
- **State Recovery (상태 복구 & FOUC 방지)**:
  매 문항 클릭 사이클 시 현재 문항 인덱스와 누적 점수를 `sessionStorage`에 초고속 캐싱합니다. 유저가 실수로 '새로고침'을 누르거나 모바일 메모리 최적화로 탭이 리프레시되더라도 1페이지로 돌아가지 않고 마지막으로 풀던 문항 화면을 즉각 복원(Rehydration)하여 UX 이탈을 100% 방어합니다.
- **Background Prefetching (사전 탑재/Waterfall 해소)**:
  테스트 종료 직전(전체 문항 - 2 위치 / Idle Time)에 '추천 테스트 배너 이미지' 및 결과 JSON API 데이터를 백그라운드에서 메모리에 선로딩(`<link rel="preload">`)합니다. 결과 페이지 진입 시 이미지가 늦게 뜨거나 레이아웃이 덜컥 밀리는 현상(CLS)을 완벽하게 해소했습니다.

---

## 2. 데이터 공학 및 텔레메트리 (Data Engineering & Micro-Funnel)
**정확하고 안전한 통계 적재와 부하 없는 파이프라인 처리에 집중했습니다.**

- **Micro-Funnel (마이크로 퍼널) 텔레메트리**:
  단순 페이지 조회수(Page View)가 아닌, 브라우저 탭 이동이나 종료(`visibilitychange`) 시점의 순수 체류 시간(`dwell_time`)과 이탈 직전 문항 번호(`last_question_index`)를 Supabase RPC로 전송(`fetch keepalive`)합니다.
  - 이 데이터는 iOS Safari 강제 종료 시점에서도 유실 없이 전송됩니다.
- **SWR (Stale-While-Revalidate) 동기화 전략**:
  초기 랜딩 시 무거운 DB 쿼리(SELECT)를 날리는 대신, JSON-LD 등에 캐싱된 `participant_counts`(참여자 수)로 애니메이션을 즉시(Stale) 시작시키고, 백그라운드에서 DB의 정확한 수치를 동기화해 부드럽게 스무딩 업데이트(Revalidate) 처리합니다. DB 부하(Thundering Herd 병목)를 원천 차단합니다.
- **Starts vs Completions 완주율 분리 이원화**:
  단순 트래픽(마케팅 부풀리기용 `participants_count`) 카운트 방식과 품질 분석용(순수 완주자 `completions_count`) 결괏값을 DB 컬럼부터 프론트엔드 함수(`TestService.js`)까지 완벽하게 스키마 분리(Segmentation)했습니다.

---

## 3. 보안 및 거버넌스 (Security & Governance)
**해커의 DB 임의 조작 및 매크로 트래픽을 허용하지 않는 무결점 아키텍처입니다.**

- **Honeypot (허니팟) 봇 트래픽 1선 필터링**:
  화면에 보이지 않는(CSS `visually-hidden`) 함정 필드를 1번 문항에 배치해 둡니다. 입력 속도가 비정상적이거나 이 필드를 건드리는 매크로/악성 봇의 결과 제출을 서버 전송 전 1선 차단하고 메인 씬으로 튕겨냅니다(`isBotTraffic()`).
- **RESTRICT RLS 및 RPC 캡슐화**:
  보안 정책상 프론트엔드가 데이터베이스 테이블 무결성을 직접 건드리는(직접 `INSERT`/`UPDATE` 쿼리 발송) 것을 금지했습니다. 모든 통계 카운트 카운트업 및 이탈 로깅은 캡슐화된 `SECURITY DEFINER` 권한 기반의 내부 프로시저(`Supabase RPC`)를 거쳐서만 제어되며, 해킹 및 레이스 컨디션을 방어합니다.
- **프론트엔드 멱등성 보장 (Idempotency Passport)**:
  사용자가 결과 화면에서 F5(새로고침)를 연타하여 사이트 참여자 수가 비정상적으로 뻥튀기(Abuse)되지 않도록, 최초 진입/완주 시 `sessionStorage`에 검증 플래그를 발급해 이후의 중복 RPC 호출을 원천 스킵합니다.

---

## 4. UI/UX 렌더링 최적화 및 광고 뷰어빌리티 (Rendering & UX)

- **Pre-Baked WebP 텍스처 (렌더링 최적화)**:
  디자이너의 CSS 블렌드 무거운 연산(`mix-blend-mode: multiply`)을 덜어내기 위해 배경색과 질감 텍스처(종이, 모래 등)가 이미 합쳐진(Baked) 최적화된 하나의 WebP 무손실 압축 이미지를 제작했습니다. 이를 CSS `background-size: cover` 형태로 Tiling 적용해 저사양 모바일 기기에서의 발열 및 렌더 버벅임을 종식시켰습니다.
- **전면 광고 (Interstitial Ad) 캡슐레이션 스테이지**:
  테스트의 모든 객체 응답(클릭)이 끝난 시점, 결과가 즉시 산출되지 않고 강제 3초 딜레이의 '로딩 화면' 컨테이너가 삽입됩니다(`TestRunner.handleInterstitialAd()`). 유저의 궁금증과 몰입감을 극한으로 올림과 동시에, 가장 시선이 고정되는 CPM 단가가 높은 전면 광고를 매핑할 수 있는 최적의 UI 컨테이너입니다.
- **Full-Bleed 다형성 추천 배너 아키텍처**:
  기존의 단순 버튼 목록이 아니라 최첨단 Image-Driven 객체 구조(`bannerUrl`, `targetUrl`, `width/height` 고정형) 모델을 탑재했습니다. `-mx-8` 네거티브 마진으로 모바일 디스플레이 모서리를 가득 채우는 트렌디한 추천 UI가 구현되었습니다.

---

## 5. SEO (검색엔진 최적화) 및 마케팅 전략 기반

- **JSON-LD 마이크로데이터 구조 주입**:
  페이지 구조상에 `<script type="application/ld+json">` 소프트웨어 애플리케이션 명세를 추가하여, 구글 검색 봇이 메타데이터(참여자 수, 평점, 제목 등)를 검색 결과 창(SERP)에 직접 풍부하게 노출토록 유도했습니다.
- **핵심 랜딩 페이지 권위(PageRank) 집중화**:
  수많은 테스트의 `question.html` 및 `result.html`에는 과감하게 접근 차단(`noindex`, `nofollow`) 처리를 하고 모든 트래픽의 크롤링 권위를 메인 진입 `index.html`에 집중하여 검색 랭킹 효율을 최고 수준으로 끌어올렸습니다. (`robots.txt`, `sitemap.xml` 완전 제어)
- **통합 URL 및 OpenGraph Share 모듈 (`core/share.js`)**:
  지금까지 각 테스트에 난립해 있던 "공유하기" 기능 코드를 버리고 단 하나의 허브인 `share.js`에 통합했습니다. OG 이미지(썸네일), 설명문, SEO 친화적인 `?utm_source=share` 꼬리표 파라미터를 자동으로 치환하여 어떤 SNS에도 완벽하게 일관성 있는 메시지를 뿌립니다.
