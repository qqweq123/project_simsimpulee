/**
 * Mellow Wave Main Script
 * Handles global interactions like header menu, analytics (future), etc.
 */

console.log('Mellow Wave scripts loaded.');

// Mobile Menu Toggle (Example for future implementation)
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
