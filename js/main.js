
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
    // 현재 세션 확인
    const { data: { session } } = await supabase.auth.getSession();
    updateAuthUI(session?.user);

    // 인증 상태 변경 리스너 (로그인/로그아웃 시 자동 UI 업데이트)
    supabase.auth.onAuthStateChange((event, session) => {
        updateAuthUI(session?.user);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Logic
    const menuBtn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('close-menu-btn');
    const menuOverlay = document.getElementById('mobile-menu');
    const drawer = document.getElementById('mobile-drawer');

    function openMenu() {
        menuOverlay.classList.remove('hidden');
        // Slight delay to allow display:block to apply before transition
        setTimeout(() => {
            drawer.classList.remove('translate-x-full');
        }, 10);
    }

    function closeMenu() {
        drawer.classList.add('translate-x-full');
        setTimeout(() => {
            menuOverlay.classList.add('hidden');
        }, 300); // Wait for transition
    }

    if (menuBtn) menuBtn.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);

    // Close on overlay click
    if (menuOverlay) {
        menuOverlay.addEventListener('click', (e) => {
            if (e.target === menuOverlay) closeMenu();
        });
    }
});
