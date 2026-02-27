import { supabase } from '@/core/api.js';

export const TestService = {
    /**
     * 특정 테스트의 참여자 수를 1 증가시킵니다. (RPC 호출)
     * 중복 클릭 방지를 위해 세션 스토리지 플래그를 확인합니다.
     * @param {string} testId 
     */
    async incrementParticipantCount(testId) {
        const countedKey = `${testId}_counted`;
        if (sessionStorage.getItem(countedKey)) return;

        try {
            const { error } = await supabase.rpc('increment_test_participants', { p_test_id: testId });
            if (!error) {
                sessionStorage.setItem(countedKey, 'true');
            } else {
                console.error("Failed to increment participants:", error.message);
            }
        } catch (err) {
            console.error("RPC Calling Error:", err);
        }
    },

    /**
     * DB에서 전체 테스트 메타 정보(참여자수 등)를 가져옵니다.
     * @returns {Promise<Array>}
     */
    async getTestStats() {
        try {
            const { data, error } = await supabase
                .from('Test_Meta_DB')
                .select('test_id, participants_count');

            if (error) {
                console.error("Failed to fetch test stats:", error.message);
                return [];
            }
            return data;
        } catch (err) {
            console.error("Fetch API Error:", err);
            return [];
        }
    }
};
