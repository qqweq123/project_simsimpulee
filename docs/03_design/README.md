---
title: "UI/UX 명세 및 개념도 Index"
last_updated: "2026-02-27"
---

# 03 Design (UI/UX 명세 및 개념도)

> 테마 스타일, 시각 콘셉트, UI/UX 레이아웃 규칙 보관소

본 디렉터리 하위의 문서들은 프론트엔드와 디자인 융합팀이 일관된 사용자 경험을 제공하기 위해 참조하는 가이드라인입니다.
신규 디자인 콘셉트(Concepts)나 레이아웃 가이드(UI/UX)를 추가할 때에는 아래 **[표준 작성 템플릿]**을 복사하여 사용하십시오.

---

## 🎨 디자인 콘셉트/명세서 작성 템플릿 (Template)

해당 템플릿은 `concepts/` 하위의 특정 테마(예: 사이버펑크, 네오브루탈리즘) 명세나, `ui-ux/` 하위의 공통 레이아웃 가이드에 사용됩니다.

```markdown
---
title: "[디자인 테마/레이아웃명]"
author: "[UI/UX Designer 혹은 Engineer]"
created_date: "YYYY-MM-DD"
last_updated: "YYYY-MM-DD"
status: "Draft | Release Candidate | Active"
dependencies: ["참조할 기존 가이드라인 slug"]
---

# [테마/레이아웃 공식 명칭]

> **디자인 철학 (Philosophy)**:
> 이 디자인이 지향하는 분위기(Mood), 타겟 플랫폼(모바일 퍼스트 등), 핵심 키워드 3가지를 명시합니다.

## 1. Visual Language (시각 언어)
- **핵심 키워드**: [예: 몽글몽글, 네온사인, 미니멀리즘]
- **레이아웃 구조**: [예: 1열형 카드 기반, Full-bleed 와이드 파노라마 등]
- **형태(Shape)**: [버튼은 둥글게, 외곽선은 두껍게 3px 등]

## 2. 디자인 토큰 (Design Tokens)
### 🎨 Color Palette
- **Primary**: \`#HexCode\` (사용처 명시)
- **Secondary**: \`#HexCode\`
- **Background**: \`#HexCode\`
- **Text/Accent**: \`#HexCode\`

### ✏️ Typography (폰트)
- **Display/Headings**: \`[Font Name]\` (크기, 행간)
- **Body/Paragraph**: \`[Font Name]\` (가독성을 위한 명세)

## 3. 핵심 UI 컴포넌트 (UI Components)
*자주 사용되는 컴포넌트(버튼, 카드, 모달 등)의 CSS 클래스(Tailwind) 조합이나 특이사항을 적습니다.*

- **버튼 (Button)**: 
  - 기본 상태: \`bg-[#color] text-white rounded-full\`
  - Hover 상태: 상호작용 애니메이션(스케일 업, 그림자 변화 등) 명세
- **에셋(이미지) 취급 규칙**: 
  - 예시: "모든 일러스트는 외곽선이 없는 WebP 형식으로 하단 그라데이션과 혼합되어야 함."

## 4. 반응형/모바일 최적화 (Responsive Rules)
- **모바일 (390px 이하)**: [예: 배너 텍스트 2줄 강제 개행]
- **데스크톱 (768px 이상)**: [예: 3열 그리드로 전환]
```
