-- Mellow Wave Phase 2 Database Architecture
-- Written by General Engineer

-- 1. Test Meta (문항/해설/플래그 메타데이터 - JSONB)
CREATE TABLE IF NOT EXISTS Test_Meta_DB (
    test_id VARCHAR(50) PRIMARY KEY, -- ex) 'island_survival'
    questions_jsonb JSONB NOT NULL CHECK (jsonb_typeof(questions_jsonb) = 'array'),
    weights_jsonb JSONB NOT NULL CHECK (jsonb_typeof(weights_jsonb) = 'object'),
    results_jsonb JSONB NOT NULL CHECK (jsonb_typeof(results_jsonb) = 'object'),
    hashtag_rules JSONB CHECK (jsonb_typeof(hashtag_rules) = 'array'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User Result (최종 결과 저장소)
CREATE TABLE IF NOT EXISTS User_Result_DB (
    id BIGSERIAL PRIMARY KEY,
    test_id VARCHAR(50) REFERENCES Test_Meta_DB(test_id),
    user_uuid UUID NOT NULL,
    final_result VARCHAR(50) NOT NULL CHECK (length(final_result) > 0),
    utm_source VARCHAR(255),
    client_ip_hash VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Event Log (텔레메트리 데이터)
CREATE TABLE IF NOT EXISTS Event_Log_DB (
    id BIGSERIAL PRIMARY KEY,
    test_id VARCHAR(50) REFERENCES Test_Meta_DB(test_id),
    user_uuid UUID NOT NULL,
    question_id INT NOT NULL,
    dwell_time_ms INT NOT NULL, -- 순수 고민 시간
    drop_off_flag BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 퍼포먼스 튜닝: 복합 인덱스 (대규모 트래픽 Full Scan 병목 방지)
CREATE INDEX IF NOT EXISTS idx_event_log_test_question ON Event_Log_DB (test_id, question_id);

-- ==========================================
-- [보안] 강력한 문지기 (RLS & Gatekeeper 정책)
-- ==========================================
ALTER TABLE User_Result_DB ENABLE ROW LEVEL SECURITY;
ALTER TABLE Event_Log_DB ENABLE ROW LEVEL SECURITY;

-- 프론트엔드 (Anon Key) 에서 직접 들어오는 모든 SELECT, INSERT, UPDATE, DELETE 차단 정책
-- 특별히 CREATE POLICY를 정의하지 않았으므로 기본적으로 Deny-All 상태입니다.

-- Gatekeeper 함수 (Stored Procedure) 정의
CREATE OR REPLACE FUNCTION log_user_result(
    p_test_id VARCHAR(50),
    p_uuid UUID,
    p_result VARCHAR(50),
    p_utm_source VARCHAR(255) DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- **핵심: 이 함수는 호출자가 아닌 '생성자(Admin)' 권한으로 실행됨**
AS $$
BEGIN
    -- 1. 중복 호출 방어 (Race Condition 차단)
    IF EXISTS (
        SELECT 1 FROM User_Result_DB 
        WHERE test_id = p_test_id AND user_uuid = p_uuid
    ) THEN
        RETURN; -- 이미 저장된 UUID면 무시하고 조용히 종료 (따닥 클릭 방어)
    END IF;

    -- 2. 안전하게 데이터 Insert 
    INSERT INTO User_Result_DB (test_id, user_uuid, final_result, utm_source)
    VALUES (p_test_id, p_uuid, p_result, p_utm_source);
END;
$$;
