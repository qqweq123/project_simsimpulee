---
title: "Vercel 오배포 관련 긴급 보안 검토 사후 분석 리포트 (Postmortem)"
author: "Director of Data Architecture & Total Director"
last_updated: "2026-03-01"
status: "Active"
---

# Vercel 오배포 관련 긴급 보안 검토 사후 분석 (Postmortem)

## 1. 개요 (Overview)
본 문서는 과거의 기획/설계 문서를 포함한 `C:\projects\mind_test` 전체 디렉토리가 Vercel에 실수로 오배포된 인시던트(Incident)에 대한 총괄 보안 감사 내역과 사후 처리 결과를 기록한 "Total Security Audit Report"입니다. 대상은 환경변수 유출, Supabase RLS 권한 탈취 가능성, 프론트엔드 내의 잠재적 데이터 누수 부분까지 시스템 전수였습니다.

## 2. 감사 내역 요약 (Audit Findings)

### Phase 1: 시크릿 키 및 설정 기반 노출 점검 (Pass)
- **하드코딩된 시크릿 키**: `ripgrep` 검토 결과 코드베이스 어디에도 `service_role_key`나 `JWT_SECRET` 같은 백엔드 전용 시크릿 키가 하드코딩되지 않았음이 확인되었습니다.
- **환경 변수 `.env` 파일 유출**: `.env*` 패턴의 어떠한 파일도 깃 레포지토리 또는 빌드 환경의 평문으로 노출된 바 없습니다.
- **프론트엔드 노출 키**: 오직 `anon_key` (클라이언트 공개용 키)만이 `api.js`에 노출되어 있으며, 이는 정상적인 사용 형태입니다.
- **조치 사항 (Hotfix 적용 완료)**:
  - `vercel.json` 파일에 HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` 등의 강력한 Security Headers 세팅을 보강 완료했습니다.

### Phase 2: Supabase (Postgres) 기반 거버넌스 및 RLS 감사 (Pass)
- **RLS (Row Level Security) 상태**: `User_Result_DB` 및 `Event_Log_DB` 테이블은 `ENABLE ROW LEVEL SECURITY;` 처리가 되어 있습니다.
- **Deny-All 정책 확인**: 명시적인 `CREATE POLICY` 구문 없이 Deny-All 처리되어 프론트엔드(클라이언트의 anon_key)에서 직접적으로 쿼리 조작이 불가능한 강력한 닫힌(Closed) 아키텍처를 유지 중입니다.
- **데이터 흐름 보안성**: 데이터 입력은 `SECURITY DEFINER`가 적용된 `log_user_result`, `increment_test_participants` RPC 함수(Stored Procedure)를 통해서만 안전하게 이루어지는 최고의 방어망 설계임이 다시 한번 입증되었습니다.

### Phase 3: 프론트엔드 클라이언트 단의 잠재 리스크 (Pass)
- **PII(개인식별정보) 로깅 여부**: `console.log` 및 클라이언트 로깅 조사 결과 이메일, 전화번호와 같은 심각한 PII 유출은 없었으며, 렌더링을 돕기 위한 디버그 로깅 일부만 존재했습니다.
- **로컬 스토리지 (LocalStorage)**: `store.js` 및 `TestRunner.js`에서 유저의 프로필 기초 정보(`mw_user_state`) 및 세션 UUID만을 암호화 없이 저장하고 있으나, 유출되더라도 문제되지 않는 비민감한 데이터 집합임을 확인했습니다.

## 3. 남은 기술적 부채 및 권고 사항 (Remediation & Recommendation)

### 💡 긴급 조치 권고 (User Action Required)
시스템 점검에는 이상이 없고 자체 방어망이 훌륭하게 작동하고 있으나, 빌드 파이프라인 단의 초기 오배포 흔적을 지워야 합니다.
1. **Vercel 대시보드 조치**: Vercel 콘솔에 접속하여 문제가 되었던 직전 빌드 캐시(Cache)를 완전히 삭제(Purge)하거나, 이전 상태로 되돌리기(Rollback)를 권장합니다.
2. **배포 정책 수립 (Vite OutDir)**: 차후에는 오직 `dist` (빌드 출력물) 폴더만 배포될 수 있도록 Vercel 프로젝트 설정의 "Root Directory" 혹은 배포 대상을 모니터링해 주십시오.

> _본 감사를 통해 Mellow Wave 파이프라인의 보안 수준이 상당히 훌륭하게 아키텍처링 되어 있음을 증명했습니다. 모든 인시던트는 더 단단한 시스템을 위한 교보재일 뿐입니다._ - Director of Data Architecture
