import { demonResults } from './data.js';
import { TestService } from '../../../core/testService.js';

export function initDemonResult() {
    document.addEventListener('DOMContentLoaded', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const archetype = urlParams.get('archetype') || '이름 없는 귀살대원';

        // Data Load
        let resultData = demonResults[archetype];
        if (!resultData) {
            console.warn(`Archetype "${archetype}" not found. Falling back.`);
            resultData = demonResults['이름 없는 귀살대원'];
        }

        // DB 참여자 수 집계 텔레메트리
        TestService.incrementParticipantCount('demon');

        // DOM Binding
        document.getElementById('result-title').textContent = resultData.name;
        document.getElementById('result-subtitle').textContent = resultData.subtitle || archetype;

        // Image Safe Handling
        const imgEl = document.getElementById('result-image');
        if (imgEl) {
            imgEl.src = resultData.imgUrl || 'https://placehold.co/400x600/1e293b/a78bfa?text=Secret';
            imgEl.alt = resultData.name;
        }

        // Tags
        const tagsContainer = document.getElementById('result-tags');
        if (tagsContainer && resultData.tags) {
            tagsContainer.innerHTML = resultData.tags.map(tag =>
                `<span class="px-3 py-1 bg-white/10 border border-white/20 text-xs text-paper rounded-full font-light tracking-wider">${tag}</span>`
            ).join('');
        }

        // Desc
        const descEl = document.getElementById('result-desc');
        if (descEl) {
            // Replace newlines with <br> if needed, or rely on whitespace-pre-line
            descEl.textContent = resultData.desc;
        }

    });
}
