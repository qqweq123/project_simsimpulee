---
title: "Mellow Wave: 심도 깊은 테스트 템플릿화(Templatization) 전략 보고서"
author: "General Engineer (수석 엔지니어)"
date: "2026-02-27"
status: "Draft for Director Review"
---

# Mellow Wave: 테스트 템플릿화(Templatization) 고도화 스펙

> **작성자**: General Engineer
> **배경**: 테스트 로직(점수 산출)을 `TestEngine.js`로 함수화, 중앙집중화하여 개발 리소스를 성공적으로 단축했습니다. 본 문서는 여기서 한 걸음 더 나아가, **사용자의 '유형별 다양성'과 '재미'를 전혀 해치지 않으면서도 시스템의 재사용성을 극한으로 끌어올릴 수 있는 추가 템플릿화 방안**을 심도 깊게 고찰합니다.

---

## 1. 코어 엔진 템플릿화 (완료 사항)

### 1-1. `TestEngine`의 중앙 통제화
기존에는 각 테스트(`island`, `dessert`, `hormoni`, `demon`)가 각자의 `data.js`나 `calculator.js` 안에서 점수 산출(`reduce`, `Math.max` 등)과 파라미터 파싱 로직을 파편화하여 가지고 있었습니다. 
*   **Action**: `src/core/testEngine.js`를 신설하여 3가지 Standard 룰셋(최고점 산출, MBTI 4축 산출, A/B 이분법 산출)을 공용 메소드로 추출했습니다.
*   **Result**: 신규 테스트(e.g., 직장인 생존 테스트) 생성 시, 알고리즘을 짤 필요 없이 `TestEngine.getHighestScoreKey(scores)` 단 한 줄만 호출하면 됩니다.

---

## 2. 추가 템플릿화 탐색 (Deep Templatization Options)

테스트의 본질인 **'콘셉트(공포, 힐링 등)의 고유성'**은 철저히 보존하되, 껍데기(Shell)와 파이프라인(Pipeline)을 템플릿화하는 공학적 접근입니다.

### Option A: **질문지 진행 UI의 FSD (Feature-Sliced Design) 템플릿화**
현재 4개의 테스트 모두 `question.html`과 `question.js`가 문항을 1개씩 넘기고 프로그레스 바(Progress Bar)를 채우는 로직을 하드코딩으로 반복하고 있습니다.
*   **구현 방향**: `<div id="mellow-question-container"></div>` 하나만 둔 상태에서, `QuestionRenderer.js` 팩토리 클래스가 `data.js`의 JSON 객체를 주입받아 DOM 구조(질문 텍스트, N개의 버튼, 게이지 바)를 동적(Dynamic)으로 그려내는 템플릿입니다.
*   **장점**: 버튼 클릭 시의 애니메이션(스케일 업, 색상 페이드인)을 팩토리에서 일괄 관리하므로, 버그 발생률이 0에 수렴하며 UI 퍼포먼스가 압도적으로 향상됩니다.
*   **다양성 보존**: JSON에 `theme: "dark" | "light"` 및 `buttonStyle: "rounded" | "sharp"` 변수를 주입하여 공포(귀멸)는 피처럼 붉은 Sharp 버튼을, 힐링(디저트)은 둥근 파스텔 버튼을 렌더링하게 끔 CSS 분기만 처리하면 고유성이 100% 보존됩니다.

### Option B: **동적 결과 페이지 쉘 (Result Page Shell Template)**
결과 페이지(`result.html`)는 "히어로 이미지 -> 제목 -> 설명 텍스트 -> 차트/스탯 -> 공유 버튼 -> 추천 배너" 라는 완벽하게 고정된 순서(Flow)를 가집니다.
*   **구현 방향**: `ResultTemplate` 클래스를 만들어 객체를 꽂아넣습니다.
    ```javascript
    const myResult = new ResultTemplate({
       hero: islandResults[type].image,
       title: islandResults[type].name,
       description: islandResults[type].desc,
       tags: islandResults[type].tags,
       themeColor: islandResults[type].color
    });
    myResult.render(document.getElementById('app'));
    ```
*   **장점**: HTML 레이아웃을 수정할 때 4개의 폴더를 일일이 순회하며 고칠 필요 없이 `ResultTemplate` 파일 하나만 고치면 플랫폼 내 모든 결과 페이지의 UI가 일제히 업데이트됩니다. 엄청난 유지보수성의 승리입니다.

### Option C: **텔레메트리 및 어뷰징 쉴드(Honeypot) 자동 탑재 모듈**
*   **구현 방향**: 페이지 로딩 최상단에 `MellowGuard.init({ testId: 'island' })`를 선언하면, 내부적으로 `navigator.sendBeacon`과 체류 시간 측정(Page Visibility API), 그리고 Honeypot DOM 트랩이 자동으로 Inject 되는 구조입니다.
*   **장점**: 마케터나 초급 개발자가 신규 테스트를 추가하다가 실수로 방어 로직을 빼먹어서 DB가 마비되는 대참사(Human Error)를 공학적으로 원천 봉쇄합니다.

---

## 3. General Engineer 권고 결론

"도메인(콘텐츠)과 렌더링(뷰)의 완벽한 분리."

현재 도입한 `TestEngine.js`를 기점으로, **Option A(질문지 동적 렌더링)**와 **Option B(결과지 쉘 템플릿)**를 즉시 Phase 3 인프라 과제로 승격시킬 것을 제안합니다. 

이러한 **구조적 템플릿화(Structural Templatization)**는 유저가 느끼는 재미(스토리 구조, 이미지 톤앤매너, 일러스트의 이질감 없음)에는 전혀 악영향을 주지 않으면서도, 1개 테스트 런칭 기간을 기존 3일에서 단 **3시간**으로 압축시킬 수 있는 가장 강력한 무기가 될 것입니다. 

Director님의 개발 지시를 기다리겠습니다.
