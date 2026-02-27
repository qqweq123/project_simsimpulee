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

// 브라우저 탭 활성/비활성 감지 이벤트 -> 딴짓할 시 타이머 컷
export function initTelemetryListener() {
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            pauseTimer();
        } else {
            startQuestionTimer();
        }
    });

    // 불의의 탭 종료 시, 마지막 남은 로깅 정보 전송 (sendBeacon)
    window.addEventListener("pagehide", () => {
        const testId = 'island_survival';
        // Note: UUID나 Question_ID 등은 상태 컨테이너에서 가져와야 함.
        const uuid = sessionStorage.getItem('island_test_uuid') || 'anonymous';

        // TODO: 서버 연동 시 payload 구조 확정 및 엔드포인트 기입
        const payload = JSON.stringify({ uuid, test_id: testId, drop_off_flag: true });
        // navigator.sendBeacon('/api/log/dropoff', payload);
    });
}

export function getPureDwellTime() {
    pauseTimer();
    // 아웃라이어 데이터 폐기를 위한 Max Capping 적용 (최대 10분)
    const total = Math.min(accumulatedTime, DWELL_TIME_MAX_CAP);
    accumulatedTime = 0; // 초기화
    return Math.floor(total);
}
