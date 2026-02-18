
import { islandQuestions, getTopType } from './data.js';

let currentStep = 0;
const totalSteps = islandQuestions.length;
const scores = { leader: 0, explorer: 0, survivor: 0, diplomat: 0 };

export function initIslandTest() {
    renderQuestion();
}

function renderQuestion() {
    const question = islandQuestions[currentStep];

    const qEl = document.getElementById('question-text');
    if (qEl) qEl.innerHTML = question.q;

    const container = document.getElementById('answers-container');
    if (container) {
        container.innerHTML = '';
        question.answers.forEach((ans) => {
            const btn = document.createElement('button');
            btn.className = "btn-press w-full bg-gray-50 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-teal-600 hover:text-white border-2 border-gray-100 hover:border-transparent text-gray-700 font-medium py-4 px-6 rounded-xl transition-all duration-200 text-left";
            btn.innerText = ans.text;
            btn.onclick = () => selectAnswer(ans.type);
            container.appendChild(btn);
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
    const topType = getTopType(scores);
    const encoded = encodeURIComponent(JSON.stringify(scores));
    location.href = `result.html?type=${topType}&scores=${encoded}`;
}
