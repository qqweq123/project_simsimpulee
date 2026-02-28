import { dopamineQuestions } from '@/features/tests/dopamine/data.js';
import { ScoreCalculator as TestEngine } from '@/core/engine/ScoreCalculator.js';
import { initTelemetryListener, startQuestionTimer, getPureDwellTime } from '@/core/telemetry/telemetry.js';
import { isBotTraffic } from '@/core/security/honeypot.js';

let currentStep = 0;
const totalSteps = dopamineQuestions.length;
const scores = { scroller: 0, consumer: 0, stan: 0, sloth: 0 };

export function initDopamineTest() {
    // 텔레메트리 초기화 (island의 검증 모듈을 허브로 재사용)
    initTelemetryListener();
    startQuestionTimer();

    // Event Delegation 적용
    const container = document.getElementById('answers-container');
    if (container) {
        container.addEventListener('click', handleAnswerClick);
    }

    renderQuestion();
}

function handleAnswerClick(e) {
    const btn = e.target.closest('.answer-btn');
    if (!btn) return;

    btn.blur(); // 잔상 방어

    const type = btn.dataset.type;
    if (type) {
        setTimeout(() => selectAnswer(type), 50);
    }
}

function renderQuestion() {
    const question = dopamineQuestions[currentStep];

    const qEl = document.getElementById('question-text');
    if (qEl) qEl.innerHTML = question.q;

    const container = document.getElementById('answers-container');
    if (container) {
        // Hydration: 기존 버튼 재활용
        const buttons = Array.from(container.querySelectorAll('.answer-btn'));
        question.answers.forEach((ans, index) => {
            if (buttons[index]) {
                buttons[index].innerText = ans.text;
                buttons[index].dataset.type = ans.type;
            }
        });
    }

    // Progress Bar
    const progress = ((currentStep + 1) / totalSteps) * 100;
    const bar = document.getElementById('progress-bar');
    const text = document.getElementById('progress-text');
    if (bar) bar.style.width = `${progress}%`;
    if (text) text.innerText = `${currentStep + 1} / ${totalSteps}`;

    // Animation Restart
    const card = document.getElementById('question-card');
    if (card) {
        card.classList.remove('fade-in');
        void card.offsetWidth;
        card.classList.add('fade-in');
    }
}

function selectAnswer(type) {
    if (scores[type] !== undefined) scores[type]++;
    currentStep++;

    if (currentStep >= totalSteps) {
        showResult();
    } else {
        renderQuestion();
    }
}

function showResult() {
    // 1선 방어망(HP_TRAP) 검증
    if (isBotTraffic()) {
        console.warn("Invalid Traffic Detected");
        location.href = '/index.html';
        return;
    }

    const pureDwellTime = getPureDwellTime();

    if (!sessionStorage.getItem('dopamine_test_uuid')) {
        const uuid = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `dopa-${Date.now()}-${Math.random()}`;
        sessionStorage.setItem('dopamine_test_uuid', uuid);
    }
    sessionStorage.setItem('dopamine_test_started', 'true');
    sessionStorage.setItem('dopamine_last_dwell_time', pureDwellTime.toString());

    // [핵심] 에니어그램 날개 스키마 적용 (상위 2개 랭크 추출)
    const topRanked = TestEngine.getTopRankedKeys(scores, 2);
    const encoded = TestEngine.encodeScores(topRanked);

    location.href = `result.html?mode=owner&ranks=${encoded}`;
}
