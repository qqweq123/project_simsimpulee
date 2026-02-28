---
title: "Docs-as-Code Repository Index"
author: "Mellow Wave Team"
last_updated: "2026-02-27"
---

# Mellow Wave 공식 문서 인덱스 (Docs as Code)

> 본 문서는 Mellow Wave 프로젝트의 모든 기획, 아키텍처, 디자인 및 산출물을 에이전트 및 팀원들이 체계적으로 관리하고 열람할 수 있도록 설계된 **자동화 호환 문서 저장소**입니다.

## 📂 폴더 구조 체계 (Directory Architecture)

### [1] `01_planning` (기획 / 비즈니스 도메인)
- 서비스 확장성, 신규 테스트 기획 등 비즈니스 로드맵이 문서화되어 있습니다.
- **주요 폴더**: `tests/` (심리테스트), `foundation/` (기초 기획)

### [2] `02_architecture` (시스템 파운데이션 / 보안)
- 데이터베이스 스키마 명세, Supabase 엣지 보안가이드 등 프로젝트를 지탱하는 마스터 규약입니다.

### [3] `03_design` (UX/UI 명세 및 개념도)
- 테마 스타일(글래스모피즘 등), 디자인 레이아웃 및 에셋 생성 규칙이 포함되어 있습니다.

### [4] `04_development_logs` (개발 징수기록 및 리뷰)
- 특정 Phase 마일스톤에 따른 개발 명세와 기술 부채 해결 내역, 아키텍트의 무결성 검증 리뷰가 저장됩니다.

### [5] `05_archive` (레거시 무덤)
- 실제 코드(`data.js`)로 완전 반영되어 기록용(TXT 등)의 보존소입니다.

---

## ⚠️ 문서 작성 원칙 (Agentic-Document Rules)
- **Kebab-case 강제**: 모든 파일과 폴더는 영소문자와 하이픈(`-`)으로만 구성되어야 합니다.
- **YAML Frontmatter 강제**: 모든 `.md` 파일 최상단에는 `title`, `author`, `last_updated`, `status` 속성을 포함해야 합니다.
- **수정 일자**: 내용이 업데이트 될 때마다 각 파일 최상단의 Frontmatter와 이 `README.md`의 날짜를 최신화하십시오.
