
import { supabase } from './supabase-config.js';

/**
 * Mellow Wave Main Script
 * Handles global interactions like header menu, analytics (future), etc.
 */

console.log('Mellow Wave scripts loaded.');

const authContainer = document.getElementById('auth-container');

function updateAuthUI(user) {
    if (!authContainer) return;

    if (user) {
        // 로그인 상태: 마이페이지 + 로그아웃 버튼
        authContainer.innerHTML = `
            <div class="flex items-center space-x-3">
                <a href="mypage.html" class="text-gray-600 hover:text-[var(--color-primary)] font-medium transition-colors">마이페이지</a>
                <button id="logout-btn" class="bg-gray-200 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-300 transition-colors text-sm font-medium">로그아웃</button>
            </div>
        `;
        // 로그아웃 이벤트 리스너 추가
        document.getElementById('logout-btn').addEventListener('click', async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
                alert('로그아웃 중 오류가 발생했습니다.');
            } else {
                window.location.href = 'index.html'; // 또는 새로고침
            }
        });
    } else {
        // 비로그인 상태: 로그인 버튼
        authContainer.innerHTML = `
            <a href="login.html"
                class="bg-[var(--color-primary)] text-white px-4 py-2 rounded-full hover:bg-opacity-80 transition-shadow shadow-md">로그인</a>
        `;
    }
}

async function initAuth() {
    try {
        console.log('[Auth] Checking session...');
        // 현재 세션 확인
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
            console.error('[Auth] Error getting session:', error);
            alert('세션 확인 중 오류: ' + error.message);
            return;
        }

        console.log('[Auth] Session found:', session ? 'Yes' : 'No');

        // [디버깅] 사용자가 로그를 못 보는 경우를 대비해 팝업 띄움
        if (session) {
            alert(`로그인 성공! 환영합니다, ${session.user.email}님.`);
        } else {
            // alert('현재 비로그인 상태입니다.'); // 필요 시 주석 해제
        }

        updateAuthUI(session?.user);

        // 인증 상태 변경 리스너 (로그인/로그아웃 시 자동 UI 업데이트)
        supabase.auth.onAuthStateChange((event, session) => {
            console.log(`[Auth] Auth state change event: ${event}`);
            if (event === 'SIGNED_IN') {
                alert(`로그인 완료! (${session.user.email})`);
            }
            updateAuthUI(session?.user);
        });
    } catch (err) {
        console.error('[Auth] Unexpected error in initAuth:', err);
        alert('알 수 없는 오류 발생: ' + err.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initAuth();
});
