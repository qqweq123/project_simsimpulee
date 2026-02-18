// Test Data Configuration
const testData = [
    {
        id: 'love',
        title: '나의 연애 능력치 테스트',
        desc: '10가지 상황으로 측정하는 SS~D급 연애 등급',
        tags: ['연애', '능력치', '등급'],
        category: 'love',
        icon: '💖',
        color: 'from-pink-100 to-rose-50',
        badge: 'NEW',
        badgeColor: 'bg-pink-500',
        popularity: 95,
        date: '2024-02-15',
        url: '/src/pages/tests/love/index.html'
    },
    {
        id: 'island',
        title: '무인도 생존유형 테스트',
        desc: '극한 상황에서의 선택으로 보는 4가지 생존 유형',
        tags: ['생존', '유형', '무인도'],
        category: 'survival',
        icon: '🏝️',
        color: 'from-emerald-100 to-teal-50',
        badge: 'NEW',
        badgeColor: 'bg-emerald-500',
        popularity: 88,
        date: '2024-02-14',
        url: '/src/pages/tests/island/index.html'
    },
    {
        id: 'dessert',
        title: '내가 디저트라면?',
        desc: '달콤한 디저트로 알아보는 나의 MBTI 성격 유형',
        tags: ['성격', 'MBTI', '디저트'],
        category: 'personality',
        icon: '🍰',
        color: 'from-amber-100 to-orange-50',
        badge: 'HOT',
        badgeColor: 'bg-red-500',
        popularity: 100,
        date: '2024-01-20',
        url: '/src/pages/tests/dessert/index.html'
    },
    {
        id: 'hormoni',
        title: '에겐녀? 테토녀? 호르몬 테스트',
        desc: '나의 호르몬 타입은 에스트로겐일까 테스토스테론일까?',
        tags: ['성향', '호르몬', '트렌드'],
        category: 'personality',
        icon: '💉',
        color: 'from-purple-100 to-fuchsia-50',
        badge: 'TREND',
        badgeColor: 'bg-purple-500',
        popularity: 92,
        date: '2024-02-01',
        url: '/src/pages/tests/hormoni/index.html'
    },
    {
        id: 'demon',
        title: '귀멸의 칼날: 내면의 서사시',
        desc: '모든 것을 잃은 폐허 속에서 찾는 나의 호흡',
        tags: ['성격', '귀멸의칼날', '다크'],
        category: 'unique',
        icon: '⚔️',
        color: 'from-gray-800 to-slate-900', // Exclusive dark theme
        textColor: 'text-white', // Custom text color for dark card
        iconColor: 'text-white',
        badge: 'ART',
        badgeColor: 'bg-slate-500',
        popularity: 85,
        date: '2024-02-18',
        url: '/src/pages/tests/demon/index.html'
    }
];

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

    // Event Listeners
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update filter
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

    function renderTests() {
        // Clear grid
        grid.innerHTML = '';

        // Filter Data
        let filtered = testData.filter(item => {
            const matchesFilter = currentFilter === 'all' || item.category === currentFilter;
            const matchesSearch = item.title.toLowerCase().includes(currentSearch) ||
                item.tags.some(tag => tag.toLowerCase().includes(currentSearch));
            return matchesFilter && matchesSearch;
        });

        // Sort Data
        if (currentSort === 'newest') {
            filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (currentSort === 'popular') {
            filtered.sort((a, b) => b.popularity - a.popularity);
        }

        // Update Count
        countEl.textContent = filtered.length;

        // Show/Hide Empty State
        if (filtered.length === 0) {
            emptyState.classList.remove('hidden');
            grid.classList.add('hidden');
        } else {
            emptyState.classList.add('hidden');
            grid.classList.remove('hidden');
        }

        // Render Cards
        filtered.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = `group bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer fade-in`;
            card.style.animationDelay = `${index * 50}ms`; // Stagger animation
            card.onclick = () => location.href = item.url;

            // Optional: Custom text color for specific cards (like Demon Slayer)
            const titleColor = item.textColor ? 'text-gray-100' : 'text-gray-800';
            const descColor = item.textColor ? 'text-gray-400' : 'text-gray-500';

            // Handle dark mode card body if needed, currently keeping body white for consistency unless specified
            // Note: For Demon Slayer, we might want the WHOLE card to be dark, but let's stick to the header color style for now to keep grid consistent.
            // Actually, let's make the card header the main visual and body standard.

            const badgeHtml = item.badge ?
                `<span class="absolute top-3 right-3 ${item.badgeColor} text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm z-10">${item.badge}</span>` : '';

            card.innerHTML = `
                <div class="relative h-40 bg-gradient-to-br ${item.color} flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                    ${badgeHtml}
                    <span class="transform transition-transform duration-300 group-hover:rotate-12 inline-block">${item.icon}</span>
                </div>
                <div class="p-5">
                    <h3 class="font-bold text-lg mb-1 leading-tight ${item.id === 'demon' ? '' : 'text-gray-800'}">${item.title}</h3>
                    <p class="text-sm text-gray-500 mb-4 line-clamp-2">${item.desc}</p>
                    <div class="flex flex-wrap gap-1.5">
                        ${item.tags.map(tag => `<span class="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">#${tag}</span>`).join('')}
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }
});
