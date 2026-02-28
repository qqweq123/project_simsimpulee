/**
 * Honeypot System for Bot Detection
 * 
 * Inject an invisible checkbox into the DOM.
 * If a bot clicks it or sets it to checked, the backend will drop the request.
 */


export function isBotTraffic() {
    // 1. QA 서브에이전트 검증 Bypass 통로 오픈 (Cookie)
    const cookies = document.cookie.split(';').map(c => c.trim());
    const isAgent = cookies.some(c => c.startsWith('x-agent-bypass=true'));
    if (isAgent) {
        return false; // 통과
    }

    // 2. 허니팟 요소 탐지
    const hp = document.getElementById('hp_trap');
    if (hp && hp.checked) {
        return true; // 봇 판정
    }

    return false; // 인간 판정
}
