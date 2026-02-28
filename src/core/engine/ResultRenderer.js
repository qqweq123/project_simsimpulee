import { RecommendationEngine } from '@/core/recommendationEngine.js';
import { bindGlobalShare } from '@/core/share.js';

// Bind globally once imported
bindGlobalShare();

export class ResultRenderer {
    static renderHotContents(currentTestId = '') {
        const container = document.getElementById("hot-contents-container");
        if (!container) return;

        const recommendations = RecommendationEngine.getRecommendations(currentTestId);
        if (!recommendations || recommendations.length === 0) return;

        let htmlMarkup = "";

        // 1. 배너 이미지 형태 (1200x330 파노라마)
        // 2. 텍스트 라벨('유사성향 추천' 등)은 UI에서 숨기고 background(개발/DOM 데이터)로만 유지
        recommendations.forEach(item => {
            htmlMarkup += `
                <a href="${item.url}" 
                   class="block rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.02] transform transition-all duration-300 relative group"
                   data-recommendation-type="${item.recLabel}"
                   data-target-participants="${item.participants}">
                   
                    <!-- 시각적 라벨 제거 (개발자/A11y 용어로만 배치) -->
                    <span class="sr-only">${item.recLabel} - ${item.title}</span>
                    
                    <div class="w-full relative pt-[27.5%]"> <!-- 1200x330 비율 (330/1200 = 27.5%) -->
                        <img src="${item.bannerUrl}" 
                             alt="${item.title} 테스트 배너" 
                             class="absolute inset-0 w-full h-full object-cover">
                    </div>
                </a>
            `;
        });

        container.innerHTML = htmlMarkup;
    }

    static renderAbilityBars(traits) {
        if (!traits) return;
        const labels = {
            leadership: { name: '리더십', icon: '👑', color: 'from-amber-400 to-orange-500' },
            survival: { name: '생존력', icon: '🔧', color: 'from-stone-400 to-zinc-500' },
            exploration: { name: '탐험력', icon: '🧭', color: 'from-emerald-400 to-teal-500' },
            social: { name: '사회성', icon: '🕊️', color: 'from-sky-400 to-blue-500' }
        };

        const container = document.getElementById('ability-bars');
        if (!container) return;
        container.innerHTML = '';

        Object.entries(traits).forEach(([key, value]) => {
            if (!labels[key]) return; // Fallback for unexpected keys
            const label = labels[key];
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

            setTimeout(() => {
                const bar = row.querySelector('.bg-gradient-to-r');
                if (bar) bar.style.width = `${value}%`;
            }, 300);
        });
    }

    static renderActionButtons(mode) {
        const shareContainer = document.getElementById('action-buttons-container');
        if (!shareContainer) return;

        // Owner mode buttons (I took the test)
        const ownerUI = `
            <div class="flex justify-center gap-3 flex-wrap">
                <button onclick="shareSNS('kakao')" class="w-12 h-12 flex items-center justify-center bg-[#FEE500] text-[#000000] rounded-full hover:scale-110 active:scale-95 transition shadow-md" title="카카오톡 공유">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M12 4c-4.97 0-9 3.185-9 7.115 0 2.557 1.707 4.8 4.364 5.923-.19.684-.683 2.455-.71 2.593-.035.18.067.18.17.113.08-.05 2.76-1.848 3.84-2.61.425.06.865.093 1.336.093 4.97 0 9-3.186 9-7.116C21 7.185 16.97 4 12 4z" />
                    </svg>
                </button>
                <button onclick="shareSNS('facebook')" class="w-12 h-12 flex items-center justify-center bg-[#1877F2] text-white rounded-full hover:scale-110 active:scale-95 transition shadow-md" title="페이스북 공유">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                </button>
                <button onclick="shareSNS('instagram')" class="w-12 h-12 flex items-center justify-center bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white rounded-full hover:scale-110 active:scale-95 transition shadow-md" title="인스타그램 공유">
                    <svg viewBox="0 0 24 24" width="22" height="22">
                        <path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                </button>
                <button onclick="shareSNS('twitter')" class="w-12 h-12 flex items-center justify-center bg-black text-white rounded-full hover:scale-110 active:scale-95 transition shadow-md" title="X 공유">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                </button>
                <button onclick="shareSNS('threads')" class="w-12 h-12 flex items-center justify-center bg-black text-white rounded-full hover:scale-110 active:scale-95 transition shadow-md" title="쓰레드 공유">
                    <svg viewBox="0 0 24 24" width="22" height="22">
                        <path fill="currentColor" d="M14.07 11.96c-.035-.116-.089-.25-.152-.39-.142-.292-.321-.595-.536-.889-.413-.55-.91-.986-1.464-1.286-.549-.296-1.14-.426-1.761-.39-.684.041-1.306.275-1.85.698-.553.43-.99 1.05-1.302 1.848-.13.33-.242.69-.333 1.076a9.5 9.5 0 00-.181 1.343c-.024.316-.024.64 0 .964.041.547.14 1.08.307 1.58.175.52.41 1.002.69 1.432.28.43.626.7931.025 1.072.183.13.374.25.566.36.192.11.385.2.585.28h.001c.42.16.85.26 1.282.32a6.37 6.37 0 001.272.03c.433-.03.856-.13 1.258-.3a4.01 4.01 0 001.127-.69c.355-.3.655-.67.892-1.07.24-.4.428-.85.558-1.32.062-.23.111-.47.147-.72.036-.25.062-.51.076-.8h-2.1c-.046.2-.102.39-.168.58-.094.26-.217.5-.366.71-.149.2-.32.38-.517.51-.197.13-.418.23-.655.28a2.53 2.53 0 011.666 0c.23-.04.444-.13.635-.25.19-.13.355-.29.493-.49.138-.2.247-.43.32-.67.074-.25.116-.51.123-.78.006-.11.006-.21.001-.32a3.83 3.83 0 00-.071-.62c-.067-.32-.162-.63-.284-.91zM11.96 9.42c.864 0 1.53.308 2.003.92.473.61.742 1.45.807 2.49h-4.3c.092-.93.385-1.68.88-2.25.494-.57 1.1-.86 1.821-.86z" />
                    </svg>
                </button>
                <button onclick="copyLink()" class="w-12 h-12 flex items-center justify-center bg-gray-200 text-gray-600 rounded-full hover:scale-110 active:scale-95 transition shadow-md" title="링크 복사">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path fill="currentColor" d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        <path fill="currentColor" d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </button>
            </div>
        `;

        // Viewer mode buttons (I clicked on someone else's shared link)
        const viewerUI = `
            <a href="/index.html" class="flex-1 w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-4 px-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transform transition-all duration-300 btn-press text-base flex justify-center items-center gap-2 text-center">
                🌴 Mellow Wave 테스트 모아보기 
            </a>
        `;

        if (mode === 'viewer') {
            shareContainer.innerHTML = viewerUI;
        } else {
            // base buttons format
            shareContainer.innerHTML = ownerUI;
        }
    }
}
