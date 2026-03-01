-- Supabase SQL Migration: Phase 3 Telemetry Participant Tracking
-- 이 스크립트를 Supabase Dashboard -> SQL Editor 에 복사하여 실행하세요.

-- 1. Test_Meta_DB 테이블이 없다면 생성 (기존에 있다면 생략)
CREATE TABLE IF NOT EXISTS public."Test_Meta_DB" (
    test_id text PRIMARY KEY,
    participants_count bigint DEFAULT 0 NOT NULL,
    completions_count bigint DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 1.5. 기존 테이블 업데이트 (이전 스크립트로 테이블이 이미 생성된 경우 컬럼 추가)
ALTER TABLE public."Test_Meta_DB" ADD COLUMN IF NOT EXISTS completions_count bigint DEFAULT 0 NOT NULL;

-- [security-01] RLS 활성화 및 SELECT 전용 정책 부여 (Frontend Read-Only)
ALTER TABLE public."Test_Meta_DB" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON public."Test_Meta_DB";
CREATE POLICY "Allow public read access"
ON public."Test_Meta_DB"
FOR SELECT
TO public
USING (true);

-- 2. increment_test_participants RPC 함수 보완 (upsert 로직 포함)
-- 만약 기존에 함수가 만들어져있다면 DROP 후 재생성
DROP FUNCTION IF EXISTS public.increment_test_participants(text);

CREATE OR REPLACE FUNCTION public.increment_test_participants(p_test_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- RLS를 우회하여 통계 수치를 안전하게 증가시키기 위함
AS $$
BEGIN
  INSERT INTO public."Test_Meta_DB" (test_id, participants_count)
  VALUES (p_test_id, 1)
  ON CONFLICT (test_id)
  DO UPDATE SET participants_count = "Test_Meta_DB".participants_count + 1;
END;
$$;

-- 3. increment_test_completions RPC 함수 (실제 테스트 완료자 전용, 비공개 통계)
DROP FUNCTION IF EXISTS public.increment_test_completions(text);

CREATE OR REPLACE FUNCTION public.increment_test_completions(p_test_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public."Test_Meta_DB" (test_id, completions_count)
  VALUES (p_test_id, 1)
  ON CONFLICT (test_id)
  DO UPDATE SET completions_count = "Test_Meta_DB".completions_count + 1;
END;
$$;

-- [Seed Data] 배포 초기 데이터 주입 (SEO값 동기화)
INSERT INTO public."Test_Meta_DB" (test_id, participants_count, completions_count)
VALUES 
    ('island', 5231, 0),
    ('dopamine', 12104, 0),
    ('love', 4321, 0),
    ('demon', 2132, 0),
    ('hormoni', 8654, 0),
    ('dessert', 14232, 0)
ON CONFLICT (test_id) DO NOTHING;

-- 4. (옵션) 익명 사용자도 이 RPC를 호출할 수 있도록 권한 부여
GRANT EXECUTE ON FUNCTION public.increment_test_participants(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_test_completions(text) TO anon, authenticated;


-- ==============================================================
-- [Phase 3] Telemetry API: Drop-off & Dwell Time Logging System
-- ==============================================================

-- 1. Dropoff 로그 적재 테이블 (Append-Only)
CREATE TABLE IF NOT EXISTS public."Test_Dropoff_Logs" (
    uuid text NOT NULL,
    test_id text NOT NULL,
    dwell_time integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (uuid, test_id)
);

-- [schema-01] 시계열 조회(최근 24시간 필터링 등) 시 Full Table Scan을 방지하기 위한 B-Tree 인덱스 도입
CREATE INDEX IF NOT EXISTS idx_test_dropoff_logs_created_at 
ON public."Test_Dropoff_Logs" USING btree (created_at DESC);

-- 보안: Row-Level Security 활성화 (REST API 단순 INSERT 방어)
ALTER TABLE public."Test_Dropoff_Logs" ENABLE ROW LEVEL SECURITY;

-- 2. Dropoff Logging RPC (RLS Bypass)
DROP FUNCTION IF EXISTS public.log_test_dropoff(text, text, integer);

CREATE OR REPLACE FUNCTION public.log_test_dropoff(p_uuid text, p_test_id text, p_dwell_time integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- RLS 우회하여 강제 통계 적재 (telemetry API의 핵심)
AS $$
BEGIN
  INSERT INTO public."Test_Dropoff_Logs" (uuid, test_id, dwell_time)
  VALUES (p_uuid, p_test_id, p_dwell_time)
  ON CONFLICT (uuid, test_id)
  DO UPDATE SET dwell_time = EXCLUDED.dwell_time, created_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_test_dropoff(text, text, integer) TO anon, authenticated;
