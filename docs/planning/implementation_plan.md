# Dynamic Test Recommendation System Implementation Plan

디렉터님께서 지시하신 '하드코딩 추천 배너 제거 및 동적 추천 로직 구현'을 위한 엔지니어링 계획서입니다.

## User Review Required
*   추천 배너 UI 구조 (UI Layout)
    현재 단일 배너 형태에서, 다중 추천 형태(최상단 1개, 1열 2개, 2열 1개 등)로 변경됨에 따라 UI 설계에 대한 검토가 필요합니다. 본 계획에서는 기존 카드 컴포넌트 스타일을 응용하여 구현합니다.

## Proposed Changes

### Core System
#### [NEW] [testRegistry.js](file:///c:/projects/mind_test/src/core/testRegistry.js)
*   `test_list.js` 내부에 고립되어 있던 `testData` 배열을 전역 코어 모듈로 분리하여 추출(Export)합니다.
*   이로써 전체 테스트의 메타데이터(참여자 수, 날짜, 카테고리, 태그 등)를 단일 진실 공급원(SSOT)에서 관리할 수 있게 됩니다.

#### [NEW] [recommendationEngine.js](file:///c:/projects/mind_test/src/core/recommendationEngine.js)
*   동적 추천을 위한 유틸리티 클래스를 생성합니다.
*   `getRecommendations(currentTestId)` 메서드를 호출하면 다음 4가지 추천 항목을 선별해 반환합니다.
    1.  **Similar Test (가장 비슷한)**: 현재 테스트와 `category`가 동일한 타 테스트 중 참여자 수가 가장 많은 것.
    2.  **Weekly Popular (금주 핫)**: 전체 중 2순위 인기 액티브 테스트.
    3.  **Monthly Popular (당월 핫)**: 전체 중 1순위 인기(최다 클릭) 테스트.
    4.  **User-based (유저 기반)**: 유저가 아직 시도하지 않았을 법한 랜덤/교차 카테고리 테스트 (기초 구현).

### Application Layer
#### [MODIFY] [test_list.js](file:///c:/projects/mind_test/src/pages/tests/test_list.js)
*   내부의 하드코딩된 `testData`를 삭제하고 새롭게 생성된 `testRegistry.js`에서 데이터를 Import 받아 사용하도록 리팩토링합니다.

#### [MODIFY] [renderer.js](file:///c:/projects/mind_test/src/features/tests/island/core/renderer.js)
*   하드코딩 되어있던 `hotContentsMock` 임포트를 제거합니다.
*   `renderHotContents(currentTestId)` 함수가 `RecommendationEngine`을 호출하도록 변경합니다.
*   요청하신 4가지 추천 항목을 세련된 카드 또는 배너 형태의 HTML 마크업으로 동적 렌더링(Injection)하도록 구조를 개편합니다.

#### [MODIFY] [data.js (island)](file:///c:/projects/mind_test/src/features/tests/island/data.js)
*   사용처를 잃은 `hotContentsMock` 배열을 삭제하여 잔재를 청소합니다.

## Verification Plan
### Manual Verification
1. Dopamine 테스트나 Island 테스트의 결과 페이지에 진입.
2. 하단 '추천 콘텐츠' 영역이 더 이상 고정된 배너가 아닌, [비슷한 테스트], [금주/당월 인기], [유저 추천]의 4분할 논리적 추천으로 표기되는지 육안 및 DOM 검수.
3. 각 추천 배너 클릭 시 올바른 파라미터 및 대상 URL로 라우팅 되는지 링크 테스트 진행.
