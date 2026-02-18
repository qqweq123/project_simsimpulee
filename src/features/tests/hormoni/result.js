
import { hormoniResults } from './data.js';
import { ThemeManager } from '@/core/ThemeManager.js';

export function initHormoniResult() {
    document.addEventListener('DOMContentLoaded', async () => {
        const urlParams = new URLSearchParams(window.location.search);

        // 1. Parse Data Config
        const gender = urlParams.get('gender') || 'female';
        const type = urlParams.get('type') || 'Egen';
        const resultData = hormoniResults[gender]?.[type] || hormoniResults['female']['Egen'];

        // 2. Determine Theme (Default: collage)
        const themeName = urlParams.get('theme') || 'collage';

        // 3. Initialize Manager
        const themeManager = new ThemeManager();
        const container = document.getElementById('app-container');

        // 4. Load Theme
        const success = await themeManager.loadTheme(themeName, container);
        if (!success) return;

        // 5. Bind Data
        themeManager.bindData(resultData);

        // 6. Bind Events
        themeManager.bindEvents({
            onUnlock: () => unlockResultHandler(),
            onShareKakao: () => alert('카카오톡 공유 기능 준비중입니다.'),
            onCopyLink: () => {
                navigator.clipboard.writeText(window.location.href);
                alert('링크가 복사되었습니다!');
            }
        });

        // 7. Check Lock State
        const unlocked = localStorage.getItem(`result_unlocked_${themeName}`);
        if (unlocked === 'true') {
            unlockResultHandler(false);
        }
    });
}

// Handler Logic (Controller Level)
function unlockResultHandler(animate = true) {
    const overlay = document.getElementById('lock-overlay');
    const content = document.getElementById('result-content');
    const btn = document.getElementById('btn-unlock');

    if (!overlay || !content) return;

    if (animate) {
        if (btn) btn.classList.add('animate-pop');

        setTimeout(() => {
            overlay.style.transition = 'all 0.5s ease';
            overlay.style.opacity = '0';
            overlay.style.transform = 'translateY(-20px)';

            setTimeout(() => {
                overlay.style.display = 'none';
                content.classList.remove('blur-content', 'blur-target');

                const urlParams = new URLSearchParams(window.location.search);
                const themeName = urlParams.get('theme') || 'collage';
                localStorage.setItem(`result_unlocked_${themeName}`, 'true');
            }, 500);
        }, 300);
    } else {
        overlay.style.display = 'none';
        content.classList.remove('blur-content', 'blur-target');
    }
}
