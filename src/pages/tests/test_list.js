/**
 * Mellow Wave - 전체 테스트 목록 로직
 * 
 * index.html의 카드 디자인을 100% 재현합니다.
 * 카드 구조: rounded-2xl shadow-md + 그라데이션 아이콘 영역 + 뱃지 + 태그 + 참여자 수
 */

// ===== 테스트 데이터 =====
const testData = [
    {
        id: 'dessert',
        title: '내가 디저트라면?',
        desc: '달콤한 디저트로 알아보는 나의 MBTI 성격 유형',
        tags: [
            { label: '성격', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' },
            { label: 'MBTI', bgColor: 'bg-pink-100', textColor: 'text-pink-700' }
        ],
        category: 'personality',
        icon: '🍰',
        gradient: 'from-amber-100 to-yellow-50',
        badge: 'HOT',
        badgeGradient: 'from-red-500 to-orange-500',
        participants: 12345,
        date: '2024-01-20',
        url: '/src/pages/tests/dessert/index.html'
    },
    {
        id: 'love',
        title: '나의 연애 능력치',
        desc: '10가지 상황으로 측정하는 SS~D급 연애 등급',
        tags: [
            { label: '연애', bgColor: 'bg-red-100', textColor: 'text-red-700' },
            { label: '능력치', bgColor: 'bg-pink-100', textColor: 'text-pink-700' }
        ],
        category: 'love',
        icon: '💖',
        gradient: 'from-pink-100 via-rose-50 to-red-100',
        badge: 'NEW',
        badgeGradient: 'from-pink-500 to-rose-500',
        participants: 8742,
        date: '2024-02-15',
        url: '/src/pages/tests/love/index.html'
    },
    {
        id: 'island',
        title: '무인도 생존 유형',
        desc: '극한 상황에서의 선택으로 보는 4가지 생존 유형',
        tags: [
            { label: '생존', bgColor: 'bg-green-100', textColor: 'text-green-700' },
            { label: '성향', bgColor: 'bg-teal-100', textColor: 'text-teal-700' }
        ],
        category: 'survival',
        icon: '🏝️',
        gradient: 'from-emerald-100 via-teal-50 to-cyan-100',
        badge: 'NEW',
        badgeGradient: 'from-emerald-500 to-teal-600',
        participants: 5231,
        date: '2024-02-14',
        url: '/src/pages/tests/island/index.html'
    },
    {
        id: 'hormoni',
        title: '에겐녀? 테토녀?',
        desc: '나의 호르몬 타입은 에스트로겐일까 테스토스테론일까?',
        tags: [
            { label: '성향', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
            { label: '트렌드', bgColor: 'bg-fuchsia-100', textColor: 'text-fuchsia-700' }
        ],
        category: 'personality',
        icon: '💉',
        gradient: 'from-pink-100 to-purple-100',
        badge: 'HOT',
        badgeGradient: 'from-pink-500 to-purple-500',
        participants: 9876,
        date: '2024-02-01',
        url: '/src/pages/tests/hormoni/index.html'
    },
    {
        id: 'demon',
        title: '귀멸의 내면 서사시',
        desc: '모든 것을 잃은 폐허 속에서 찾는 나의 호흡',
        tags: [
            { label: '성격', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
            { label: '귀멸의칼날', bgColor: 'bg-red-100', textColor: 'text-red-700' }
        ],
        category: 'unique',
        icon: '⚔️',
        gradient: 'from-slate-800 to-red-900',
        badge: null,
        badgeGradient: null,
        participants: 3412,
        date: '2024-02-18',
        url: '/src/pages/tests/demon/index.html'
    }
];

// ===== DOM Init =====
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('test-grid');
    const searchInput = document.getElementById('search-input');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('sort-select');
    const countEl = document.getElementById('test-count');
    const emptyState = document.getElementById('empty-state');

    let currentFilter = 'all';
    let currentSearch = '';
    let currentSort = 'newest';

    // Initialize
    renderTests();

    // ===== Event Listeners =====
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTests();
        });
    });

    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase();
        renderTests();
    });

    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderTests();
    });

    // ===== Render Function =====
    function renderTests() {
        grid.innerHTML = '';

        // Filter
        let filtered = testData.filter(item => {
            const matchesFilter = currentFilter === 'all' || item.category === currentFilter;
            const matchesSearch = item.title.toLowerCase().includes(currentSearch) ||
                item.tags.some(t => t.label.toLowerCase().includes(currentSearch));
            return matchesFilter && matchesSearch;
        });

        // Sort
        if (currentSort === 'newest') {
            filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (currentSort === 'popular') {
            filtered.sort((a, b) => b.participants - a.participants);
        }

        // Update Count
        countEl.textContent = filtered.length;

        // Empty State
        if (filtered.length === 0) {
            emptyState.classList.remove('hidden');
            grid.classList.add('hidden');
        } else {
            emptyState.classList.add('hidden');
            grid.classList.remove('hidden');
        }

        // ===== Render Cards (index.html '전체 테스트' 섹션과 동일 HTML 구조) =====
        filtered.forEach((item, index) => {
            const card = document.createElement('div');
            // 👇 index.html의 카드 클래스를 그대로 복사
            card.className = 'group bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer card-anim';
            card.style.animationDelay = `${index * 60}ms`;
            card.onclick = () => location.href = item.url;

            // Badge HTML
            const badgeHtml = item.badge
                ? `<span class="absolute top-2 right-2 bg-gradient-to-r ${item.badgeGradient} text-white text-[10px] font-bold px-2 py-0.5 rounded-full">${item.badge}</span>`
                : '';

            // Tags HTML
            const tagsHtml = item.tags.map(t =>
                `<span class="${t.bgColor} ${t.textColor} text-xs font-bold px-2.5 py-0.5 rounded-full">#${t.label}</span>`
            ).join('');

            // Participants (숫자에 콤마 추가)
            const participantStr = item.participants.toLocaleString();

            card.innerHTML = `
                <div class="relative h-32 bg-gradient-to-br ${item.gradient} flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                    ${item.icon}
                    ${badgeHtml}
                </div>
                <div class="p-4">
                    <h5 class="font-bold text-sm mb-1">${item.title}</h5>
                    <p class="text-xs text-gray-500 mb-3">${item.desc}</p>
                    <div class="flex items-center justify-between">
                        <div class="flex gap-1.5">
                            ${tagsHtml}
                        </div>
                        <span class="text-xs text-gray-400">👤 ${participantStr}</span>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }
});
