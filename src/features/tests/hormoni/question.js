
import { hormoniQuestions } from '@/features/tests/hormoni_data.js';

let currentStep = 0;
const totalSteps = hormoniQuestions.length;
const scores = { "estrogen": 0, "testosterone": 0 }; // Renamed keys for clarity if needed, or stick to data

export function initHormoniTest() {
    renderQuestion();
}

function renderQuestion() {
    const question = hormoniQuestions[currentStep];

    // Update Text
    const qEl = document.getElementById('question-text');
    if (qEl) qEl.innerHTML = question.q;

    // Create Buttons
    const container = document.getElementById('answers-container');
    if (container) {
        container.innerHTML = '';

        question.answers.forEach((ans) => {
            const btn = document.createElement('button');
            btn.className = "w-full bg-pink-50 hover:bg-pink-100 border-2 border-pink-200 text-pink-900 font-medium py-4 px-6 rounded-xl transition-all duration-200 text-left mb-3";
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
    // Logic: Compare Estrogen vs Testosterone
    // If Estrogen > Testosterone => Estrogen Type
    // If Testosterone > Estrogen => Testosterone Type
    // If Tie => Default or specific logic? Original code probably had logic.
    // Original logic check:
    // const resultType = scores['estrogen'] > scores['testosterone'] ? 'estrogen' : 'testosterone';

    const resultType = scores['estrogen'] >= scores['testosterone'] ? 'estrogen' : 'testosterone';
    location.href = `result.html?type=${resultType}`;
}
