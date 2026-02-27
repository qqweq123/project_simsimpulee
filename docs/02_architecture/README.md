---
title: "시스템 설계 및 마스터 가이드라인 Index"
last_updated: "2026-02-27"
---

# 02 Architecture (시스템 설계 및 마스터 가이드라인)

> 데이터베이스 스키마, 보안 규칙, 전체 아키텍처 원본 규약 보관소

본 디렉터리 하위의 문서들은 에이전트 및 팀원들이 시스템의 "진실의 원천(Single Source of Truth)"으로 삼는 기준 문서들입니다. 
신규 문서를 작성하거나 기존 시스템 정책을 개정할 때에는 아래 **[표준 작성 템플릿]**을 복사하여 사용하십시오.

---

## 📄 신규 아키텍처/시스템 가이드 작성 템플릿 (Template)

해당 템플릿은 `database/` 하위의 스키마 명세나 `system/` 하위의 공통 렌더링 엔진 명세 등에 사용됩니다.

```markdown
---
title: "[설계 문서 제목]"
author: "[Data Architect 혹은 기술 리드]"
created_date: "YYYY-MM-DD"
last_updated: "YYYY-MM-DD"
status: "Active | Deprecated"
dependencies: ["의존성이 있는 타 아키텍처 문서 slug"]
---

# [설계 문서 공식 명칭]

> **목적 (Purpose)**:
> 어떠한 기술적 문제를 해결하거나, 무슨 컴플라이언스(보안/구조 등)를 지키기 위해 만들어진 가이드라인인지 요약합니다.

## 1. 아키텍처 원칙 (Architecture Principles)
- **원칙 1**: [주요 원칙, 예: 모든 상태 관리는 SSOT로 통일]
- **원칙 2**: [주요 원칙, 예: 익명 사용자 접근 시 RLS 필터링 적용]

## 2. 데이터베이스 스키마 명세 (Database Schema) - *DB 관련 문서일 경우*
### 테이블명: \`[table_name]\`
> **역할**: 해당 테이블이 담고 있는 데이터의 성격 (마스터 데이터인지 이벤트 로그인지 등)

| 컬럼명 (Column) | 데이터 타입 (Type) | 제약사항 (Constraints) | 설명 (Description) |
| :--- | :--- | :--- | :--- |
| \`id\` | \`uuid\` | PK, Not Null | 레코드 고유 식별자 |
| \`target_col\` | \`jsonb\` | | 확장 가능한 메타 데이터 |

## 3. 코드 연동/통합 규약 (Integration Protocol)
*프론트엔드 또는 타 마이크로서비스에서 본 시스템을 어떻게 연동(Import/Fetch)해야 하는지 명세합니다.*
- **Import 경로**: \`@/core/...\` 형태의 절대경로 사용 의무화 여부
- **권장 패턴 (Best Practice)**:
  \`\`\`javascript
  // 코드 단위 예제블럭을 포함하여 팀원들의 이해를 돕습니다.
  import { db } from '@/core/supabase';
  \`\`\`
- **안티 패턴 (Anti-pattern)**: 해서는 안되는 기술적 접근(예: DOM 직접 조작 금지 등)

## 4. 보안 및 엣지 케이스 처리 (Security & Edge Cases)
- **RLS/권한 분리**: 특정 유저의 접근 제어 방식.
- **방어 로직**: 텔레메트리나 봇 트래픽(Honeypot)을 어떻게 우회/차단하는지.
```
