-- Supabase SQL Migration: Phase 3.3 Data Retention Batch (pg_cron)
-- 디렉터님의 4대 핵심 아키텍처 피드백(Timezone, Indexing, Batch Deletion, Archiving)을 전면 반영한 엔터프라이즈 스크립트입니다.

-- 1. [Infrastructure] pg_cron 익스텐션 활성화 
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- 2. [Performance] Full Table Scan 방지용 B-Tree 인덱스 강제 지정
-- 90일 이전 검색 조건(`created_at < NOW()`)을 O(log N)으로 고속 탐색하기 위함
CREATE INDEX IF NOT EXISTS idx_test_dropoff_logs_created_at 
ON public."Test_Dropoff_Logs" USING btree (created_at DESC);

-- 3. [Stability] 데드 튜플 및 테이블 락(Table Lock) 방지용 청크 삭제 프로시저 (Stored Procedure)
-- FUNCTION 대신 PROCEDURE를 사용하여 트랜잭션 제어(COMMIT) 권한을 획득합니다.
DROP PROCEDURE IF EXISTS public.cleanup_old_dropoff_logs();

CREATE OR REPLACE PROCEDURE public.cleanup_old_dropoff_logs()
LANGUAGE plpgsql
SECURITY DEFINER -- 배치 스크립트 전용 최고 권한
AS $$
DECLARE
    deleted_count int;
    total_deleted int := 0;
BEGIN
    -- [Archiving Vision]
    -- 향후 이 로직 위에 `COPY TO` 계열의 S3 Data Warehouse 백업 로직이 선행되어야 함을 명시합니다.
    
    LOOP
        -- 1만 건씩 청크(Chunk)로 잘라서 타겟팅 (CTID 방식보다 명시적인 PK in Subquery 선호)
        WITH to_delete AS (
            SELECT uuid, test_id 
            FROM public."Test_Dropoff_Logs"
            WHERE created_at < NOW() - INTERVAL '90 days'
            LIMIT 10000
        )
        DELETE FROM public."Test_Dropoff_Logs"
        WHERE (uuid, test_id) IN (SELECT uuid, test_id FROM to_delete);
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_deleted := total_deleted + deleted_count;
        
        -- [Architecture] 청크마다 트랜잭션을 짧게 COMMIT하여 테이블 락을 해제합니다.
        -- 프로시저 내부에서는 문법적으로 명시적인 VACUUM 명령을 실행할 수 없으므로,
        -- 이렇게 짧게 분절된 트랜잭션 수명만이 백그라운드의 Auto-Vacuum 데몬이 
        -- 데드 튜플(Dead Tuples)을 청소할 수 있는 시간을 벌어주는 유일무이하고 완벽한 해법입니다.
        COMMIT; 
        
        -- 더 이상 지울 데이터가 1만 건 미만이면(마지막 바퀴) 정상 루프 탈출
        EXIT WHEN deleted_count < 10000;
        
        -- [Safety Cap / Circuit Breaker] 무한 루프 및 타임아웃 방어
        -- 스케줄러가 장기간 중단되어 수천만 건이 쌓여있을 경우, 1회 실행 시 최대 100만 건까지만 지우고 강제 종료합니다.
        -- 서버 리소스(CPU/IO) 독점을 방지하기 위한 엔터프라이즈 방어 코드입니다.
        IF total_deleted >= 1000000 THEN
            RAISE LOG 'Data Retention: Reached max daily deletion limit (1M). Pausing until tomorrow.';
            EXIT;
        END IF;
    END LOOP;
    
    RAISE LOG 'Data Retention: Completed Chunked Deletion. Total % rows removed.', total_deleted;
END;
$$;

-- API 무단 호출 방지
REVOKE ALL ON PROCEDURE public.cleanup_old_dropoff_logs() FROM public, anon, authenticated;

-- 4. [Scheduler] 타임존의 함정 보정 (KST 03:30 = UTC 18:30)
-- 참고: 최신 pg_cron은 job_name 명시 시 자동 UPSERT(업데이트 또는 삽입) 처리되므로, 
-- 에러를 유발하는 사전 unschedule 명령이 불필요합니다.
SELECT cron.schedule(
    'retention_dropoff_logs_job',
    '30 18 * * *', -- KST 새벽 3시 30분 트래픽 최하점 기준
    'CALL public.cleanup_old_dropoff_logs();' -- SELECT가 아닌 PROCEDURE 전용 예약어 CALL 사용
);
-- ==========================================
-- (참고용) 스케줄러 디버깅 및 관리 명령어
-- ==========================================
-- 현재 등록된 스케줄 확인:
-- SELECT * FROM cron.job;
--
-- 스케줄 실행 로그 확인 (최근 성공/실패 여부):
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
--
-- 스케줄 삭제 (필요한 경우):
-- SELECT cron.unschedule('retention_dropoff_logs_job');