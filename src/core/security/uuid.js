export function generateSessionUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for extremely old browsers
    return `mellow-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
