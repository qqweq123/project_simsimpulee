---
title: "아일랜드 파노라마 배너 레이아웃 롤백 설계안"
author: "Total Director (Senior Engineer) & Chief Designer"
last_updated: "2026-02-28"
status: "Active"
---

<!-- 파일 기능 서술 -->
> **문서 기능 (Document Function):** 본 문서(`island-panorama-rollback.md`)는 Phase 3 코어 엔진 중앙화(FSD 전환) 과정에서 발생한 레이아웃 획일화(Boxed Regression) 결함을 수석 디자이너의 가이드라인에 맞추어 OCP(개방-폐쇄 원칙) 기반으로 해결한 시각화 아키텍처 명세서입니다.

# 추천 배너 렌더링 템플릿 아키텍처 (Design-Data Pattern)

## 📌 배경 및 목적 (Background)
FSD 아키텍처(Phase 3) 도입을 통해 파편화된 파일들을 `src/core/engine/ResultRenderer.js` 하나로 통합하면서 렌더링 코드가 깔끔해졌으나, 반대급부로 디자인의 다양성이 상실되는 치명적 모순이 발생했습니다. 아일랜드 생존유형 테스트의 핵심이었던 **"전면 파노라마(Full-Bleed)"** 배너가 개발 편의성을 위한 하드코딩된 기본값(`rounded-2xl`, 여백 설정 등)에 의해 평범한 카드형UI로 쪼그라드는 후퇴(Regression)가 일어났습니다.

이에 우리는 데이터 공학적으로 우수한 "플러그인/옵션 주입 방식"을 통해, 코어 엔진의 더러운 분기문(if/else) 없이 우아하게 각 테스트 고유의 디자인 템플릿을 소화할 수 있도록 아키텍처를 업그레이드했습니다.

---

## 🏗️ 렌더링 전략 인젝션 (Strategy Injection) 절차

수정 전의 프론트엔드 엔진은 무엇을 렌더링할지는 알았지만 '어떻게' 렌더링할지는 모른 채 딱딱한 템플릿 안에 데이터를 우겨넣었습니다. 우리는 테스트 데이터 자체가 자신의 "렌더링 테마"를 메타데이터로 가지고 있도록 데이터-디자인 결합 모델을 구축했습니다.

### 1단계: Data.js (콘텐츠 레이어)에 메타데이터 정의
```javascript
// src/features/tests/island/data.js
export const islandMetaData = {
    testId: 'island',
    bannerLayout: 'panoramic' // [Design Architecture] 전면 파노라마 레이아웃 강제
};
```
순수 데이터 파일이 자신의 레이아웃 속성을 선언하게 하여 각 테스트 특성에 맞는 렌더링 명령을 갖게 했습니다.

### 2단계: TestRunner.js (조율자 레이어)를 통한 전달
```javascript
// src/core/engine/TestRunner.js
static initResultStrategy(id, resultsConfig, metaData = {}) {
    ...
    // 메타데이터에 기입된 Layout 속성을 통과시킵니다. (없을 시 'card' 모드)
    ResultRenderer.renderHotContents(id, { layout: metaData.bannerLayout || 'card' });
}
```

### 3단계: ResultRenderer.js (렌더링 레이어)의 디자인 다형성 구현
옵션 객체(options)를 파라미터로 받아 CSS 클래스를 동적으로 할당합니다.
```javascript
const isPanoramic = options.layout === 'panoramic';
const cardClass = isPanoramic
    // 모바일 터치 피드백을 위한 hover 애니메이션, 라운드(2xl) 복구 + 꽉 찬 가로 뷰(w-full)
    ? "block w-full rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transform transition-all duration-300 relative group" 
    : "block rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.02] transform transition-all duration-300 relative group"; 
```

### 4단계: HTML 컨테이너 좁은 간격(Gap) 패치
`island/result.html`의 컨테이너를 가두고 있던 패딩 요소(`px-8`)를 `px-2` 수준으로 최소화하여 넓은 파노라마 느낌은 유지하되, 각 배너 사이에 좁은 호흡(간격, `gap-2`)을 부여하여 정보의 독립성을 시각적으로 분리(Decoupling)했습니다.

---

## ✅ 수석 디자이너 (Chief Designer) 리뷰 포인트
> _"훌륭한 시스템은 아티스트의 표현을 가두지 않고 담아내는 가장 튼튼한 그릇이 되어야 합니다."_

이 아키텍처 롤백으로 인해:
1. **몰입감 최대화**: 여백 없이 이어진 배너들은 단순히 클릭 유도를 넘어 갤러리를 보는 듯한 일체감을 제공합니다.
2. **비즈니스적 안정성 추가**: 향후 '도파민 테스트' 등 다른 테스트에서는 여전히 안정적인 여백이 있는 '카드형(`card`)' 템플릿이 디폴트로 파손 없이 제공됩니다. CSS를 분리(Decoupling)했기에 유지보수 중 한쪽 디자인이 망가질 우려가 완전히 사라졌습니다.
