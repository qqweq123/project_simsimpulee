
import { hormoniResults } from '@/features/tests/hormoni_data.js';

export function initHormoniResult() {
    document.addEventListener('DOMContentLoaded', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const type = urlParams.get('type') || 'estrogen';

        const result = hormoniResults[type];

        if (result) {
            document.getElementById('result-title').innerText = result.name;
            document.getElementById('result-desc').innerText = result.desc;
            document.getElementById('result-tags').innerText = result.tags.join(' #');
            document.getElementById('result-img').src = result.img;

            // Partner Logic (if exists in data)
            if (result.goodMatch) {
                document.getElementById('good-match').innerText = result.goodMatch;
            }
        }
    });
}
