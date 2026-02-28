import { authService } from '@/features/auth/authService.js';
import '@/assets/styles/main.css';

console.log('Mellow Wave App Initialized');

import { bindGlobalShare } from '@/core/share.js';
bindGlobalShare();

// Global Auth UI Logic (Header)
const authContainer = document.getElementById('auth-container');

function updateAuthUI(user) {
    if (!authContainer) return;

    if (user) {
        authContainer.innerHTML = `
            <div class="flex items-center space-x-3">
                <a href="/src/pages/mypage/index.html" class="text-gray-600 hover:text-[var(--color-primary)] font-medium transition-colors">마이페이지</a>
                <button id="logout-btn" class="bg-gray-200 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-300 transition-colors text-sm font-medium">로그아웃</button>
            </div>
        `;
        document.getElementById('logout-btn').addEventListener('click', () => {
            authService.signOut();
        });
    } else {
        authContainer.innerHTML = `
            <a href="/src/pages/auth/login/index.html"
                class="bg-[var(--color-primary)] text-white px-4 py-2 rounded-full hover:bg-opacity-80 transition-shadow shadow-md">로그인</a>
        `;
    }
}

async function init() {
    const { session } = await authService.getSession();
    updateAuthUI(session?.user);

    authService.onAuthStateChange((event, session) => {
        updateAuthUI(session?.user);
    });
}

init();
