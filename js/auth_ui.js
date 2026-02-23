
import { supabase } from './src/lib/supabaseClient.js';

// ⚡ [DEV ONLY] Mock Session 데이터
const MOCK_SESSION = {
    user: {
        id: 'dev-user-mock-12345',
        email: 'developer@mellowwave.com',
        user_metadata: {
            name: '🛠️ 개발자',
            avatar_url: null
        },
        created_at: new Date().toISOString()
    }
};

// Mock Auth 활성 여부 체크
function isDevMockActive() {
    return import.meta.env.DEV && localStorage.getItem('mw_dev_auth') === 'true';
}

document.addEventListener('DOMContentLoaded', async () => {

    // ⚡ [DEV ONLY] Mock Auth가 활성 상태면 실제 Supabase를 완전히 무시
    if (isDevMockActive()) {
        console.log('⚡ [DEV] Mock Session 활성 → Supabase 세션 무시, UI를 로그인 상태로 강제 설정');
        updateAuthUI(MOCK_SESSION);
        // onAuthStateChange도 등록하지 않음 → 덮어쓰기 불가
    } else {
        // 실제 Supabase 세션 로직
        const { data: { session } } = await supabase.auth.getSession();
        updateAuthUI(session);

        supabase.auth.onAuthStateChange((_event, session) => {
            // Mock Auth가 활성이면 무시
            if (isDevMockActive()) return;
            updateAuthUI(session);
        });
    }

    // ⚡ [DEV ONLY] 콘솔 명령어 등록
    if (import.meta.env.DEV) {
        window.devLogin = () => {
            localStorage.setItem('mw_dev_auth', 'true');
            console.log('⚡ [DEV] Mock Auth 활성화됨. 새로고침합니다...');
            window.location.reload();
        };

        window.devLogout = () => {
            localStorage.removeItem('mw_dev_auth');
            console.log('⚡ [DEV] Mock Auth 해제됨. 새로고침합니다...');
            window.location.reload();
        };

        if (!isDevMockActive()) {
            console.log('%c🔧 [DEV] 개발자 모드: 콘솔에 devLogin() 입력 시 로그인 우회 가능', 'color: #FFD166; font-weight: bold; background: #333; padding: 4px;');
        }
    }
});

function updateAuthUI(session) {
    const desktopContainer = document.getElementById('auth-desktop');
    const mobileContainer = document.getElementById('auth-mobile');

    if (!desktopContainer && !mobileContainer) return;

    if (session) {
        // ===== 로그인 상태 =====
        if (desktopContainer) {
            desktopContainer.innerHTML = `
                <div class="flex items-center space-x-3">
                    <a href="/src/pages/mypage/index.html" 
                       class="text-gray-600 hover:text-[var(--color-primary)] font-bold transition-colors">마이페이지</a>
                    <button id="logout-btn-desktop" 
                            class="bg-amber-50 text-amber-600 border border-amber-200 px-4 py-2 rounded-full hover:bg-amber-100 transition-all text-sm font-bold shadow-sm">
                        로그아웃
                    </button>
                </div>
            `;
        }
        if (mobileContainer) {
            mobileContainer.innerHTML = `
                <a href="/src/pages/mypage/index.html" class="hover:text-[var(--color-primary)]">마이페이지</a>
                <button id="logout-btn-mobile" 
                        class="text-left hover:text-[var(--color-primary)]">로그아웃</button>
            `;
        }
    } else {
        // ===== 비로그인 상태 =====
        if (desktopContainer) {
            desktopContainer.innerHTML = `
                <a href="/src/pages/auth/login/index.html" 
                   class="bg-[var(--color-primary)] text-white px-4 py-2 rounded-full hover:bg-opacity-80 transition-shadow shadow-md btn-press">
                    로그인
                </a>
            `;
        }
        if (mobileContainer) {
            mobileContainer.innerHTML = `
                <a href="/src/pages/auth/login/index.html" class="hover:text-[var(--color-primary)]">로그인</a>
            `;
        }
    }

    // Attach logout event listeners
    const logoutDesktop = document.getElementById('logout-btn-desktop');
    const logoutMobile = document.getElementById('logout-btn-mobile');

    const handleLogout = async () => {
        if (import.meta.env.DEV) {
            localStorage.removeItem('mw_dev_auth');
        }
        await supabase.auth.signOut();
        window.location.reload();
    };

    if (logoutDesktop) logoutDesktop.addEventListener('click', handleLogout);
    if (logoutMobile) logoutMobile.addEventListener('click', handleLogout);
}
