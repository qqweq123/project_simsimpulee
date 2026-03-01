---
title: Supabase Security & Edge Architecture
author: Data Architecture Director
created_date: 2026-02-25
last_updated: "2026-02-27"
status: Active
dependencies: ["supabase-postgres-best-practices"]
---

# 03. Supabase 보안 및 엣지 아키텍처 (Supabase Best Practices)

> **목적**: `supabase-postgres-best-practices` 에이전트 스킬 준수를 기반으로, 데이터 권한 관리(RLS)와 외부 공유 최적화를 위한 서버리스 함수(Edge Functions)의 설계 기준을 정의합니다. 

---

## 1. Row Level Security (RLS) 기반 보안 체계

프론트엔드 환경에서 Supabase JS 클라이언트를 통해 데이터베이스에 직접 접근하는 서버리스 아키텍처의 특성상, 테이블별 **RLS (Row Level Security)** 활성화는 필수 불가결한 컴플라이언스(Compliance) 규정입니다.

### 🚫 안티패턴 (지양해야 할 패턴)
RLS 정책(Policy) 평가 시 커스텀 PL/pgSQL 함수를 호출하는 것은 심각한 성능 병목(Performance bottleneck)을 초래합니다. 대용량 트래픽 쿼리 시 Row 갯수만큼 함수가 실행될 수 있습니다.

### ✅ 베스트 프랙티스 (권장 수칙)
인증된 JWT 토큰 자체에 내장된 페이로드 검증 방식을 가장 우선합니다.

```sql
-- [예시] User_Result_DB: 익명 사용자 삽입(Insert) 허용, 단 조회(Select)는 본인 세션만
ALTER TABLE public.user_results ENABLE ROW LEVEL SECURITY;

-- Policy: 삽입은 누구나 가능 (Honeypot을 통과한 프론트엔드 요청)
CREATE POLICY "Allow anonymous inserts" 
ON public.user_results FOR INSERT 
TO anon 
WITH CHECK (true);

-- Policy: 조회는 마이페이지 접속 등 auth.uid()가 일치할 때만 (향후 로그인 연동 시)
CREATE POLICY "Allow users to read own results" 
ON public.user_results FOR SELECT 
USING (auth.uid() = user_session_id);
```

---

## 2. 정밀 텔레메트리 보정 (Telemetry Correction)

데이터의 신뢰성을 오염시키는 트래픽(딴짓, 봇)을 차단하는 로직(Anti-Abusing)에 대한 프론트-백 환경 연계 가이드입니다.

1. **문항 체류시간 왜곡 방어 (Page Visibility API)**
   * 유저의 앱 이탈(백그라운드 진입 등) 시 타이머가 도는 현상을 방지합니다.
   * `document.addEventListener("visibilitychange", ...)` 이벤트를 사용하여 `document.hidden === true`일 때 측정을 일시정지 하고, 복귀 시 재개하여 "순수한 고민 시간(`dwell_time_ms`)"을 산출하여 Supabase `event_logs` 테이블로 적재합니다.

2. **허니팟(Honeypot) 필드를 통한 봇 트래픽 격리**
   * HTML 상에 CSS(`display: none` 또는 `.sr-only`)로 숨겨진 체크박스를 생성합니다.
   * 크롤러/스팸 봇이 이 필드를 조작하여(Value 삽입 등) API Submit을 태울 경우, 프론트엔드 미들웨어 단계에서 바로 차단하거나, 최소한 데이터베이스 `Insert` 전 단계에서 무효화 조치합니다.

---

## 3. 동적 소셜 공유 및 메타 태그 최적화 (Edge Functions)

카카오톡, 페이스북 등의 소셜 봇(Crawler)은 클라이언트 사이드 JavaScript 환경(React/Vanilla SPA)을 실행하지 않습니다. 즉, 브라우저가 DOM에 그려주는 동적인 태그를 무시합니다.

이를 해결하기 위해 **Supabase Edge Functions**를 프로토콜 인터셉터로 활용합니다.

### 워크플로우 명세 (Edge OG-Injector)
1. **Trigger**: 유저가 공유받은 동적 URL 경로(예: `https://mellowave.me/share?result=leader`)를 클릭합니다. (혹은 크롤러 봇이 해당 URL을 스크랩합니다)
2. **Intercept**: 해당 요청은 정적 프론트 서버로 바로 가지 않고 Supabase Edge Function이 가장 앞에서 요격(Intercept)합니다.
3. **Fetch & Render**: 함수 내부에서 `result=leader` 파라미터를 읽고, DB(`tests_metadata`)에서 leader 결과의 매력적인 `og:title`, `og:image` 값을 매우 빠르게 조회합니다.
4. **Response**: 동적 메타 태그가 심어진 순수 HTML 껍데기를 Crawler에게 응답(Return)하여 예쁜 썸네일을 생성하게 합니다.
5. **Redirect**: 만약 요청 주체가 사람이 사용하는 정상 브라우저라면, 잠깐의 껍데기 렌더링 직후 `window.location.replace('/actual-target-path')` 스크립트를 통해 본래의 프론트엔드 애플리케이션으로 부드럽게 넘겨줍니다.
