
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

        // Emoji & Image
        const emojiEl = document.getElementById('result-emoji');
        if (emojiEl) emojiEl.innerText = result.emoji;

        const imageEl = document.getElementById('result-image');
        if (imageEl && result.image) {
            imageEl.src = result.image;
            imageEl.alt = result.name;
        }

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

        // Interstitial Ad Logic
        handleInterstitialAd();
    });

    window.unlockResult = unlockResult;
    window.copyLink = copyLink;
    window.shareSNS = shareSNS;
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

function handleInterstitialAd() {
    // 이미 광고를 통과했는지 확인 (선택 사항, 통과했더라도 매번 보여주려면 로컬스토리지 주석 처리)
    const unlockTime = localStorage.getItem('adUnlockTime');
    const now = Date.now();

    // 만약 한 번 보면 10분 동안 안 보게 하려면 이 로직 활성화
    // if (unlockTime && (now - parseInt(unlockTime) < 60 * 10 * 1000)) {
    //     document.getElementById('lock-overlay').style.display = 'none';
    //     document.getElementById('result-content').classList.remove('blur-content');
    //     return;
    // }

    // 광고/로딩 화면 시작
    const overlay = document.getElementById('lock-overlay');
    const progress = document.getElementById('loading-progress');
    const title = document.getElementById('loading-title');
    const btn = document.getElementById('btn-unlock');

    // 100ms 후 프로그레스 바 애니메이션 시작 (transition 3000ms 설정됨)
    setTimeout(() => {
        if (progress) progress.style.width = '100%';
    }, 100);

    // 3초 후 결과 확인 버튼 활성화
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
    // 선택 사항: 쿠팡 등 스폰서 링크 연결을 원하지 않으면 주석 처리
    // window.open('https://www.coupang.com', '_blank');

    // 시간 저장
    localStorage.setItem('adUnlockTime', Date.now());

    const overlay = document.getElementById('lock-overlay');
    const content = document.getElementById('result-content');

    // 오버레이 페이드아웃 애니메이션
    overlay.style.transition = 'opacity 0.6s ease';
    overlay.style.opacity = '0';

    setTimeout(() => {
        overlay.style.display = 'none';
        content.classList.remove('blur-content');
    }, 600);
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        alert('링크가 복사되었습니다! 🏝️ 친구들에게 공유해보세요.');
    });
}

function shareSNS(platform) {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('내가 무인도에 떨어진다면? 나의 생존 유형을 확인해보세요! 🏝️ #MellowWave #무인도테스트');

    // 모바일 환경 Web Share API 지원 시 기본 작동 (인스타 등 앱 강제 공유용)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile && navigator.share && (platform === 'instagram' || platform === 'kakao')) {
        navigator.share({
            title: '나의 무인도 생존 유형',
            text: '내가 무인도에 떨어진다면? 나의 생존 유형을 확인해보세요! 🏝️',
            url: window.location.href,
        }).catch(console.error);
        return;
    }

    // 각 플랫폼별 URL Intent
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
            // 카카오톡 공유 API가 없을 경우 카카오스토리 폴백 또는 클립보드 복사
            window.open(`https://story.kakao.com/share?url=${url}`, '_blank', 'width=600,height=400');
            break;
        case 'instagram':
            // 웹 인스타그램은 다이렉트 링크 공유 미지원. 링크 복사 유도.
            copyLink();
            alert('인스타그램 스토리에 붙여넣기 할 수 있도록 링크가 복사되었습니다!');
            break;
    }
}
