# Mellow Wave Recommendation Engine (Background Logic Specification)

> **문서 목적**: 향후 Supabase 기반 백엔드에서 구현해야 할 'Hot Issue' 추천 알고리즘 및 데이터 파이프라인의 아키텍처 명세서
> **작성자**: 데이터 아키텍처 디렉터 (@dataarchitecturedirector)

## 1. 개요 (Overview)
현재 프론트엔드(`data.js`)에 정적으로 하드코딩된 `hotContentsMock`(배너 URL 목록)을 대체하기 위해, 클라이언트 접속 시 사용자의 **컨텍스트(Context)**를 분석하여 최적의 심리테스트 배너 3종을 실시간으로 반환하는 백엔드(Edge Function 또는 API)를 구축해야 합니다.

## 2. 슬롯별 알고리즘 (3-Tier Logic)

### 2.1. 슬롯 1: 결과 맞춤형 추천 (Item-to-Item Collaborative Filtering)
*   **목적**: 사용자가 방금 얻은 결과(예: 무인도 테스트 - 카리스마 리더)와 통계적으로 연관성이 높은 테스트를 추천.
*   **데이터 파이프라인 요건**:
    1.  `test_results_log` 테이블 필요: `user_session_id`, `test_id`, `result_type`, `created_at`
    2.  `test_clicks_log` 테이블 필요: `user_session_id`, `clicked_test_id`
*   **알고리즘 연산**:
    *   "무인도(island)에서 리더(leader)가 나온 유저 집단"이 가장 많이 클릭하고, 공유하며, 채류한 그리고  플레이한 타 테스트(`clicked_test_id`)를 카운트.(*다중 알고리즘을 판별하는 로직 구현 필수*)
    *   시간에 따른 감가상각(Time Decay) 가중치를 주어 최근 트렌드 반영.

### 2.2. 슬롯 2: 성별/데모그래픽 인기 1위 (Demographic Best)
*   **목적**: 사이트 내 해당 성별/연령대에서 가장 트래픽(조회수+참여수)이 높은 테스트 추천.
*   **데이터 파이프라인 요건**:
    1.  `users` 테이블 또는 `session_profiles` 필요: `gender`, `age_group` (향후 로그인/온보딩 시 수집)
    2.  `test_views_log` 테이블 고도화: `viewer_gender` 조인 가능하도록 설계
*   **현재 제약사항 우회(Fallback)**: 온보딩/로그인이 없는 현재 구조에서는 100% 익명 트래픽이므로, 당분간은 조건 절을 생략하고 **'전체 유저 대상 최근 1시간 내 접속 1위'** 테스트를 반환하도록 대체(Fallback) 설계합니다.

### 2.3. 슬롯 3: 신규 & 성향 매칭 예측 (Content-Based Filtering)
*   **목적**: Mellow Wave에 갓 출시된 신규 테스트를 띄워주되, 유저의 점수/성향(예: MBTI 'E' 성향 점수 높음)과 찰떡궁합인 결과가 나올 확률이 높은 테스트를 매칭.
*   **데이터 파이프라인 요건**:
    1.  `tests_metadata` 테이블: `release_date`, `target_archetypes` (테스트가 겨냥하는 주 성향 맵)
*   **알고리즘 연산**:
    *   출시일 14일 이내인 테스트 필터링.
    *   유저의 현재 결과 점수(`scoringEngine.js`에서 나온 벡터 값)와 신규 테스트의 성향 메타데이터 간의 '코사인 유사도(Cosine Similarity)'를 계산하여 가장 높은 1건 반환.

## 3. API Response Interface (제한된 프론트엔드 연동 스키마)
프론트엔드 디커플링 및 유지보수성을 극대화하기 위해, 위 복잡한 연산을 백엔드가 모두 처리하고 프론트에는 순수 시각 정보만 전달합니다.

```javascript
// GET /api/recommendations?source_test=island&result_type=leader
{
  "status": "success",
  "data": [
    {
      "slot": 1,
      "banner_url": "https://[SUPABASE_CDN_URL]/banners/banner_hormone_leader_targeted.webp",
      "target_url": "/src/pages/tests/hormoni/index.html",
      "alt_text": "호르몬 연애 테스트"
    },
    {
      "slot": 2,
      "banner_url": "https://[SUPABASE_CDN_URL]/banners/banner_dessert_global_1.webp",
      "target_url": "/src/pages/tests/dessert/index.html",
      "alt_text": "나와 닮은 디저트 테스트"
    },
    {
      "slot": 3,
      "banner_url": "https://[SUPABASE_CDN_URL]/banners/banner_demon_new_release.webp",
      "target_url": "/src/pages/tests/demon/index.html",
      "alt_text": "전생 악마 테스트"
    }
  ]
}
```

## 4. 로깅 시스템 구축 선행
위 API가 유의미하게 동작하려면, 내일부터 즉시 Supabase 기반의 **이벤트 수집(Telemetry)**이 시작되어야 합니다. 사용자가 버튼을 클릭하는 순간, 테스트 결과를 보는 순간을 비동기(non-blocking)로 Supabase `logs` 테이블에 삽입하는 `Tracker` 모듈 구현을 다음 단기 목표로 설정해야 합니다.
