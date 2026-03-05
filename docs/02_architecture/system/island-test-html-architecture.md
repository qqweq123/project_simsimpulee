# 🏝️ Island Test HTML DOM 트리 및 렌더링 파이프라인 설계도

본 문서는 `island_test` 템플릿의 HTML 코드 블록이 위에서 아래로(Top-Down) 브라우저에 파싱(Parsing)되는 순서에 입각하여, 각 태그에 숨겨진 구조적 목적과 설계 철학을 해부한 개념도입니다.

---

## 1. `<!DOCTYPE html>` ~ `<head>` : 검색엔진 통제 및 메타데이터 주입

문서의 뼈대가 세워지기 전 브라우저와 크롤러 봇에게 우선순위를 하달하는 관제탑 영역입니다.

1. `<!DOCTYPE html>` & `<html lang="ko">`:
   최신 HTML5 표준 선언 및 한국어 타겟 구글봇(Googlebot) SEO 랭킹 가중치 부여.
2. `<meta name="robots">` (트래픽 깔때기 🌟):
   - **`index.html`**: `index, follow` (네이버/구글 크롤러 대환영, 링크 타고 뻗어나가라).
   - **`question/result.html`**: `noindex, nofollow` (검색 노출 차단. 중복 문서 페널티를 막고 PageRank를 오직 `index.html` 진입점 하나로 영혼 끌어모으기).
3. `<meta property="og:...">` & `<meta name="twitter:...">` (바이럴 명함 🌟):
   카카오톡이나 X에 링크 복붙 시 뜨는 '썸네일/제목/설명'의 원천 소스. 현재 Supabase CDN URL 베이킹 이미지(`hero_campfire.webp`)가 미리 캐싱되어 0.1초 만에 로드됨.
4. `<script type="application/ld+json">` (SEO 치트키 🌟):
   브라우저 화면엔 보이지 않지만 구글 검색 결과창(SERP)에 "★ 5.0 (5,231명 참여)" 같은 리치 스니펫 데이터를 꽂아 넣기 위한 `SoftwareApplication` / `InteractionCounter` 스키마 템플릿.

---

## 2. `<link>` & `<style>` : 렌더링 블로킹 파일과 CSS 체계

1. **외부 에셋 연결 (Pre-connect & Tailwind)**:
   `preconnect`를 통해 구글 폰트 서버와 DNS 핸드셰이크를 선행. `cdn.tailwindcss.com` 스크립트 연결을 통해 유틸리티 클래스 기반 디자인 시스템 호출.
2. **사내 CSS 스토어 (`main.css` & `island.css`)**:
   디자인 시스템(BEM/Utility 혼합)을 가져옴. 오버헤드를 막기 위해 `mix-blend-mode` 대신 Pre-Baked 된(자체 질감 합성이 완료된) WebP 형태의 타일링(Tiling) 배경 텍스처를 적용.
3. **태그 내 `<style>` (핵심 Keyframes)**:
   `fade-in`, `pulse`, `palmSway` 같은 핵심 애니메이션 속성은 별도 파일 호출 지연 없이 HTML 블록 내에서 즉각 평가되도록 `<head>` 안에 인라인 정의하여 FCP(First Contentful Paint) 속도를 방어.

---

## 3. `<body>` 최상단부 : 전역 배경 및 Honeypot

HTML 요소가 화면에 처음 그려지는 영역입니다.

1. `<body class="theme-island wave-bg...">`:
   단일 클래스로 하위 모든 컴포넌트의 컬러 토큰(에메랄드/그린 그라데이션)을 지배합니다(Theme Wrapping).
2. **Telemetry Session Guard (Honeypot 🌟)**:
   `question.html` 최상단엔 봇(Bot)을 거르기 위한 시각적 은닉(Visually Hidden) 인풋 박스가 존재:
   `<input type="checkbox" id="hp_trap" class="absolute -left-[9999px] opacity-0" tabindex="-1">`
   - 스크래퍼/매크로는 무지성으로 Form 영역의 모든 `<input>`을 체킹하는 습성이 있음. 이곳에 `true` 값이 잡히면 `TestRunner`가 전송을 거부함.

---

## 4. `<body>` 본문 영역 : 레이아웃과 Skeleton UI (스켈레톤)

실제 콘텐츠 컨테이너입니다. FOUC(깜빡임) 및 CLS(레이아웃 밀림)를 방어하는 구조로 짜였습니다.

1. **Header & Title Area (`<header>`, `<h1>`)**:
   - `index.html`에만 가장 중요한 키워드가 담긴 단 하나의 `<h1>` 배치 (검색 엔진 Heading Hierarchy 규칙 완벽 준수).
2. **Hero Banner & Image Area (`<img ... onload="... style.display='none'">`)**:
   - 이미지 태그 바로 위(또는 형제/부모)에 빙글빙글 도는 펄스(Pulse)형 `gray-200` 스켈레톤 `div`를 배치. `<img onload>` 이벤트 발생 전까지 미리 자리(Box)를 차지하여, 이미지 로드시 갑자기 글자들이 아래로 뚝 밀려나는 현상(CLS) 원천 차단.
3. **Question Card & Buttons (DOM Rehydration 🌟)**:
   - `question.html`에는 비어있는 4개의 빈 `<button>` 껍데기가 미리 존재.
   - JS가 실행되며 `TestRunner`가 현재의 문항 `questionText`와 버튼 `answers`를 갈아 끼우는 방식(DOM 재사용). 페이지 전환(리액트식 렌더링)이 아닌 DOM 텍스트 교체 방식을 채택하여 모바일 저사양 기기 최적화.

---

## 5. `<div id="lock-overlay">` : 전면 광고 캡슐 (Interstitial Ad)

`result.html` 결과 페이지의 유저 체류 시간을 폭발적으로 늘리는 킬러 컴포넌트입니다.

1. `<div class="lock-overlay z-100">`:
   유저가 10번 문항을 클릭하여 결과 창에 도달한 최초 순간, 실제 결과지(`blur-content`) 위에 반투명한 블러 유리(Glassmorphism) 오버레이를 강제로 띄웁니다.
2. **Loading Progress Bar & Ad Space**:
   - 중앙에 "스폰서 광고 영역" 상자가 노출되며, 그 밑에 3초(`duration-[3000ms]`)짜리 가짜 '분석 로딩 바'가 채워짐.
   - 유저는 자기 결과(MBTI 등)가 너무 궁금해 3초간 눈을 떼지 못하므로, 이 구역이 전체 테스트 플랫폼 중 **광고 단가(CPM) 및 조회/클릭 전환율이 가장 압도적으로 높게 설계된 지점**임.
   - 로딩 완료 후 `unlockResult()` 함수(버튼 활성화)를 통해 오버레이 파괴.

---

## 6. `result-card` 하단부 : Share & Hot Issue (바이럴 엔진)

결과 확인 후 유저 행동(CTA: Call To Action)을 유도하는 영역들입니다.

1. **`action-buttons-container` (공유 버튼부)**:
   추후 카카오/링크 복사 등의 컴포넌트가 주입되는 공간.
   - 자신이 직접 푼 상태(`owner`)인지, 남이 카톡에 올린 링크를 구경하러 들어온 상태(`viewer`)인지에 따라 "결과 확인" 버튼 텍스트가 "새로 테스트 시작하기"로 스마트하게 다형성 렌더링 변경 처리됨.
2. **`hot-contents-container` (다형성 풀블리드 배너 🌟)**:
   - `-mx-8`, `gap-1` 등의 속성 적용. 브라우저 여백을 완전히 뚫고 모바일 액정 모서리에 밀착(Full-Bleed)되는 이미지 드리븐 배너 삽입 공간. `data.js`의 `hotContentsMock` 배열을 루프 돌려 이곳에 렌더링함.

---

## 7. `<body>` 최하단부 `<script type="module">` : Engine Bootstrapping

HTML 렌더가 모두 끝난 후, 코어 엔진을 깨워 프레임워크를 가동하는 통제 센터.

1. `type="module"` 선언: ES6 모듈 시스템 발동. 내부에서 `import { TestRunner }` 수행. 이를 통해 글로벌 스코프 폭발(변수 충돌)을 막음.
2. `TestRunner.initXXXStrategy(...)` (DI: 의존성 주입 🌟):
   - 각 HTML은 자신이 누군지(island인지, dopamine인지), 어떤 데이터(`islandQuestions`, `islandResults`)를 가졌는지만 `TestRunner`라는 거대 기계의 톱니바퀴에 주입(Inject)함.
   - 렌더링, 페이지 이동 로직, 퍼널 텔레메트리, 점수 계산 등 모든 더러운 로직은 `TestRunner` 코어 내부에서 블라인드 처리되어 단 한 방에 돌아감.
