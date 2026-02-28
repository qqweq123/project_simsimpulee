-- Supabase SQL Migration: Phase 3 Telemetry Participant Tracking
-- 이 스크립트를 Supabase Dashboard -> SQL Editor 에 복사하여 실행하세요.

-- 1. Test_Meta_DB 테이블이 없다면 생성 (기존에 있다면 생략)
CREATE TABLE IF NOT EXISTS public."Test_Meta_DB" (
    test_id text PRIMARY KEY,
    participants_count bigint DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

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

-- 3. (옵션) 익명 사용자도 이 RPC를 호출할 수 있도록 권한 부여
GRANT EXECUTE ON FUNCTION public.increment_test_participants(text) TO anon, authenticated;


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
