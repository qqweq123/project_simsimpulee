
import { supabase } from '../src/lib/supabaseClient.js';

/**
 * UserState Manager
 * Handles user preferences, test results, and synchronization with Supabase.
 */
class UserState {
    constructor() {
        this.data = this.loadLocal();
    }

    /**
     * Load state from localStorage
     */
    loadLocal() {
        const stored = localStorage.getItem('mw_user_state');
        return stored ? JSON.parse(stored) : {
            results: [], // History of test results
            profile: null, // Basic profile info
            mbti: null,
            preferences: {}
        };
    }

    /**
     * Save state to localStorage
     */
    saveLocal() {
        localStorage.setItem('mw_user_state', JSON.stringify(this.data));
    }

    /**
     * Save a new test result
     * @param {string} testId - unique ID of the test (e.g., 'dessert', 'hormoni')
     * @param {object} resultData - result details (e.g., { type: 'Egen', score: 80 })
     */
    async saveResult(testId, resultData) {
        const entry = {
            testId,
            ...resultData,
            timestamp: new Date().toISOString()
        };

        // Update local state
        this.data.results.push(entry);

        // Update specific fields if applicable
        if (resultData.mbti) this.data.mbti = resultData.mbti;

        this.saveLocal();

        // Sync with Supabase if logged in
        await this.syncToSupabase(entry);
    }

    /**
     * Sync data to Supabase (Insert to 'test_results' table)
     * Assumes a table `test_results` exists with columns: user_id, test_id, result_data
     */
    async syncToSupabase(entry) {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return; // Not logged in

            const { error } = await supabase
                .from('test_results')
                .insert({
                    user_id: session.user.id,
                    test_id: entry.testId,
                    result_data: entry // Store full JSON
                });

            if (error) {
                console.error('[UserState] Sync Error:', error);
            } else {
                console.log('[UserState] Result synced to DB');
            }
        } catch (err) {
            console.error('[UserState] Unexpected error during sync:', err);
        }
    }

    /**
     * Get all results
     */
    getResults() {
        return this.data.results;
    }

    /**
     * Get specific test result
     */
    getLastResult(testId) {
        return this.data.results.filter(r => r.testId === testId).pop();
    }
}

// Export singleton instance
export const userState = new UserState();
