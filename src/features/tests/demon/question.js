import { demonQuestions, archetypeMatrix, getScoreCategory } from './data.js';

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

    const progress = ((currentQuestionIndex + 1) / demonQuestions.length) * 100;
    document.getElementById('progress-text').textContent = `${currentQuestionIndex + 1} / ${demonQuestions.length}`;
    document.getElementById('progress-bar').style.width = `${progress}%`;

    document.getElementById('narrative-text').textContent = item.narrative;
    document.getElementById('question-text').textContent = item.question;

    const answerButtons = document.getElementById('answer-buttons');
    answerButtons.innerHTML = '';

    // 셔플 로직
    let shuffledAnswers = [...item.answers];
    for (let i = shuffledAnswers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledAnswers[i], shuffledAnswers[j]] = [shuffledAnswers[j], shuffledAnswers[i]];
    }

    shuffledAnswers.forEach(answer => {
        const button = document.createElement('button');
        button.textContent = answer.text;
        button.className = "w-full bg-gray-700 hover:bg-red-900/50 border border-gray-600 text-slate-200 font-semibold py-4 px-4 rounded-lg text-left btn-demon transition-colors duration-200";
        button.onclick = () => selectAnswer(answer.score);
        answerButtons.appendChild(button);
    });
}

function selectAnswer(scoreToAdd) {
    for (const key in scoreToAdd) {
        scores[key] += scoreToAdd[key];
    }
    currentQuestionIndex++;
    if (currentQuestionIndex < demonQuestions.length) {
        showQuestion();
    } else {
        showLoading();
    }
}

function showLoading() {
    document.getElementById('question-screen').classList.add('hidden');
    document.getElementById('loading-screen').classList.remove('hidden');
    setTimeout(() => {
        calculateResult();
    }, 2500);
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

    // 결과 페이지로 이동
    window.location.href = `result.html?archetype=${encodeURIComponent(bestMatch)}`;
}
