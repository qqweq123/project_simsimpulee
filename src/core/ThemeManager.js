const CONFIG = {
    TEMPLATE_PATH: '/templates',
    STYLE_PATH: '/styles/themes'
};

export class ThemeManager {
    constructor() {
        this.currentThemeLink = null;
        this.templateCache = new Map(); // HTML 템플릿 캐싱
    }

    /**
     * 테마를 로드합니다. (최적화 적용)
     * 1. CSS 프리로딩 (FOUC 방지)
     * 2. HTML 템플릿 로드 (캐싱 활용)
     * 3. DOM 주입
     * @param {string} themeName - 'collage' or 'swiss'
     * @param {HTMLElement} container - HTML을 주입할 컨테이너
     */
    async loadTheme(themeName, container) {
        try {
            // 1. CSS 로드 (비동기 병렬 처리 가능하나, 스타일 우선 적용을 위해 대기)
            await this._loadCssSafe(themeName);

            // 2. HTML 템플릿 가져오기 (캐시 확인)
            let html = this.templateCache.get(themeName);
            if (!html) {
                const response = await fetch(`${CONFIG.TEMPLATE_PATH}/result_${themeName}.html`);
                if (!response.ok) throw new Error(`Failed to load template: ${themeName}`);
                html = await response.text();
                this.templateCache.set(themeName, html);
            }

            // 3. HTML 주입
            container.innerHTML = html;

            return true;
        } catch (error) {
            console.error(error);
            container.innerHTML = `<div class="p-4 text-red-500 font-bold">Error loading theme: ${error.message}</div>`;
            return false;
        }
    }

    /**
     * CSS를 안전하게 로드합니다.
     * 기존 스타일을 제거하기 전에 새 스타일이 로드되기를 기다려 깜빡임(FOUC)을 방지합니다.
     * @param {string} themeName 
     */
    _loadCssSafe(themeName) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `${CONFIG.STYLE_PATH}/${themeName}.css`;
            link.id = `theme-style-${themeName}`;

            link.onload = () => {
                // 새 스타일 로드 완료 후 기존 스타일 제거
                if (this.currentThemeLink) {
                    this.currentThemeLink.remove();
                }
                this.currentThemeLink = link;
                resolve();
            };

            link.onerror = () => {
                reject(new Error(`Failed to load CSS: ${themeName}`));
            };

            document.head.appendChild(link);
        });
    }

    /**
     * 데이터를 표준 DOM 요소에 바인딩합니다.
     * @param {Object} data - 결과 데이터 객체
     */
    bindData(data) {
        this._setText('result-title', data.name);
        this._setText('result-subtitle', data.subtitle);
        this._setText('result-desc', data.desc);
        this._setText('match-best', data.match.best);
        this._setText('match-worst', data.match.worst);

        // 이모지 또는 이미지 처리
        const emojiEl = document.getElementById('result-emoji');
        if (emojiEl && data.emoji) emojiEl.innerText = data.emoji;

        const imageEl = document.getElementById('result-image');
        if (imageEl && data.image) {
            imageEl.src = data.image;
            imageEl.style.display = 'block'; // Ensure it's visible if hidden by default
        }


        // 태그 처리
        const tagsEl = document.getElementById('result-tags');
        if (tagsEl && data.tags) {
            tagsEl.innerHTML = '';
            data.tags.forEach(tag => {
                const span = document.createElement('span');
                span.innerText = tag;
                span.className = 'tag-item'; // 공통 클래스
                tagsEl.appendChild(span);
            });
        }
    }

    /**
     * 공통 이벤트를 바인딩합니다.
     * @param {Object} handlers - { onUnlock: fn, onShareKakao: fn, onCopyLink: fn }
     */
    bindEvents(handlers) {
        this._bindEvent('btn-unlock', 'click', handlers.onUnlock);
        this._bindEvent('btn-share-kakao', 'click', handlers.onShareKakao);
        this._bindEvent('btn-share-link', 'click', handlers.onCopyLink);
    }

    /**
     * 이벤트 바인딩 헬퍼 (요소 존재 여부 확인)
     */
    _bindEvent(id, event, handler) {
        const el = document.getElementById(id);
        if (el && handler) {
            el.addEventListener(event, handler);
        }
    }

    /**
     * 텍스트 설정 헬퍼
     */
    _setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.innerText = text || '';
    }
}
