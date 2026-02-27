# Mellow Wave Phase 2: Advanced Architecture Implementation Log

**최종 수정 일시**: 2026-02-27 18:10 (KST)
**작성자**: General Engineer (Tech Director)

> **문서 개요**: 본 문서는 `phase2_advanced_architecture_roadmap.md` 및 `phase2_execution_plan.md`에 기획된 상용화(Phase 2) 요건들이 실제 프로덕션 환경(Code Network)에 **어떻게(How)**, 그리고 **왜(Why)** 구현되었는지 기록한 기술 징수(징수) 및 사후 검증 명세서입니다.

---

## 1. 코드 검토 및 보안/템플릿 구조화 (Code Refactoring & Security)

### 1-A. 모듈 분리 및 의존성 해소 (How)
단일 `result.js`와 `question.js`에 혼재되어 있던 복잡한 로직들을 `core`(핵심 연산/렌더링)와 `utils`(보안/텔레메트리) 디렉터리로 완전히 분할(`validator.js`, `calculator.js`, `renderer.js`, `telemetry.js`, `honeypot.js`)했습니다.
*   **Why**: 향후 수십 개의 테스트 템플릿을 찍어낼 때마다 코드를 복사&붙여넣기 할 수 없기 때문입니다. 코어 엔진 모듈 하나만을 Import하여 재사용하는 엔터프라이즈 아키텍처를 수립했습니다.

### 1-B. 상태 무결성 검증 및 Viral By-Pass (How)
디렉터님의 지적을 수용하여 `validator.js`에서 URL 파라미터(`mode=owner` vs `mode=viewer`)에 따른 투트랙 분기를 신설했습니다.
*   **Why**: 원래의 엄격한 보안(Session Storage 검증)을 유지하면, 카카오톡 등으로 공유받은 지인(세션이 없는 사람)마저 전부 불법 접근자로 간주되어 튕겨 나가는 **바이럴 원천 차단 버그**가 발생합니다.
*   공유받은 유저는 로직을 우회합격시켜 결과만 노출하고, 하단의 UI를 "공유하기" 대신 **"테스트 시작하기(나도 해보기)"** 버튼으로 동적으로 스와핑(Swapping) 유도하여 가입/참여 전환율을 보존했습니다.

---

## 2. 정밀 텔레메트리 및 어뷰징 쉴드 (Telemetry & Abuse Protection)

### 2-A. Dwell Time 왜곡 방지 및 상한선 제어 (How)
모바일 브라우저의 `Page Visibility API (document.hidden)`를 `telemetry.js`에 연동하여 카카오톡 알림을 보거나 배경으로 앱을 내렸을 때에는 정답 고민 시간(Dwell Time) 타이머가 일시정지 되도록 했습니다.
*   **Why**: 유저가 테스트 도중 잠들거나 딴짓을 한 시간까지 정답 고민 시간으로 수집되면, 데이터 평균이 심각하게 오염되어 AI 알고리즘 분석 재료로 쓸 수 없기 때문입니다. `Max Capping (최대 10분)`도 추가로 제한을 걸어 극단값을 정규화했습니다.

### 2-B. Honeypot (봇 트랩) 주입 (How)
인간에겐 안 보이지만 소스코드 트리(DOM)에는 존재하는 CSS 은닉형 `<input type="checkbox">`를 주입했습니다.
*   **Why**: 악의적인 크롤러 봇이나 매크로는 내용 상관없이 화면의 모든 버튼을 무작위로 클릭합니다. 백엔드(Supabase) 측에서 이 체크박스의 상태가 `true`면 저장 트랜잭션을 조용히 무시하여 Database 오염을 막습니다. (내부 QA 툴 검증을 위한 `x-agent-bypass` 쿠키 패스도 구현완료.)

---

## 3. 전면적 데이터베이스화 및 메타데이터 (Database & SEO)

### 3-A. 3-Tier Gatekeeper 스키마 (How)
`Test_Meta_DB` (JSONB 활용), `User_Result_DB` (최종 타겟), `Event_Log_DB` (이벤트 텔레메트리 + Composite Index 튜닝)의 3단계 스키마를 구성했습니다.
*   **Why**: **Row Level Security (RLS)**를 완전히 걸어잠가 브라우저의 직접적인 `INSERT`를 차단하기 위함입니다. DB에 데이터를 밀어 넣고 싶다면, 따닥(Race Condition) 중복 검사를 통과하는 `log_user_result` 커스텀 RPC(Stored Procedure) 함수를 호출해야만 합니다. 이는 Supabase 해킹(F12 탈취를 통한 수십만 건의 허위 데이터 삽입)을 원천 방어하는 가장 현명한 공학적 실드입니다.

### 3-B. Edge Function (동적 OpenGraph) (How)
`seo-render` 라는 엣지 함수(Deno 환경)를 배포하여 `/share` 라우팅을 가로챕니다.
*   **Why**: 카카오톡 등 SNS 봇은 자바스크립트를 로딩하지 않으므로 기존 방식으론 공유 썸네일을 띄울 수 없습니다. 봇(User-Agent)이 감지되면 미리 준비된 4가지 결과 타입별 `meta` 태그가 적힌 가벼운 더미 HTML을 반환해주어 풍성한 공유 카드를 제공하며, 실제 유저일 시에만 Result 페이지로 리다이렉트합니다.

---

## 4. 콘텐츠 본연의 질 고도화 및 플랫폼 UI (Content & UI)

### 4-A. 현실성과 공감성이 부여된 질문/해설 리라이팅 (How)
단순 테스트 수준이었던 기존의 데이터를 버리고, "문명"과 맞닿거나 극한 상황 속 서로를 향한 "감정"에 부딪히는 묘사를 디테일하게 삽입해 12개 질문과 4개 해설 텍스트(`data.js`)를 완전히 새로 썼습니다.
*   **Why**: 가벼운 심리테스트일수록, "나 진짜 이래!" 라며 소름 돋게 하는 직관적이고 뾰족한 공감 요소가 생명입니다.

### 4-B. Full-bleed 와이드 파노라마 메가 배너 주입 (How)
`index.html` 진입부에 있던 이모지 아이콘 트리거를 제거하고, AI 파이프라인으로 생성 후 CDN업로드 된 가로 1200 x 세로 330 스케일의 고품질 유기적 애니메이션풍(Organic Vector) 배너(`hero_banner_v1.webp`)를 주입했습니다.
*   **Why**: 첫 화면 진입 시 "대충 만든 조잡한 테스트"가 아닌, 전문 스튜디오가 제작한 앱처럼 보이는 압도적인 스크린 장악력을 주기 위해 양옆 여백을 찢는 `-mx-8` 풀-블리드 메타포를 도입했습니다.

### 4-C. UI/UX 이슈 버그 리포트 픽스 (How)
1. **카카오톡 공유 API 복원**: 낡은 Story API를 배제하고, PC(클립보드 안내)와 모바일(`navigator.share` 네이티브) 이중 대응 로직을 세웠습니다.
2. **복사/공유 버튼 CSS 픽스**: `btn-press`와 커스텀 애니메이션(`hover`/`active`)이 충돌해 마우스를 뗐을 때 오히려 버튼이 눌려 보이는 잔상 오류를 해결했습니다.
3. **모바일 Sticky Hover 버그**: 모바일 환경에서 정답 탭 시 하이라이딩 효과가 굳어지는 HTML 특화 버그를 잡고자, 데스크톱(`sm:hover:...`)과 터치디바이스(`active:...`)의 CSS 트리거를 철저히 분리했습니다.
4. **풀버전 SNS 공유 재탑재**: 페이스북, 쓰레드, 트위터(X), 인스타그램의 공식 로고 인라인 SVG 구조를 부활시켜 `renderer.js`에 주입했습니다.
