
import { supabase } from './src/lib/supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Check Initial Session
    const { data: { session } } = await supabase.auth.getSession();
    updateAuthUI(session);

    // 2. Listen for Auth Changes
    supabase.auth.onAuthStateChange((_event, session) => {
        updateAuthUI(session);
    });
});

function updateAuthUI(session) {
    const navContainer = document.querySelector('nav');
    if (!navContainer) return;

    // Remove existing auth buttons if any to avoid duplication
    const oldAuthBtn = document.getElementById('auth-btn-group');
    if (oldAuthBtn) oldAuthBtn.remove();

    // Remove old login button if it exists (for static HTML compatibility)
    const staticLoginBtn = navContainer.querySelector('a[href="login.html"]');
    if (staticLoginBtn) staticLoginBtn.style.display = 'none';

    // Create new button group
    const btnGroup = document.createElement('div');
    btnGroup.id = 'auth-btn-group';
    btnGroup.className = 'flex items-center space-x-3';

    if (session) {
        // Logged In -> My Page & Logout
        btnGroup.innerHTML = `
            <a href="#" class="text-gray-600 hover:text-[var(--color-primary)] font-bold transition-colors">마이페이지</a>
            <button id="logout-btn" class="bg-gray-200 text-gray-600 px-4 py-2 rounded-full hover:bg-gray-300 transition-colors text-sm font-bold">
                로그아웃
            </button>
        `;
    } else {
        // Logged Out -> Login
        btnGroup.innerHTML = `
            <a href="login.html" class="bg-[var(--color-primary)] text-white px-4 py-2 rounded-full hover:bg-opacity-80 transition-shadow shadow-md btn-press">
                로그인
            </a>
        `;
    }

    navContainer.appendChild(btnGroup);

    // Attach Event Listener for Logout
    const logoutBtn = btnGroup.querySelector('#logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await supabase.auth.signOut();
            window.location.reload();
        });
    }
}
