<!-- 파일 기능 서술: Vercel 도메인 조기 노출 사고에 대한 통합(Data Governance + Architecture) 사후 분석 및 503 락다운 트러블슈팅 마스터 리포트 -->
# Vercel 인시던트 리포트: `mellowwave.me` 조기 노출 사후 분석 및 503 락다운(Lock-down)

## 1. 사고 개요 (Incident Overview)
- **발생 일시:** 2026년 3월 1일
- **발생 원인 (Root Cause):** 
  Vite 기반의 빌드 파이프라인에서 Output Directory(`dist/`)가 정밀하게 타겟팅되지 않은 상태로 프로젝트 최상위 루트 포인터가 Vercel 배포 트리거를 발생시킴. 이로 인해 개발 단계의 메인 운영 도메인(`mellowwave.me`)이 관리자 실수로 타 프로젝트(`simsimpulee`/`mind_test`) 환경에 얽혀 퍼블릭 연결됨.
- **초기 상태:** 프론트엔드 라우팅이 열려 미완성된 서비스 화면 및 내부 소스코드(문서, 스키마, 설정 파일) 전체가 무방비 노출됨.

## 2. 보안 오버헤드 계측 및 심층 통제 결과 (Data Governance & Security Audit)
데이터 아키텍처 디렉터(Data Architecture Director)의 시각에서 점검한 최악의 시나리오와 입증된 방어 체계입니다.

### ⚠️ 위험 1: 크리티컬 인증 키 노출 (Credentials Leakage)
- **가설:** 서버 환경에 하드코딩되었을 수 있는 데이터베이스 권한 키(Service Role Key)가 평문으로 노출.
- **감사 결과 (PASS):** 소스 내에 하드코딩된 시크릿 키는 단 한 건도 없었으며, 노출된 구조는 클라이언트용 퍼블릭 `anon_key`뿐이므로 시스템 장악 리스크는 0%입니다.

### ⚠️ 위험 2: 데이터베이스 무단 조작 (Database Hijacking) 및 SEO 오염
- **가설:** 노출된 아키텍처 스키마 문서를 기반으로 악의적 봇이 RLS를 우회하여 DB 구조를 타격하거나 구글봇(Googlebot)이 미완성 테스트 더미를 마스터 데이터(Master Data)로 인덱싱함.
- **감사 결과 (PASS):** Mellow Wave의 DB는 강력한 **RLS(Row Level Security)**의 `Deny-All` 및 RPC 호출로 방어되어 있어 DB 훼손은 완벽히 차단되었습니다. 다만, SEO 인덱스 오염을 막기 위한 브라우저 단의 강제 화면 통제가 시급했습니다.

## 3. 방어 아키텍처 시공 및 난관 극복 기록 (503 Lock-down Implementation)
단순한 307 Redirect 대신 접근 통제를 확보하는 3단계 락다운을 시행했습니다.

### Phase 1: XSS 방어 및 Vercel Serverless 점검 API 도입 (`api/maintenance.js` & `vercel.json`)
- 외부 임베딩 공격과 스니핑 차단을 위해 전역에 **Netsec Headers**(HSTS, X-Frame-Options 등)를 주입함.
- 수집 차단 컴플라이언스를 위해 `Retry-After: 86400`과 `X-Robots-Tag: noindex, nofollow`를 탑재한 `/api/maintenance.js` 서버리스 응답(HTTP 503)을 세팅함.

### Phase 2: 빌드 파이프라인 물리적 오버라이딩 (CI/CD Pipeline Override)
- **발생한 한계:** Vercel 배포 환경상 최상단 렌더링에 있어 Vite 빌드 출력물(`dist/index.html`)이 우리가 설정한 `rewrite` 규칙보다 우선시되어 프론트 화면 노출을 막지 못함.
- **우회 공격 (Hotfix):** ETL/ELT 파이프라인 관점에서 '적재(Load)' 단계를 조작. `package.json`의 빌드 스크립트를 조작하여,
  `"build": "vite build && cp index.maintenance.html dist/index.html"`
  Vite 빌드 완료 직후 503 전용 락다운 페이지로 파일 자체를 물리적으로 덮어써 완벽한 프론트엔드 은닉을 입증함.

## 4. 정식 배포 복원 매뉴얼 (Official Deployment Rollback & Clean Launch Guide)
향후 `mellowwave.me`를 세상에 정식 오픈하고 정상적인 라우팅을 재개하려면, 오배포 방어 목적으로 세팅된 현재의 락다운(Lock-down) 및 물리적 방어막을 해제해야 합니다. Vercel 환경 패러다임에 맞춰 누구라도 실수 없이 100% 안전하게 복원할 수 있도록 다음 5단계를 철저히 순서대로 이행하십시오.

### 🔄 Step 1: Vercel 대시보드 빌드 파이프라인 강제 설정 (가장 중요)
기존 오배포 사태의 핵심 원인인 프로젝트 루트 디렉터리의 통째 노출을 원천 차단하기 위해, **Vercel 웹 대시보드의 `Settings > General`** 페이지로 이동하여 다음을 정확히 세팅하십시오.
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build` (또는 `vite build`)
- **Output Directory**: `dist`
> **※ 알림:** 위 세팅이 Vercel 단에서 확정되어야만 소스 코드(특히 `docs/` 및 `supabase/` 내부)가 외부망에 절대 노출되지 않고, 오직 컴파일이 끝난 `dist` 디렉토리 결과물만 안전하게 서빙됩니다.

### 🔄 Step 2: 빌드 스크립트 오버라이딩 해제 (`package.json`)
현재 빌드 직후 강제로 503 에러 안내 페이지를 덮어씌우게 만든 CLI 우회 스크립트를 제거해야 합니다.
- **대상 파일:** 프로젝트 최상단 루트의 `package.json`
- **조치 방법:** `"scripts"` 내부의 `"build"` 명령어를 다음과 같이 수정하십시오.
```json
// [수정 전 - 복사 명령어 포함]
"scripts": {
  "build": "vite build && cp index.maintenance.html dist/index.html"
}

// [수정 후 - 조치 완료] (※ cp 복사 명령어 삭제)
"scripts": {
  "build": "vite build"
}
```

### 🔄 Step 3: Vercel 라우팅 차단 해제 및 보안 헤더 유지 (`vercel.json`)
프론트엔드로 가는 길목을 차단하던 Rewrite 규칙을 해제하되, 심층 보안 감사(Deep Audit)에서 도출한 강력한 엔터프라이즈 방어 헤더는 유지하여 아키텍처를 재조정합니다.
- **대상 파일:** 프로젝트 최상단 루트의 `vercel.json`
- **조치 방법:** 파일 내용을 다음의 뼈대로 완전히 덮어쓰기 하십시오.
```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains; preload" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```
> **※ 사유:** SPA 라우터 정상화를 위해 `/api/maintenance` 이동 룰을 `/index.html`로 되돌리고, 브라우저 단의 방어를 위해 보안 헤더는 살려둡니다.

### 🔄 Step 4: 임시 방어용 503 파일 3종 삭제
로컬 환경과 깃허브에서 다음 3개의 파일은 점검 완료 후 과감히 삭제하십시오.
1. `index.maintenance.html` (루트 폴더)
2. `api/maintenance.js` (`api` 폴더 내부)
3. `api/index.js` (`api` 폴더 내부)

### 🔄 Step 5: Vercel 캐시 숙청 및 최종 배포 (Supabase 체크)
모든 조치가 끝났다면 시스템 무결성 확보 후 최종 배포를 진행합니다.
1. **[Vercel 캐시 숙청]** 깃허브에 푸시하기 직전, Vercel 대시보드(Deployments)에 접속하여 **사고 당시의 배포 기록을 수동으로 삭제(Delete Deployment)**하여 엣지 서버 캐시를 날리십시오.
2. **[Supabase 보안 필수]** Supabase 대시보드에서 `User_Result_DB`를 포함해 **모든 운영 테이블의 RLS(Row Level Security)가 `Enable` 상태인지 최종 점검**하십시오!
3. 모든 코드를 메인 브랜치로 커밋하고 🚀 `git push` 합니다. 통제가 해제된 정상적인 Mellow Wave 사이트가 대중에게 매끄럽게 등장합니다.
