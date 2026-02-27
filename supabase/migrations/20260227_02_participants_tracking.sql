-- Mellow Wave Phase 2: Participant Tracking Telemetry
-- Written by Director of Data Architecture & Governance

-- 1. Test_Meta_DB 테이블에 참여자 수 집계 컬럼(participants_count) 추가
ALTER TABLE Test_Meta_DB 
ADD COLUMN IF NOT EXISTS participants_count BIGINT DEFAULT 0;

-- 2. 안전한 증분(Increment)을 위한 원자적(Atomic) RPC 함수 생성
-- 프론트엔드에서 버튼 클릭이나 렌더링 시점에 비동기로 호출됩니다.
CREATE OR REPLACE FUNCTION increment_test_participants(p_test_id VARCHAR(50))
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Anon 사용자가 임의의 쿼리를 조작하지 못하도록 방어
AS $$
BEGIN
    -- test_id가 존재하면 participants_count를 1 증가시킵니다. (Atomic Update)
    UPDATE Test_Meta_DB
    SET participants_count = participants_count + 1,
        updated_at = NOW()
    WHERE test_id = p_test_id;
END;
$$;
