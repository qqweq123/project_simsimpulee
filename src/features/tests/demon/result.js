import { demonResults } from './data.js';
import { ThemeManager } from '@/core/ThemeManager.js';

export function initDemonResult() {
    document.addEventListener('DOMContentLoaded', async () => {
        const urlParams = new URLSearchParams(window.location.search);

        // 1. Parse Data Config
        const archetype = urlParams.get('archetype') || '이름 없는 귀살대원';
        const resultData = demonResults[archetype];

        if (!resultData) {
            alert('잘못된 결과 데이터입니다.');
            window.location.href = 'index.html';
            return;
        }

        // 2. Determine Theme (Default: demon)
        const themeName = urlParams.get('theme') || 'demon';

        // 3. Initialize Manager
        const themeManager = new ThemeManager();
        const container = document.getElementById('app-container');

        // 4. Load Theme
        const success = await themeManager.loadTheme(themeName, container);
        if (!success) return;

        // 5. Bind Data
        themeManager.bindData(resultData);

        // 6. Bind Events
        themeManager.bindEvents({
            onShareKakao: () => alert('카카오톡 공유 기능 준비중입니다.'),
            onCopyLink: () => {
                const url = window.location.href;
                const textToCopy = `[귀멸의 칼날: 내면의 서사시] 테스트 결과, 저는 '${archetype}' 타입입니다! 당신의 내면에 잠든 존재도 확인해보세요.`;

                if (navigator.clipboard) {
                    navigator.clipboard.writeText(`${textToCopy}\n${url}`).then(() => {
                        alert('결과 링크가 복사되었습니다!');
                    });
                } else {
                    alert('링크 복사를 지원하지 않는 브라우저입니다.');
                }
            }
        });
    });
}
