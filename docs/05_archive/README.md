---
title: "레거시 데이터 보관용 Index"
last_updated: "2026-02-27"
---

# 05 Archive (레거시 코드 및 기획 무덤)

> 더 이상 유지보수되지 않는 과거(Deprecated) 파일 보존소

본 디렉터리는 과거의 유산입니다. 기획 텍스트가 `features/tests/.../data.js` 실제 자바스크립트 모듈로 완전히 이관되어 물리적 수명을 다했거나, 기획이 전면 취소된 사항들을 **오픈 소스 로깅 용도**로만 보관합니다. 

이 폴더의 문서들은 프로젝트의 현재 동작(Active State)에 아무런 영향을 미치지 않습니다.
에이전트나 개발자는 본 폴더의 로직을 시스템 구현의 "진실의 원천(SSOT)"으로 간주해서는 안 됩니다.

---

## 🗄 아카이브 문서 이관(보존) 템플릿 (Template)

활성(Active) 상태에서 폐기(Deprecated) 상태로 전환된 문서를 이 폴더로 옮길 때에는 Frontmatter를 아래와 같이 수정하고, 최상단에 폐기 사유를 적어주십시오.

```markdown
---
title: "[과거 파일명.txt]"
author: "[최초 작성자]"
created_date: "YYYY-MM-DD"
last_updated: "YYYY-MM-DD"
status: "Deprecated"
dependencies: []
---

> **[경고: Deprecated Document]** 
> 본 문서는 [YYYY-MM-DD] 부로 더 이상 유지보수되지 않으며, 기능적 구속력이 없습니다.
> **폐기(아카이브) 사유**: [예: 해당 로직은 모두 src/features/tests/demon/data.js 코드 내부로 완전 편입되었기 때문임.]
> **현재 유효한 참조(SSOT)**: [대체된 신규 파일 경로나 명칭]

---

(이하 기존 원본 텍스트 내용 유지...)
```
