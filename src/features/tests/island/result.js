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

    // 전역 함수 바인딩
    window.unlockResult = unlockResult;
    window.copyLink = copyLink;
    window.shareSNS = shareSNS;
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

function copyLink() {
    // UTM 제거한 순수 공유 링크 생성 (Bot SEO 용이)
    const shareUrl = window.location.origin + window.location.pathname + window.location.search.replace(/mode=owner/, 'mode=viewer').replace(/mode=redirect/, 'mode=viewer');
    // 실제로는 깔끔하게 쿼리 조작이 필요한데 간단히 처리:
    const url = new URL(window.location.href);
    url.searchParams.set('mode', 'viewer');

    navigator.clipboard.writeText(url.href).then(() => {
        alert('링크가 복사되었습니다! 🏝️ 친구들에게 공유해보세요.');
    });
}

function shareSNS(platform) {
    const urlObj = new URL(window.location.href);
    urlObj.searchParams.set('mode', 'viewer');
    const url = encodeURIComponent(urlObj.href);

    // 이 부분은 차후 SEO Edge Function에서 다뤄질 메타데이터(OG)입니다.
    const text = encodeURIComponent('내가 무인도에 떨어진다면? 나의 생존 유형을 확인해보세요! 🏝️ #MellowWave #무인도테스트');

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile && navigator.share) {
        navigator.share({
            title: '나의 무인도 생존 유형',
            text: '내가 무인도에 떨어진다면? 나의 생존 유형을 확인해보세요! 🏝️',
            url: urlObj.href,
        }).catch(console.error);
        return;
    }

    switch (platform) {
        case 'facebook':
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
            break;
        case 'twitter':
            window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'width=600,height=400');
            break;
        case 'threads':
            window.open(`https://www.threads.net/intent/post?text=${text} ${url}`, '_blank', 'width=600,height=400');
            break;
        case 'kakao':
            copyLink();
            alert('카카오톡 채팅방에 붙여넣기로 쉽게 공유하세요! (링크 복사 완료)');
            break;
        case 'instagram':
            copyLink();
            alert('인스타그램 스토리에 붙여넣기 할 수 있도록 링크가 복사되었습니다!');
            break;
    }
}
