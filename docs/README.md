---
title: "Docs-as-Code Repository Index"
author: "Total Director (Senior Engineer)"
last_updated: "2026-02-28"
status: "Active"
---

<!-- 파일 기능 서술 -->
> **문서 기능 (Document Function):** 본 파일(`README.md`)은 Mellow Wave 프로젝트의 모든 기획, 시스템 아키텍처, 데이터베이스 모델링 및 개발 산출물을 체계적으로 관리하기 위한 **Docs 저장소의 최상위 인덱스이자 공식 문서 작성 지침서(Guideline)**입니다.

# Mellow Wave 공식 문서 인덱스 및 아키텍처 지침 (Docs-as-Code)

본 저장소는 Feature-Sliced Design(FSD) 기반의 프론트엔드와 Supabase 기반의 서버리스 백엔드를 아우르는 Mellow Wave 시스템의 기술적 무결성을 유지하기 위한 **단일 진실 공급원(SSOT, Single Source of Truth)**입니다. 모든 에이전트 및 컴포넌트 개발자는 본 지침을 엄격하게 준수하여 아키텍처 문서를 작성하고 관리해야 합니다.

## 📂 폴더 구조 체계 (Directory Architecture)

시스템의 확장성과 높은 유지보수성을 보장하기 위해, 산출물을 다음의 정밀한 디렉토리 구조로 분리하여 관리합니다.

### `01_planning/` (기획 / 비즈니스 도메인)
- **기능**: 비즈니스 로직, 신규 테스트 기획, 도메인 규칙 정의.
- **주요 폴더**: `tests/` (심리테스트 도메인 명세), `foundation/` (서비스 코어 정책).

### `02_architecture/` (시스템 파운데이션 / 보안 / DB)
- **기능**: 프론트엔드/백엔드 아키텍처, 데이터베이스 스키마 명세, 네트워크 토폴로지.
- **Supabase-Postgres Best Practices 통합 지침**:
  - `database/` 하위 스키마 설계 시, **반드시 쿼리 최적화를 위한 인덱싱 전략(e.g., 부분 인덱스 도입)**을 명세해야 합니다.
  - Auth 및 사용자 데이터 보안을 위한 **RLS(Row-Level Security) 정책 규칙**과 트랜잭션 오버헤드 최소화 전략을 문서화할 것.
  - 각 스키마 기획안에 Connection Pooling 확장성 계획을 명시.

### `03_design/` (UX/UI 명세 및 개념도)
- **기능**: 렌더링 성능, 디자인 시스템(테마 스타일), 반응형 레이아웃 및 에셋 처리 파이프라인 규약.

### `04_development_logs/` (개발 마일스톤 및 기술 리뷰)
- **기능**: 특정 Phase 마일스톤에 따른 구현 명세서, 성능 프로파일링 결과, 기술 부채 추적 및 총괄 디렉터의 무결성 검증/디버깅 리뷰.

### `05_archive/` (레거시 무덤)
- **기능**: 프로덕션 코드로 릴리즈되어 완전히 이관된 초기 기획안이나 폐기된 설계의 불변 스냅샷.

---

## ⚙️ 문서 작성 원칙 (Engineering Document Rules)

가장 발전되고 유지보수성이 뛰어난 시스템을 위해, Docs 내의 모든 문서는 다음의 기계적이고 치밀한 규칙을 준수합니다.

### 1. Kebab-case 강제 (Naming Convention)
- 모든 파일과 폴더는 영소문자와 하이픈(`-`)으로만 구성되어야 합니다. 로직상 모호성을 제거하기 위함입니다.
- 예: `user-data-schema.md` (O), `userDataSchema.md` (X)

### 2. YAML Frontmatter 강제 (Metadata)
- 모든 `.md` 파일 최상단에는 작성자, 최종 수정일, 현재 문서의 상태(`Draft`, `Active`, `Archived`)를 추적 가능하게 명시해야 합니다.
```yaml
---
title: "현 문서의 명확하고 간결한 제목"
author: "관련 담당자 또는 총괄 수석 엔지니어"
last_updated: "2026-02-28"
status: "Active"
---
```

### 3. 클린 డా큐먼트 지향 (Clean Documentation)
- 아키텍처 및 시스템 흐름은 장황한 서술을 배제하고, 가능하면 **Mermaid.js 활용 시각화** 및 **도식화**를 전제로 합니다.
- 파일 내용이 갱신될 때마다 각 파일 최상단의 Frontmatter와 이 `README.md`의 날짜를 최신화하여 기술 부채를 방지하십시오.

---
#### 4. chapter별 기록 사항
- 각 chapter에는 반드시 수정날짜와 무엇을 어떻게 왜 변경했는지 기록해야한다.
- 반드시 철학과 철학을 이뤄내기 위한 목적, 그리고 구현 방향성 이후 세밀한 구현 방법을 서술하여야 한다.

> _"본 문서는 단순한 기록이 아닙니다. 시스템의 다음 동작을 정의하고 프로젝트의 구조적 무결성을 통제하는 가장 정밀한 코드입니다." - 총괄 수석 엔지니어 (Total Director)_
