import { islandResults } from '@/features/tests/island/data.js';
import { checkSession, cacheUTM } from '@/features/tests/island/core/validator.js';
import { TestEngine } from '@/core/testEngine.js';
import { renderAbilityBars, renderHotContents, renderActionButtons } from '@/features/tests/island/core/renderer.js';
import { TestService } from '@/core/testService.js';

export function initIslandResult() {
    document.addEventListener('DOMContentLoaded', () => {
        // 1. 보안 검증 및 캐싱
        cacheUTM();
        const mode = checkSession();
        if (mode === 'redirect') return; // 리다이렉트 발생 시 렌더링 중단

        // 2. 파라미터 파싱
        const urlParams = new URLSearchParams(location.search);
        const type = urlParams.get('type') || 'survivor';
        const scoresString = urlParams.get('scores');
        const scores = TestEngine.parseEncodedScores(scoresString);
        const result = islandResults[type];
        if (!result) return;

        // 2.5. 참여자 수 집계 (DB)
        TestService.incrementParticipantCount('island');

        // 3. UI 렌더링 
        const emojiEl = document.getElementById('result-emoji');
        if (emojiEl) emojiEl.innerText = result.emoji;

        const imageEl = document.getElementById('result-image');
        if (imageEl && result.image) {
            imageEl.src = result.image;
            imageEl.alt = result.name;
        }

        document.getElementById('result-title').innerText = result.name;
        document.getElementById('result-subtitle').innerText = result.subtitle;
        document.getElementById('result-desc').innerText = result.desc;

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

        const card = document.getElementById('result-card');
        if (card) card.className = `${result.bgColor} rounded-3xl shadow-xl overflow-hidden relative fade-in`;

        const gradientBar = document.getElementById('gradient-bar');
        if (gradientBar) gradientBar.className = `h-2 bg-gradient-to-r ${result.color} w-full`;

        renderAbilityBars(result.traits);
        renderHotContents('island');

        // 4. 모드에 따른 공유/시작 UI 분기
        renderActionButtons(mode);

        // 5. 로딩 / 전면 광고 화면 제어
        handleInterstitialAd();
    });

    // 전역 함수 바인딩 (unlockResult만 - share는 @core/share.js가 주관)
    window.unlockResult = unlockResult;
}

function handleInterstitialAd() {
    const overlay = document.getElementById('lock-overlay');
    const progress = document.getElementById('loading-progress');
    const title = document.getElementById('loading-title');
    const btn = document.getElementById('btn-unlock');

    setTimeout(() => {
        if (progress) progress.style.width = '100%';
    }, 100);

    setTimeout(() => {
        if (title) title.innerHTML = '분석이 완료되었습니다! 🏝️';
        if (btn) {
            btn.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-emerald-500');
            btn.classList.add('hover:shadow-xl', 'animate-pulse', 'bg-gradient-to-r', 'from-emerald-500', 'to-teal-600', 'shadow-lg');
            btn.disabled = false;
        }
    }, 3100);
}

function unlockResult() {
    localStorage.setItem('adUnlockTime', Date.now());

    const overlay = document.getElementById('lock-overlay');
    const content = document.getElementById('result-content');

    overlay.style.transition = 'opacity 0.6s ease';
    overlay.style.opacity = '0';

    setTimeout(() => {
        overlay.style.display = 'none';
        content.classList.remove('blur-content');
    }, 600);
}

// 링크 복사는 @core/share.js의 window.shareSNS('link')이 대체함.
// renderer.js 등에서 주입되는 버튼 : onclick="shareSNS('link')" / onclick="shareSNS('kakao')"
