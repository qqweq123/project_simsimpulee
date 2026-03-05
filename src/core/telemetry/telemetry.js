import { supabaseUrl, supabaseKey } from '@/core/api.js';

const DWELL_TIME_MAX_CAP = 300000; // 5 minutes max capping

let startTime = 0;
let accumulatedTime = 0;
let isTimerRunning = false;
let currentTestId = '';

export function startQuestionTimer() {
    if (accumulatedTime === 0 && currentTestId) {
        const carry = sessionStorage.getItem(`${currentTestId}_telemetry_carryover`);
        if (carry) accumulatedTime = parseInt(carry, 10);
    }
    startTime = performance.now();
    isTimerRunning = true;
}

export function pauseTimer() {
    if (isTimerRunning) {
        accumulatedTime += (performance.now() - startTime);
        isTimerRunning = false;

        // [Phase 6] 페이지 이동 시 고민 시간 메모리 증발(Reset) 방지용 백업
        if (currentTestId) {
            sessionStorage.setItem(`${currentTestId}_telemetry_carryover`, Math.floor(accumulatedTime).toString());
        }
    }
}

// 브라우저 탭 활성/비활성 감지 이벤트 -> 딴짓할 시 타이머 컷 및 iOS 안전 이탈 로깅
export function initTelemetryListener(testId) {
    currentTestId = testId;
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === 'hidden') {
            pauseTimer();

            // [Phase 3 Architecture] iOS Safari 강제 종료/배경화면 대응
            // pagehide 대신 visibilitychange hidden 상태에서 sendBeacon으로 100% 로깅 보장
            // [Phase 4 Micro-Funnel] testId 동적 주입 및 last_question_index 파싱
            const uuid = sessionStorage.getItem(`${testId.split('_')[0]}_test_uuid`) || 'anonymous';

            // 상태 복구 아키텍처에서 캐싱한 현재 문항 인덱스 추출
            let lastQuestionIndex = null;
            let metaPayload = { back_count: {}, restart_count: 0, result_view_count: 0 };

            try {
                const progressRaw = sessionStorage.getItem(`${testId}_progress`);
                if (progressRaw) {
                    const progress = JSON.parse(progressRaw);
                    if (progress && typeof progress.step === 'number') {
                        lastQuestionIndex = progress.step;
                    }
                }
            } catch (e) {
                console.warn("Failed to parse progress cache", e);
            }

            // [Phase 6] Data Purity Metadata 추출
            try {
                const metaRaw = sessionStorage.getItem(`${testId}_metadata`);
                if (metaRaw) {
                    const meta = JSON.parse(metaRaw);
                    metaPayload.back_count = meta.backCount || {};
                    metaPayload.restart_count = meta.restartCount || 0;
                    metaPayload.result_view_count = meta.resultViewCount || 0;
                }
            } catch (e) { }

            // [Data Architecture] navigator.sendBeacon은 커스텀 헤더를 지원하지 않아 Supabase REST API와 호환성이 떨어집니다.
            // 최신 표준인 fetch(..., { keepalive: true })를 사용하여 보안 헤더(apikey)와 100% 유실없는 이탈률 로깅을 쟁취합니다.
            const payload = JSON.stringify({
                p_uuid: uuid,
                p_test_id: testId,
                p_dwell_time: accumulatedTime,
                p_last_question_index: lastQuestionIndex,
                p_back_count_detail: metaPayload.back_count,
                p_restart_count: metaPayload.restart_count,
                p_result_view_count: metaPayload.result_view_count
            });

            fetch(`${supabaseUrl}/rest/v1/rpc/log_test_dropoff`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`
                },
                body: payload,
                keepalive: true
            }).catch(() => { }); // 백그라운드이므로 에러 시 무음 처리
        } else {
            startQuestionTimer();
        }
    });
}

export function getPureDwellTime() {
    pauseTimer();
    // 아웃라이어 데이터 폐기를 위한 Max Capping 적용 (최대 5분)
    const total = Math.min(accumulatedTime, DWELL_TIME_MAX_CAP);
    accumulatedTime = 0; // 초기화

    // 테스트 종료 시 메모리 누수 및 오염 방지를 위한 Wiping
    if (currentTestId) {
        sessionStorage.removeItem(`${currentTestId}_telemetry_carryover`);
    }

    return Math.floor(total);
}
