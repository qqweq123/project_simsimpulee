
import { dessertQuestions } from '@/features/tests/dessert_data.js';

let currentStep = 0;
const totalSteps = dessertQuestions.length;

// MBTI Score Board
const scores = {
    E: 0, I: 0,
    S: 0, N: 0,
    T: 0, F: 0,
    J: 0, P: 0
};

export function initDessertTest() {
    renderQuestion();
}

function renderQuestion() {
    const question = dessertQuestions[currentStep];

    // Update Text
    const qEl = document.getElementById('question-text');
    if (qEl) qEl.innerHTML = question.q;

    // Create Buttons
    const container = document.getElementById('answers-container');
    if (container) {
        container.innerHTML = ''; // Clear

        question.answers.forEach((ans) => {
            const btn = document.createElement('button');
            btn.className = "btn-press w-full bg-gray-50 hover:bg-[var(--color-primary)] hover:text-white border-2 border-gray-100 hover:border-transparent text-gray-700 font-medium py-4 px-6 rounded-xl transition-all duration-200 text-left";
            btn.innerText = ans.text;
            btn.onclick = () => selectAnswer(ans.type);
            container.appendChild(btn);
        });
    }

    // Update Progress
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
    // Calculate MBTI
    const mbti = [
        scores.E >= scores.I ? 'E' : 'I',
        scores.S >= scores.N ? 'S' : 'N',
        scores.T >= scores.F ? 'T' : 'F',
        scores.J >= scores.P ? 'J' : 'P'
    ].join('');

    location.href = `result.html?type=${mbti}`;
}

// Auto init if importing script
// initDessertTest();
