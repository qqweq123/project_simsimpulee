# Mellow Wave Phase 2: 신규 테스트 플랜

## 1. 테스트 개요
*   **테스트명**: 현대인 도파민 생태계 분석: "내 안의 도파민 몬스터" 테스트
*   **분류**: Regular Test (10~12 문항)
*   **타겟층**: 1030 숏폼 중독 세대, 도파민(자극)을 추구하며 살아가는 현대인
*   **기획 의도**: "내가 쉴 때 도대체 뭘 하면서 시간을 버리는가(혹은 충전하는가)?"를 예리하게 짚어내어 "어? 이거 완전 나잖아!"라는 강렬한 공감대(Relatability)를 형성함.
*   **엔지니어링 코어**: `TestEngine.getTopRankedKeys(scores, 2)`를 활용한 **[주기능 + 부기능(날개)]** 산출 알고리즘 적용. 단일 유형보다 훨씬 높은 정확도와 입체적인 분석을 제공함.

## 2. 결과 유형 (8종 도파민 몬스터)
1.  **무한 숏폼 스크롤러 (Short-form Scroller)**: 알고리즘의 노예. 생각 비우는데 최고.
2.  **프로 탕진러 (Shopaholic)**: 카카오톡 선물하기, 무신사 장바구니 구경이 취미.
3.  **마라탕/당충전 빌런 (Spicy/Sweet Eater)**: 스트레스는 맵고 단 것으로 직행.
4.  **방구석 활자 중독자 (Text Addict)**: 커뮤니티, 나무위키, 썰 읽기로 밤샘.
5.  **과몰입 덕질 마스터 (Stan Master)**: 최애 아이돌, 웹툰, 게임에 자아의탁.
6.  **수면/침대 일체형 (Bed Sloth)**: 아무것도 안 하고 숨만 쉬는 게 진정한 도파민.
7.  **감성 브이로거 (Aesthetic Seeker)**: 예쁜 카페, 인스타그래머블한 공간 탐방.
8.  **도파민 디톡서 (Dopamine Detoxer)**: 억지로 도파민을 끊고 명상/운동/산책을 즐기는 특이종.

*   **결과 도출 로직**: 
    - 1순위(주기능): 메인 타이틀 및 캐릭터 이미지 배정.
    - 2순위(부기능): "숨겨진 본능"으로 결과 하단에 작게 표시하여 공감대 극대화. (예: 주성향이 '침대 일체형'인데 부성향이 '마라탕 빌런'이면 -> "침대에 누워서 배달앱만 쳐다보고 계시군요?")

## 3. 문항 설계 방향
*   **총 문항 수**: 10개 (Regular Test)
*   일반적인 MBTI 문항이 아닌 시의성 있는 유행어나 구체적인 생활 밀착형 상황(예: "유튜브 알고리즘이 망가졌을 때 내 반응은?")을 제시.

## 4. UI/UX 템플릿 적용 방안
*   **HTML Hydration**: `template_architecture_revisions.md`에서 확립한 정적 버튼(Static Buttons) 수화 방식을 완벽히 계승.
*   **Honeypot 방어**: `island/index.html`과 동일한 `hp_trap` 1선 방어망 하드코딩.
*   **Telemetry**: `isBotTraffic()`, `getPureDwellTime()` 오토 인젝션.

## 5. 실행 순서 (Action Items)
- [ ] 1. 테스트 기획/질문지 및 결과 맵핑 데이터 세팅 (`features/tests/dopamine/data.js`)
- [ ] 2. 프론트엔드 라우팅 및 템플릿(Hydration 적용) 구성 (`pages/tests/dopamine/index.html`, `question.html`, `result.html`)
- [ ] 3. 점수 계산 로직 연결 (`features/tests/dopamine/question.js`, `result.js`)
- [ ] 4. 시각 자산(Dopamine Monster 일러스트) 기획 및 이미지 생성 연동
- [ ] 5. Supabase 쿼리 삽입 메타데이터 및 Test_Meta_DB 업로드 스크립트 작성
- [ ] 6. 최종 렌더링 검수 및 QA
