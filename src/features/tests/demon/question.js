import { demonQuestions, archetypeMatrix, getScoreCategory } from '@/features/tests/demon/data.js';

let currentQuestionIndex = 0;
let scores = {
    CONV: 0, LOSS: 0, DEF: 0, SURV: 0,
    V1_EXT: 0, V1_INT: 0, V2_LOG: 0, V2_EMP: 0,
    V3_ACC: 0, V3_RES: 0, REL_HOR: 0, REL_VER: 0,
    DRV_FUT: 0, DRV_PST: 0,
};

export function initDemonTest() {
    showQuestion();
}

function showQuestion() {
    const item = demonQuestions[currentQuestionIndex];

    // 1. Progress
    const progress = ((currentQuestionIndex + 1) / demonQuestions.length) * 100;
    document.getElementById('curr-q').textContent = currentQuestionIndex + 1;
    document.getElementById('progress-bar').style.width = `${progress}%`;

    // 2. Elements with Animation Reset
    const narrativeEl = document.getElementById('narrative');
    const questionEl = document.getElementById('question-text');
    const answersEl = document.getElementById('answers');

    // Reset Animation State
    [narrativeEl, questionEl, answersEl].forEach(el => {
        el.className = el.className.replace(/opacity-100 translate-y-0/g, 'opacity-0 translate-y-4');
        // Force reflow
        void el.offsetWidth;
    });

    // 3. Content Update
    narrativeEl.textContent = item.narrative;
    questionEl.textContent = item.question;

    answersEl.innerHTML = '';

    // Shuffle
    let shuffledAnswers = [...item.answers];
    for (let i = shuffledAnswers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledAnswers[i], shuffledAnswers[j]] = [shuffledAnswers[j], shuffledAnswers[i]];
    }

    shuffledAnswers.forEach((answer, idx) => {
        const button = document.createElement('button');
        button.innerHTML = `<span class="relative z-10">${answer.text}</span>`;
        button.className = "w-full btn-slash text-left group opacity-0 translate-y-4 transition-all duration-500 fill-mode-forwards";
        button.style.animationDelay = `${idx * 100}ms`; // Staggered appearance
        button.onclick = () => selectAnswer(answer.score);
        answersEl.appendChild(button);
    });

    // 4. Trigger Appear Animation
    setTimeout(() => {
        narrativeEl.classList.add('opacity-100', 'translate-y-0');
        narrativeEl.classList.remove('opacity-0', 'translate-y-4');

        questionEl.classList.add('opacity-100', 'translate-y-0');
        questionEl.classList.remove('opacity-0', 'translate-y-4');

        answersEl.classList.remove('opacity-0', 'translate-y-4'); // Container visible

        // Children buttons
        Array.from(answersEl.children).forEach((btn, i) => {
            setTimeout(() => {
                btn.classList.add('opacity-100', 'translate-y-0');
                btn.classList.remove('opacity-0', 'translate-y-4');
            }, i * 150 + 300);
        });
    }, 100);
}

function selectAnswer(scoreToAdd) {
    // Add Score
    for (const key in scoreToAdd) {
        scores[key] += scoreToAdd[key];
    }

    // Slash Effect (Screen Shake or flash)
    document.body.classList.add('animate-pulse');
    setTimeout(() => document.body.classList.remove('animate-pulse'), 300);

    currentQuestionIndex++;

    if (currentQuestionIndex < demonQuestions.length) {
        // Delay for transition
        setTimeout(showQuestion, 400);
    } else {
        showLoading();
    }
}

function showLoading() {
    const qScreen = document.getElementById('question-screen');
    qScreen.innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-[50vh] fade-in">
            <div class="w-24 h-24 border-4 border-l-red-500 border-r-blue-500 border-t-transparent border-b-transparent rounded-full animate-spin"></div>
            <h2 class="mt-8 text-2xl font-art text-white animate-pulse">호흡을 가다듬는 중...</h2>
            <p class="text-gray-400 mt-2 text-sm">내면의 소리에 귀를 기울입니다.</p>
        </div>
    `;

    setTimeout(() => {
        calculateResult();
    }, 3000); // 3s delay for suspense
}

function calculateResult() {
    const V1_Axis = scores.V1_EXT - scores.V1_INT;
    const V2_Axis = scores.V2_EMP - scores.V2_LOG;
    const V3_Axis = scores.V3_RES - scores.V3_ACC;
    const REL_Axis = scores.REL_HOR - scores.REL_VER;
    const DRV_Axis = scores.DRV_FUT - scores.DRV_PST;

    const coreScores = [
        { name: 'CONV', value: scores.CONV },
        { name: 'LOSS', value: scores.LOSS },
        { name: 'DEF', value: scores.DEF },
        { name: 'SURV', value: scores.SURV }
    ];
    coreScores.sort((a, b) => b.value - a.value);

    const primaryCore = coreScores[0].name;
    const secondaryCore = coreScores[1].name;
    const coreDifference = coreScores[0].value - coreScores[1].value;

    const userProfile = {
        core: primaryCore,
        v1: getScoreCategory('V1_Axis', V1_Axis),
        v2: getScoreCategory('V2_Axis', V2_Axis),
        v3: getScoreCategory('V3_Axis', V3_Axis),
        rel: getScoreCategory('REL_Axis', REL_Axis),
        drv: getScoreCategory('DRV_Axis', DRV_Axis)
    };

    let bestMatch = "이름 없는 귀살대원";
    let highestScore = -1;
    let specialCaseFound = false;

    if (coreDifference <= 1 && userProfile.v1 === '균형' && userProfile.v2 === '균형' && userProfile.v3 === '균형') {
        bestMatch = "이름 없는 귀살대원";
        specialCaseFound = true;
    }
    else if (primaryCore === 'LOSS' && (V1_Axis >= -2 && V1_Axis <= 2) && scores.V1_EXT > 5 && scores.V1_INT > 5) {
        bestMatch = "잠자는 뇌신";
        specialCaseFound = true;
    }
    else if ((primaryCore === 'DEF' && secondaryCore === 'LOSS' && coreDifference <= 2) || (primaryCore === 'LOSS' && secondaryCore === 'DEF' && coreDifference <= 2)) {
        bestMatch = "상처 입은 남매";
        specialCaseFound = true;
    }

    if (!specialCaseFound) {
        for (const archetype in archetypeMatrix) {
            if (archetype === "잠자는 뇌신" || archetype === "상처 입은 남매" || archetype === "이름 없는 귀살대원" || archetype === "길 잃은 혈귀") continue;

            const matrix = archetypeMatrix[archetype];
            let currentScore = 0;

            if (matrix.core === userProfile.core) currentScore += 10;
            if (userProfile.v1.includes(matrix.v1.split(" ")[0])) currentScore += 2;
            if (userProfile.v2.includes(matrix.v2.split(" ")[0])) currentScore += 2;
            if (userProfile.v3.includes(matrix.v3.split(" ")[0])) currentScore += 2;
            if (userProfile.rel.includes(matrix.rel.split(" ")[0])) currentScore += 2;
            if (userProfile.drv.includes(matrix.drv.split(" ")[0])) currentScore += 2;

            if (currentScore > highestScore) {
                highestScore = currentScore;
                bestMatch = archetype;
            }
        }
    }

    // 결과 페이지로 이동 (테마 파라미터 제외, result.html 자체가 전용 테마임)
    window.location.href = `result.html?archetype=${encodeURIComponent(bestMatch)}`;
}
