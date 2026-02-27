/**
 * Mellow Wave - 전체 테스트 목록 로직
 * 
 * index.html의 카드 디자인을 100% 재현합니다.
 * 카드 구조: rounded-2xl shadow-md + 그라데이션 아이콘 영역 + 뱃지 + 태그 + 참여자 수
 */

import { testRegistry as testData, syncTestStats } from '@/core/testRegistry.js';

// ===== DOM Init =====
document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('test-grid');
    const searchInput = document.getElementById('search-input');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('sort-select');
    const countEl = document.getElementById('test-count');
    const emptyState = document.getElementById('empty-state');

    let currentFilter = 'all';
    let currentSearch = '';
    let currentSort = 'newest';

    // 1. DB에서 참여자 수 동기화 (비동기 처리)
    await syncTestStats();

    // 2. Initialize Render
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
