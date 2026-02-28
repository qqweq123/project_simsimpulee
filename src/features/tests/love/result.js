
import { loveResults } from '@/features/tests/love/data.js';
import { TestService } from '@/core/testService.js';
import { bindGlobalShare } from '@/core/share.js';

export function initLoveResult() {
    document.addEventListener('DOMContentLoaded', () => {
        // 0. Bind Share Functions to Window
        bindGlobalShare();

        const urlParams = new URLSearchParams(window.location.search);
        const grade = urlParams.get('grade') || 'B';
        const score = parseInt(urlParams.get('score')) || 25;

        const result = loveResults[grade];
        if (!result) return;

        // DB 텔레메트리 연동
        TestService.incrementParticipantCount('love');

        // Grade badge
        const gradeEl = document.getElementById('result-grade');
        if (gradeEl) gradeEl.innerText = result.grade;

        // Emoji
        const emojiEl = document.getElementById('result-emoji');
        if (emojiEl) emojiEl.innerText = result.emoji;

        // Title & subtitle
        document.getElementById('result-title').innerText = result.name;
        document.getElementById('result-subtitle').innerText = result.subtitle;

        // Description
        document.getElementById('result-desc').innerText = result.desc;

        // Score display
        const scoreEl = document.getElementById('result-score');
        if (scoreEl) scoreEl.innerText = `${score} / 40`;

        // Score bar
        const scoreBar = document.getElementById('score-bar');
        if (scoreBar) {
            setTimeout(() => {
                scoreBar.style.width = `${(score / 40) * 100}%`;
            }, 300);
        }

        // Tags
        const tagContainer = document.getElementById('result-tags');
        if (tagContainer) {
            tagContainer.innerHTML = '';
            result.tags.forEach(tag => {
                const span = document.createElement('span');
                span.className = `px-3 py-1 ${result.bgColor} ${result.textColor} rounded-full text-xs font-bold border ${result.borderColor}`;
                span.innerText = tag;
                tagContainer.appendChild(span);
            });
        }

        // Apply theme color to card
        const card = document.getElementById('result-card');
        if (card) card.className = `${result.bgColor} rounded-3xl shadow-xl overflow-hidden relative fade-in`;

        // Gradient bar
        const gradientBar = document.getElementById('gradient-bar');
        if (gradientBar) gradientBar.className = `h-2 bg-gradient-to-r ${result.color} w-full`;

        // Unlock check
        checkAdLockStatus();
    });

    window.unlockResult = unlockResult;
}

function unlockResult() {
    window.open('https://www.coupang.com', '_blank');
    localStorage.setItem('adUnlockTime', Date.now());
    const overlay = document.getElementById('lock-overlay');
    const content = document.getElementById('result-content');
    overlay.style.opacity = '0';
    setTimeout(() => {
        overlay.style.display = 'none';
        content.classList.remove('blur-content');
    }, 500);
}

function checkAdLockStatus() {
    const unlockTime = localStorage.getItem('adUnlockTime');
    if (unlockTime) {
        const now = Date.now();
        if (now - parseInt(unlockTime) < 60 * 60 * 1000) {
            document.getElementById('lock-overlay').style.display = 'none';
            document.getElementById('result-content').classList.remove('blur-content');
        }
    }
}

