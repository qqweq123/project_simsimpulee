
import { dessertResults, matchData } from '@/features/tests/dessert_data.js';

export function initDessertResult() {
    document.addEventListener('DOMContentLoaded', () => {
        // 1. Parse URL Parameter
        const urlParams = new URLSearchParams(window.location.search);
        const type = urlParams.get('type') || 'ESFP';

        // 2. Load Data
        const result = dessertResults[type];

        if (result) {
            document.getElementById('result-title').innerText = result.name;
            document.getElementById('result-subtitle').innerText = result.subtitle || "";
            document.getElementById('result-desc').innerText = result.desc;

            // Render Tags
            const tagContainer = document.getElementById('result-tags');
            tagContainer.innerHTML = '';
            if (result.tags) {
                result.tags.forEach(tag => {
                    const span = document.createElement('span');
                    span.className = "px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold";
                    span.innerText = tag;
                    tagContainer.appendChild(span);
                });
            }

            // Image
            document.getElementById('result-img').src = result.img;

            // Match Info
            if (result.goodMatch && matchData[result.goodMatch]) {
                document.getElementById('good-match-name').innerText = matchData[result.goodMatch];
            }
            if (result.badMatch && matchData[result.badMatch]) {
                document.getElementById('bad-match-name').innerText = matchData[result.badMatch];
            }
        }

        // 3. Ad-Block & Lock Logic
        checkAdLockStatus();
    });

    // Make functions global for HTML onclick
    window.unlockResult = unlockResult;
    window.copyLink = copyLink;
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
        alert('링크가 복사되었습니다!');
    });
}
