---
title: Recommendation Engine API Architecture
author: Data Architecture Director
created_date: 2026-02-25
last_updated: 2026-02-25
status: Active
---

# 04. 추천 엔진 백엔드 알고리즘 (Recommendation Engine API)

> **목적**: 클라이언트 사이드(`data.js`의 `hotContentsMock`)에 하드코딩 되어있던 배너 추천 URL 목록을 철폐하고, 사용자의 컨텍스트(Context)를 분석하여 최적의 심리테스트 배너 3~4종을 실시간으로 반환하는 백엔드 연산 로직을 정의합니다.

---

## 1. 3-Tier 기반 슬롯별 할당 로직

각 추천 슬롯(Slot)은 노출되는 배너의 연산 알고리즘이 명확하게 구분되어야 합니다.

### 슬롯 1: 결과 맞춤형 추천 (Item-to-Item Collaborative)
* **컨셉**: "방금 당신과 똑같은 결과를 받은 유저들이 가장 많이 플레이한 또 다른 테스트."
* **작동 방식**: 
  1. 현재 유저의 `test_id`와 도출된 `result_type`을 파라미터로 받습니다.
  2. `event_logs` 또는 `user_results` 내부 관계망을 조회하여, 해당 결과를 얻은 유저 집단이 가장 많이 클릭한(`clicked_test_id`) 다른 심리테스트를 집계하여 반환합니다.
* **DB 요건**: 조회 쿼리의 성능을 위해 집계(Aggregation) 결과를 담는 `Materialized View` 생성을 권장합니다.

### 슬롯 2: 데모그래픽 기반 베스트 (Demographic Best)
* **컨셉**: "현재 성별/연령대에서 가장 트래픽이 높은 대세 테스트."
* **작동 방식**:
  1. 향후 마이페이지 연동 시 유저의 성별/연령대(예: 20대 여성) 정보를 활용해 대세 배너를 송출합니다.
  2. **(현재 제약사항 Fallback)**: 현재는 익명 트래픽이 주류이므로 조건 절을 생략하고 **'전체 유저 대상 최근 1시간 내 방문자 1위'** 테스트를 반환하도록 설계합니다.

### 슬롯 3: 신규 & 성향 매칭 하이브리드 (Content-Based)
* **컨셉**: "새로 오픈한 테스트 중 당신의 성향 파라미터와 가장 잘 맞는 테스트."
* **작동 방식**:
  1. `tests_metadata` 테이블에서 `release_date`가 특정 기준일(예: 14일) 이내인 신규 테스트를 필터링합니다.
  2. 현재 테스트에서 도출된 사용자의 벡터 값(예: E 성향 점수 극대화)과 신규 테스트가 타게팅하는 성향 메타데이터 간의 유사도(Cosine Similarity 등)를 계산하여 가장 궁합이 좋은 것을 매칭합니다.

---

## 2. API Response Interface (프론트엔드 연동 스키마)

백엔드 내부에 복잡한 DB 액세스 및 알고리즘 연산을 위치(Encapsulate)시키고 프론트엔드에는 순수 렌더링 정보만 JSON 형태로 전달하여 디커플링을 극대화합니다.

```json
// GET /api/v1/recommendations?source_test=island&result_type=leader
{
  "status": "success",
  "data": [
    {
      "slot": 1,
      "banner_url": "https://[SUPABASE_CDN_URL]/test_image/banners/banner_hormone_leader_targeted.webp",
      "target_url": "/tests/hormoni/index.html",
      "alt_text": "호르몬 연애 테스트"
    },
    {
      "slot": 2,
      "banner_url": "https://[SUPABASE_CDN_URL]/test_image/banners/banner_dessert_global_1.webp",
      "target_url": "/tests/dessert/index.html",
      "alt_text": "나와 닮은 디저트 테스트"
    },
    {
      "slot": 3,
      "banner_url": "https://[SUPABASE_CDN_URL]/test_image/banners/banner_demon_new_release.webp",
      "target_url": "/tests/demon/index.html",
      "alt_text": "전생 악마 테스트"
    }
  ]
}
```

> **구현 로드맵**: 위 추천 API 모델이 정상 작동하기 위해서는 이전 챕터(`02_database_schema_design.md` 및 `03_supabase_best_practices.md`)에서 설계한 정규화 테이블과 텔레메트리 스크립트 기반의 로그 수집 데이터베이스 구축이 반드시 선행되어야 합니다.
