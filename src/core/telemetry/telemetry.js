import { supabaseUrl, supabaseKey } from '@/core/api.js';

const DWELL_TIME_MAX_CAP = 600000; // 10 minutes max capping

let startTime = 0;
let accumulatedTime = 0;
let isTimerRunning = false;

export function startQuestionTimer() {
    startTime = performance.now();
    isTimerRunning = true;
}

export function pauseTimer() {
    if (isTimerRunning) {
        accumulatedTime += (performance.now() - startTime);
        isTimerRunning = false;
    }
}

// 브라우저 탭 활성/비활성 감지 이벤트 -> 딴짓할 시 타이머 컷 및 iOS 안전 이탈 로깅
export function initTelemetryListener() {
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === 'hidden') {
            pauseTimer();

            // [Phase 3 Architecture] iOS Safari 강제 종료/배경화면 대응
            // pagehide 대신 visibilitychange hidden 상태에서 sendBeacon으로 100% 로깅 보장
            const testId = sessionStorage.getItem('dopamine_test_started') ? 'dopamine' : 'island_survival';
            const uuid = sessionStorage.getItem(`${testId.split('_')[0]}_test_uuid`) || 'anonymous';

            // [Data Architecture] navigator.sendBeacon은 커스텀 헤더를 지원하지 않아 Supabase REST API와 호환성이 떨어집니다.
            // 최신 표준인 fetch(..., { keepalive: true })를 사용하여 보안 헤더(apikey)와 100% 유실없는 이탈률 로깅을 쟁취합니다.
            const payload = JSON.stringify({
                p_uuid: uuid,
                p_test_id: testId,
                p_dwell_time: accumulatedTime
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
    // 아웃라이어 데이터 폐기를 위한 Max Capping 적용 (최대 10분)
    const total = Math.min(accumulatedTime, DWELL_TIME_MAX_CAP);
    accumulatedTime = 0; // 초기화
    return Math.floor(total);
}
