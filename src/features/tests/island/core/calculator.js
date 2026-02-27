/**
 * Score Calculator Module
 */
export function getTopType(scores) {
    if (!scores || typeof scores !== 'object') return 'survivor'; // Default fallback

    // Find the max score type
    return Object.entries(scores).reduce((a, b) => a[1] >= b[1] ? a : b)[0];
}

export function parseQueryScores() {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type') || 'survivor';

    let scores = { leader: 0, explorer: 0, survivor: 0, diplomat: 0 };
    try {
        const s = urlParams.get('scores');
        if (s) scores = JSON.parse(decodeURIComponent(s));
    } catch (e) {
        console.warn("Failed to parse scores", e);
    }

    return { type, scores };
}
