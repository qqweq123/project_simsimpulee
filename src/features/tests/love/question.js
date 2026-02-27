
import { loveQuestions, getGrade } from '@/features/tests/love/data.js';

let currentStep = 0;
const totalSteps = loveQuestions.length;
let totalScore = 0;

export function initLoveTest() {
    renderQuestion();
}

function renderQuestion() {
    const question = loveQuestions[currentStep];

    const qEl = document.getElementById('question-text');
    if (qEl) qEl.innerHTML = question.q;

    const container = document.getElementById('answers-container');
    if (container) {
        container.innerHTML = '';
        question.answers.forEach((ans) => {
            const btn = document.createElement('button');
            btn.className = "btn-press w-full bg-gray-50 hover:bg-gradient-to-r hover:from-pink-400 hover:to-rose-500 hover:text-white border-2 border-gray-100 hover:border-transparent text-gray-700 font-medium py-4 px-6 rounded-xl transition-all duration-200 text-left";
            btn.innerText = ans.text;
            btn.onclick = () => selectAnswer(ans.score);
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

function selectAnswer(score) {
    totalScore += score;
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
    const grade = getGrade(totalScore);
    location.href = `result.html?grade=${grade}&score=${totalScore}`;
}
