import { islandQuestions } from '@/features/tests/island/data.js';
import { TestEngine } from '@/core/testEngine.js';
import { initTelemetryListener, startQuestionTimer, getPureDwellTime } from '@/features/tests/island/utils/telemetry.js';
import { isBotTraffic } from '@/features/tests/island/utils/honeypot.js';

let currentStep = 0;
const totalSteps = islandQuestions.length;
const scores = { leader: 0, explorer: 0, survivor: 0, diplomat: 0 };

export function initIslandTest() {
    // 1. 텔레메트리 및 어뷰저 방어 초기화
    initTelemetryListener();
    startQuestionTimer();

    // 이벤트 위임(Event Delegation) 설정
    const container = document.getElementById('answers-container');
    if (container) {
        container.addEventListener('click', handleAnswerClick);
    }

    // 2. 문제 렌더링 (Hydration)
    renderQuestion();
}

function handleAnswerClick(e) {
    const btn = e.target.closest('.answer-btn');
    if (!btn) return;

    btn.blur(); // 포커스 해제 (모바일/사파리 잔상 방지)

    const type = btn.dataset.type;
    if (type) {
        // 즉각적인 DOM 변이로 인한 :active CSS Stuck 현상 방지를 위해 Call Stack을 잠시 비워줌
        setTimeout(() => selectAnswer(type), 50);
    }
}

function renderQuestion() {
    const question = islandQuestions[currentStep];

    const qEl = document.getElementById('question-text');
    if (qEl) qEl.innerHTML = question.q;

    const container = document.getElementById('answers-container');
    if (container) {
        // DOM을 부수지 않고 값만 교체하는 Hydration 기법
        const buttons = Array.from(container.querySelectorAll('.answer-btn'));
        question.answers.forEach((ans, index) => {
            if (buttons[index]) {
                buttons[index].innerText = ans.text;
                buttons[index].dataset.type = ans.type;
            }
        });
    }

    // Progress
    const progress = ((currentStep + 1) / totalSteps) * 100;
    const bar = document.getElementById('progress-bar');
    const text = document.getElementById('progress-text');
    if (bar) bar.style.width = `${progress}%`;
    if (text) text.innerText = `${currentStep + 1} / ${totalSteps}`;

    // Animation
    const card = document.getElementById('question-card');
    if (card) {
        card.classList.remove('fade-in');
        void card.offsetWidth;
        card.classList.add('fade-in');
    }
}

function selectAnswer(type) {
    if (scores[type] !== undefined) scores[type]++;
    nextStep();
}

function nextStep() {
    currentStep++;
    if (currentStep >= totalSteps) {
        showResult();
    } else {
        renderQuestion();
    }
}

function showResult() {
    // 봇 트래픽 필터링 (허니팟 체크 시 무반응 혹은 튕겨내기)
    if (isBotTraffic()) {
        console.warn("Invalid Traffic Detected");
        location.href = '/index.html';
        return;
    }

    // 체류 시간 및 통계 처리
    const pureDwellTime = getPureDwellTime();

    // 식별자 및 검증 플래그 발급 (Owner Mode 증명서)
    if (!sessionStorage.getItem('island_test_uuid')) {
        const uuid = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `user-${Date.now()}-${Math.random()}`;
        sessionStorage.setItem('island_test_uuid', uuid);
    }
    sessionStorage.setItem('island_test_started', 'true'); // 보안 검증 패스포트 부여
    sessionStorage.setItem('island_last_dwell_time', pureDwellTime.toString()); // 차후 RPC 전송용 캐싱

    const topType = TestEngine.getHighestScoreKey(scores);
    const encoded = TestEngine.encodeScores(scores);

    // Save UTM and mode parameters to pass them to result page
    location.href = `result.html?mode=owner&type=${topType}&scores=${encoded}`;
}
