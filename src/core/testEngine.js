/**
 * Mellow Wave - Standardized Test Engine (Core Utilities)
 * 
 * 대부분의 심리테스트에서 공통으로 사용되는 점수 판별, 상태 관리, 
 * 그리고 텔레메트리 파이프라인 탑재를 단일화(Templatize)하는 전단 엔진.
 */

export class TestEngine {
    /**
     * [Type 1] 단일 최빈값 도출 로직 (ex: 무인도 생존유형)
     * 주석: 객체 내에서 가장 높은 점수를 획득한 Key를 반환합니다.
     * @param {Object} scores - { leader: 3, explorer: 2, ... }
     * @returns {string} - 최고점 Key
     */
    static getHighestScoreKey(scores) {
        if (!scores || typeof scores !== 'object') return null;
        return Object.entries(scores).reduce((a, b) => a[1] >= b[1] ? a : b)[0];
    }

    /**
     * [Type 2] MBTI 양극단(Axis) 판별 로직 (ex: 디저트 테스트)
     * 주석: 4개의 축(ex: E/I, S/N)을 비교하여 4글자 조합 코드를 생성합니다.
     * @param {Object} scores - { E: 2, I: 1, S: 0, N: 3 ... }
     * @param {Array} axes - [['E', 'I'], ['S', 'N'], ['T', 'F'], ['J', 'P']]
     * @returns {string} - 'ENTP' 등 
     */
    static getAxisType(scores, axes) {
        return axes.map(([left, right]) => {
            return (scores[left] || 0) >= (scores[right] || 0) ? left : right;
        }).join('');
    }

    /**
     * [Type 3] A/B 단순 우위 판별 로직 (ex: 호르몬 에겐녀/테토녀)
     * @param {Object} scores - { A: 5, B: 3 }
     * @param {string} aKey 
     * @param {string} bKey 
     * @returns {string} 
     */
    static getBinaryWinner(scores, aKey, bKey) {
        return (scores[aKey] || 0) >= (scores[bKey] || 0) ? aKey : bKey;
    }

    /**
     * [Type 4] 백분율 환산 로직 (ex: Big Five 성격 특성)
     * 주석: 각 특성의 원시 점수를 최대 가능 점수 대비 백분율(%)로 환산합니다.
     * @param {Object} scores - { O: 15, C: 20, E: 10, A: 25, N: 5 }
     * @param {number} maxScorePerTrait - 각 특성당 만점 (ex: 25)
     * @returns {Object} - { O: 60, C: 80, E: 40, A: 100, N: 20 }
     */
    static getPercentageScores(scores, maxScorePerTrait) {
        if (!scores || typeof scores !== 'object' || !maxScorePerTrait) return scores;
        const percentages = {};
        for (const [key, val] of Object.entries(scores)) {
            percentages[key] = Math.round((val / maxScorePerTrait) * 100);
        }
        return percentages;
    }

    /**
     * [Type 5] 다중 최상위 추출 로직 (ex: 에니어그램 기본 유형 + 날개)
     * 주석: 상위 N개의 결과를 추출하여 주기능과 부기능(날개)을 판별합니다.
     * @param {Object} scores - { type1: 5, type2: 12, type3: 11 ... }
     * @param {number} count - 추출할 상위 랭크 개수 (기본 2: 본체 + 날개)
     * @returns {Array} - [{ key: 'type2', val: 12 }, { key: 'type3', val: 11 }]
     */
    static getTopRankedKeys(scores, count = 2) {
        if (!scores || typeof scores !== 'object') return [];
        return Object.entries(scores)
            .map(([key, val]) => ({ key, val }))
            .sort((a, b) => b.val - a.val)
            .slice(0, count);
    }

    /**
     * [Security] 결과 URL 파라미터 안전 파싱 (디코딩 및 JSON 파싱)
     */
    static parseEncodedScores(encodedScoresString) {
        try {
            if (!encodedScoresString) return null;
            return JSON.parse(decodeURIComponent(encodedScoresString));
        } catch (e) {
            console.warn("[TestEngine] Failed to parse scores:", e);
            return null;
        }
    }

    /**
     * [Security] 결과 URL 파라미터 암호화 인코딩
     */
    static encodeScores(scoresObject) {
        return encodeURIComponent(JSON.stringify(scoresObject));
    }
}
