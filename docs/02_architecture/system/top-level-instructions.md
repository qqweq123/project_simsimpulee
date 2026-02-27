---
title: "top-level-instructions"
author: "AI Architect & General Engineer"
created_date: "2026-02-18"
last_updated: "2026-02-27"
status: "Active"
---

현재 문서의 환경은 Node.js 22.x 버전이며, 
Vercel과 supabase를 사용하고 있습니다.

## 프로젝트 구조
- src/pages: 페이지별 진입점
- src/features: 기능별 모듈
- src/core: 핵심 로직
- src/utils: 유틸리티 함수
- src/assets: 정적 자산

## 프로젝트 규칙
- 모든 기능은 모듈화되어야 합니다.
- 모든 기능은 재사용 가능해야 합니다.
- 모든 기능은 테스트 가능해야 합니다.
- 모든 기능은 문서화되어야 합니다.

Vite를 사용하고 있습니다. 반드시 @ alias를 사용해야 합니다.
모든 웹환경 경로화 가능성이 있는 문서는 '_'환경을 배제하고 '-'를 사용하여야 합니다.
예: src/features/test-name/question.js