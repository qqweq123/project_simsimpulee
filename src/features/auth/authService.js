
import { supabase } from '@/core/api.js';

export const authService = {
    async loginWith(provider) {
        try {
            // Redirect to the home page after login
            const redirectTo = `${window.location.origin}/index.html`;

            console.log(`[Auth] Attempting login with ${provider}`);
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: redirectTo
                }
            });
            if (error) throw error;
        } catch (error) {
            console.error("Login Error:", error);
            alert("로그인 중 오류가 발생했습니다: " + error.message);
        }
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            alert('로그아웃 중 오류가 발생했습니다.');
        } else {
            window.location.href = '/index.html';
        }
    },

    async getSession() {
        const { data: { session }, error } = await supabase.auth.getSession();
        return { session, error };
    },

    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange(callback);
    }
};

// Expose to window for HTML onclick handlers if needed, though module usage is preferred
window.authService = authService;
window.loginWith = authService.loginWith;
