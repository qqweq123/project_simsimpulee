export function checkSession(sessionKey = 'island_test_started', redirectUrl = '/src/pages/tests/island/index.html') {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');

    if (mode === 'viewer') {
        // [Viewer Mode] 우회. 세션 스토리지가 없어도 허용.
        return 'viewer';
    }

    // [Owner Mode] 직접 테스트 한 사람인지 검증
    const hasStarted = sessionStorage.getItem(sessionKey);
    if (!hasStarted) {
        // 어뷰징 또는 URL 직접 치고 들어올 경우
        window.location.replace(redirectUrl);
        return 'redirect';
    }

    return 'owner';
}

export function cacheUTM() {
    // UTM 파라미터 랜딩 시점 캐싱
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const ref = urlParams.get('ref');

    if (utmSource) {
        sessionStorage.setItem('utm_source', utmSource);
    }
    if (ref) {
        sessionStorage.setItem('ref', ref);
    }
}
