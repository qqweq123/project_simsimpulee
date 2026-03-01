<!-- 파일의 기능: Vercel 도메인 오연결 사고에 대한 인시던트 리포트 및 503 방어 조치 방법에 대한 공식 기록 문서 -->
# Vercel 도메인 오연결 및 503 Lock-down 조치 리포트

## 1. 개요
- **일시:** 2026년 3월 1일
- **발생 배경:** 로컬 및 개발 환경 단계인 `mellowwave.me` 도메인이 관리자 실수로 Vercel 메인 프로젝트 환경에 오연결되어 외부 트래픽에 노출됨.
- **식별된 위험:**
  - 미완성 프론트엔드 UI 노출
  - 검색 엔진(Google, Naver 등) 크롤러 봇에 의한 잘못된 인덱싱 (SEO 훼손)
  - 로컬 테스트 환경의 Supabase 설정 및 초기 API 노출

## 2. 해결 방안 아키텍처 (HTTP 503 & No-index)
수석 엔지니어 검토 결과, 단순 Vercel 대시보드 도메인 해제가 아닌, **검색엔진의 오작동을 영구히 차단하고 깔끔한 안내 화면을 띄우는 503 Maintenance 아키텍처**를 채택함.

1. **Vercel Serverless 환경 활용 (`api/maintenance.js`)**
   - 접속 시 HTTP 503 (Service Unavailable) 상태 코드를 고의로 반환
   - 크롤러에게 24시간 후 재방문을 요청하는 `Retry-After: 86400` 응답 추가
   - 사이트 전체 크롤링을 봉쇄하는 `X-Robots-Tag: noindex, nofollow` 헤더 적용
2. **트래픽 가로채기 (`vercel.json`)**
   - 모든 유입 요청 패턴 `/((?!api/maintenance).*)`을 `/api/maintenance` 파일 한 곳으로 Rewrite(가로채기) 되도록 설정하여 프론트엔드 정보가 단 1바이트도 유출되지 않게 조치함.
   - Vercel의 307 Temporary Redirect(Apex -> WWW) 기능이 프론트엔드로 도달하기 직전에 차단.

## 3. 정식 런칭(원복) 시 필요한 단계
정식 서비스를 오픈할 때 진행할 절차는 다음과 같이 매우 간단하며 시스템 재시작 없이 무중단(Zero-downtime) 전환이 가능합니다.

1. 로컬 프로젝트 환경에서 `vercel.json` 파일 안의 `"rewrites"` 구문을 지우거나 파일 전체를 삭제합니다. (필요 시 `api/maintenance.js` 도 삭제를 권장합니다.)
2. `git commit & push`를 실행하여 Vercel에서 재빌드가 돌도록 유도합니다.
3. 배포가 끝남과 동시에 트래픽 락다운이 풀리며 정상 작동하던 사이트가 외부에 열립니다. SEO 크롤링 페널티 또한 존재하지 않습니다.
