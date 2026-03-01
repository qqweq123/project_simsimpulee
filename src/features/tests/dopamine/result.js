import { getCombinedResult } from '@/features/tests/dopamine/data.js';
import { checkSession, cacheUTM } from '@/core/security/validator.js';
import { ScoreCalculator as TestEngine } from '@/core/engine/ScoreCalculator.js';
import { ResultRenderer } from '@/core/engine/ResultRenderer.js';
import { TestService } from '@/core/testService.js';

export function initDopamineResult() {
    document.addEventListener('DOMContentLoaded', () => {
        // 1. 세션 및 UTM 검증 (dopamine 전용 키와 리다이렉트 경로 주입)
        const mode = checkSession('dopamine_test_started', '/src/pages/tests/dopamine/index.html');
        if (mode === 'redirect') return;

        // 2. 파라미터 파싱
        const urlParams = new URLSearchParams(location.search);
        const encodedRanks = urlParams.get('ranks');
        const ranks = TestEngine.parseEncodedScores(encodedRanks) || [{ key: "scroller", val: 5 }, { key: "sloth", val: 3 }];

        // 3. 복합 결과 객체 도출 (주기능 + 부기능)
        const result = getCombinedResult(ranks);
        if (!result) return;

        // 3.5 참여자 수 DB 집계
        TestService.incrementCompletionCount('dopamine');

        // 4. UI 렌더링
        renderResultUI(result);

        // 5. 공통 컴포넌트 렌더링 (추천 배너, 공유 버튼)
        ResultRenderer.renderActionButtons(mode);
        ResultRenderer.renderHotContents('dopamine');

        // 6. UTM 데이터 보존
        cacheUTM();

        // 7. 결과 로그 전송 (Background)
        // submitDopamineResult(result.id, ... ); (RPC Call for Phase 3)
    });
}

function renderResultUI(result) {
    document.getElementById('result-subtitle').innerText = result.title;
    document.getElementById('result-title').innerText = result.name;
    document.getElementById('result-image').src = result.image;

    // 테마 컬러 매핑
    const bgContainer = document.getElementById('result-bg-container');
    if (bgContainer) {
        bgContainer.className = `max-w-md w-full rounded-3xl shadow-lg p-8 mx-auto text-center border bg-white ${result.textColor}`;
    }

    // 해시태그
    const tagsContainer = document.getElementById('result-tags');
    if (tagsContainer) {
        tagsContainer.innerHTML = result.tags.map(tag =>
            `<span class="inline-block bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-sm font-medium mr-2 mb-2">${tag}</span>`
        ).join('');
    }

    // 설명문 (강조 처리된 날개 텍스트 렌더링 지원)
    const descEl = document.getElementById('result-desc');
    if (descEl) {
        descEl.innerHTML = result.combinedDesc.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
    }
}
