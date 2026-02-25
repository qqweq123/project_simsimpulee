import { hormoniQuestions } from './data.js';

let currentStep = 0;
let currentQuestions = [];
let totalSteps = 0;
const scores = { "Egen": 0, "Teto": 0 };
let testGender = 'female';

export function initHormoniTest() {
    const urlParams = new URLSearchParams(window.location.search);
    testGender = urlParams.get('gender') || 'female';

    // 성별에 맞는 질문 가져오기, 기본값은 여성
    currentQuestions = hormoniQuestions[testGender] || hormoniQuestions['female'];
    totalSteps = currentQuestions.length;

    renderQuestion();
}

function renderQuestion() {
    const question = currentQuestions[currentStep];

    document.getElementById('question-text').innerHTML = question.q;
    const qNum = document.getElementById('q-num');
    if (qNum) qNum.textContent = currentStep + 1;

    const container = document.getElementById('answers-container');
    container.innerHTML = '';

    question.answers.forEach((ans) => {
        const btn = document.createElement('button');
        btn.className = "group w-full bg-white hover:bg-purple-50 border-2 border-gray-200 hover:border-purple-300 text-gray-700 font-medium py-4 px-6 rounded-xl transition-all duration-200 text-left relative overflow-hidden";
        btn.innerHTML = `
            <span class="relative z-10 block group-hover:text-purple-700 transition-colors">${ans.text}</span>
            <div class="absolute inset-0 bg-purple-50 opacity-0 group-hover:opacity-100 transition-opacity z-0"></div>
        `;
        btn.onclick = () => selectAnswer(ans.type);
        container.appendChild(btn);
    });

    // 프로그레스 바 업데이트
    const progress = ((currentStep + 1) / totalSteps) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
    document.getElementById('progress-text').innerText = `Question ${currentStep + 1} / ${totalSteps}`;

    // 애니메이션 리셋
    const card = document.getElementById('question-card');
    if (card) {
        card.classList.remove('fade-in');
        void card.offsetWidth;
        card.classList.add('fade-in');
    }
}

function selectAnswer(type) {
    if (scores[type] !== undefined) {
        scores[type]++;
    }
    nextStep();
}

function nextStep() {
    currentStep++;
    if (currentStep >= totalSteps) {
        calculateAndShowResult();
    } else {
        renderQuestion();
    }
}

function calculateAndShowResult() {
    const urlParams = new URLSearchParams(window.location.search);
    const gender = urlParams.get('gender') || 'female';

    const totalEgen = scores["Egen"];
    const totalTeto = scores["Teto"];
    const totalAnswers = totalEgen + totalTeto;
    const egenPercent = Math.round((totalEgen / totalAnswers) * 100);
    let resultType = (totalEgen >= totalTeto) ? "Egen" : "Teto";

    location.href = `result.html?gender=${gender}&type=${resultType}&percent=${egenPercent}`;
}
