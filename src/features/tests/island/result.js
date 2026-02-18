
import { islandResults } from './data.js';

export function initIslandResult() {
    document.addEventListener('DOMContentLoaded', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const type = urlParams.get('type') || 'survivor';

        let scores = { leader: 0, explorer: 0, survivor: 0, diplomat: 0 };
        try {
            const s = urlParams.get('scores');
            if (s) scores = JSON.parse(decodeURIComponent(s));
        } catch (e) { /* fallback */ }

        const result = islandResults[type];
        if (!result) return;

        // Emoji
        const emojiEl = document.getElementById('result-emoji');
        if (emojiEl) emojiEl.innerText = result.emoji;

        // Title & subtitle
        document.getElementById('result-title').innerText = result.name;
        document.getElementById('result-subtitle').innerText = result.subtitle;

        // Description
        document.getElementById('result-desc').innerText = result.desc;

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

        // Apply theme to card
        const card = document.getElementById('result-card');
        if (card) card.className = `${result.bgColor} rounded-3xl shadow-xl overflow-hidden relative fade-in`;

        // Gradient bar
        const gradientBar = document.getElementById('gradient-bar');
        if (gradientBar) gradientBar.className = `h-2 bg-gradient-to-r ${result.color} w-full`;

        // Ability bars (4가지 능력치)
        renderAbilityBars(result.traits);

        // Unlock check
        checkAdLockStatus();
    });

    window.unlockResult = unlockResult;
    window.copyLink = copyLink;
}

function renderAbilityBars(traits) {
    const labels = {
        leadership: { name: '리더십', icon: '👑', color: 'from-amber-400 to-orange-500' },
        survival: { name: '생존력', icon: '🔧', color: 'from-stone-400 to-zinc-500' },
        exploration: { name: '탐험력', icon: '🧭', color: 'from-emerald-400 to-teal-500' },
        social: { name: '사회성', icon: '🕊️', color: 'from-sky-400 to-blue-500' }
    };

    const container = document.getElementById('ability-bars');
    if (!container) return;
    container.innerHTML = '';

    Object.entries(labels).forEach(([key, label]) => {
        const value = traits[key] || 0;
        const row = document.createElement('div');
        row.className = 'mb-3';
        row.innerHTML = `
            <div class="flex justify-between text-sm mb-1">
                <span class="font-bold text-gray-600">${label.icon} ${label.name}</span>
                <span class="font-bold text-gray-500">${value}%</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div class="h-2.5 rounded-full bg-gradient-to-r ${label.color} transition-all duration-1000 ease-out" style="width: 0%"></div>
            </div>
        `;
        container.appendChild(row);

        // Animate bars
        setTimeout(() => {
            const bar = row.querySelector('.bg-gradient-to-r');
            if (bar) bar.style.width = `${value}%`;
        }, 300);
    });
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

function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        alert('링크가 복사되었습니다! 🏝️');
    });
}
