import { testRegistry } from '@/core/testRegistry.js';

/**
 * Mellow Wave - Dynamic Recommendation Engine
 * 
 * 현재 테스트 ID를 기반으로 분석된 4종의 추천 테스트 배열을 반환합니다.
 */
export class RecommendationEngine {

    /**
     * @param {string} currentTestId - 현재 유저가 보고 있는 테스트의 ID (예: 'dopamine')
     * @returns {Array} 4개의 추천 테스트 객체 배열
     */
    static getRecommendations(currentTestId) {
        // 1. 제외할 현재 테스트
        const pool = testRegistry.filter(t => t.id !== currentTestId);
        if (pool.length === 0) return []; // 데이터가 없으면 빈 배열

        const currentTest = testRegistry.find(t => t.id === currentTestId);
        const currentCategory = currentTest ? currentTest.category : 'personality';

        const recommendations = [];

        // 1순위: [최상단] 현재와 가장 비슷한 테스트 추천 (동일 카테고리 중 참여자수 Top)
        const similarTests = pool.filter(t => t.category === currentCategory)
            .sort((a, b) => b.participants - a.participants);

        let topSimilar = similarTests.length > 0 ? similarTests[0] : null;

        // 만약 비슷한 게 없으면, 그냥 참여자수 1등을 대체로 넣음
        if (!topSimilar) {
            topSimilar = [...pool].sort((a, b) => b.participants - a.participants)[0];
        }

        recommendations.push({
            ...topSimilar,
            recLabel: '유사 성향 추천',
            recType: 'similar'
        });

        // 이미 뽑은 테스트 제외용 Set
        const usedIds = new Set([topSimilar.id]);

        // 2순위: [금주 인기] 주간 클릭수 기준 Top 1
        const remainingForWeekly = pool.filter(t => !usedIds.has(t.id));
        if (remainingForWeekly.length > 0) {
            const weeklyTop = [...remainingForWeekly].sort((a, b) => b.weeklyHits - a.weeklyHits)[0];
            recommendations.push({
                ...weeklyTop,
                recLabel: '금주 급상승',
                recType: 'weekly'
            });
            usedIds.add(weeklyTop.id);
        }

        // 3순위: [당월 인기] 누적 참여자수 기준 Top 1
        const remainingForMonthly = pool.filter(t => !usedIds.has(t.id));
        if (remainingForMonthly.length > 0) {
            const monthlyTop = [...remainingForMonthly].sort((a, b) => b.participants - a.participants)[0];
            recommendations.push({
                ...monthlyTop,
                recLabel: '명예의 전당 (인기 1위)',
                recType: 'monthly'
            });
            usedIds.add(monthlyTop.id);
        }

        // 4순위: [개인화 추천 기초] 아직까지 안 뽑힌 목록 중 랜덤 (안 해본 영역을 추천한다는 컨셉)
        const remainingForRandom = pool.filter(t => !usedIds.has(t.id));
        if (remainingForRandom.length > 0) {
            const randomPick = remainingForRandom[Math.floor(Math.random() * remainingForRandom.length)];
            recommendations.push({
                ...randomPick,
                recLabel: '이건 해보셨나요?',
                recType: 'user_based'
            });
            usedIds.add(randomPick.id);
        }

        return recommendations;
    }
}
