import { ScoreCalculator } from '@/core/engine/ScoreCalculator.js';
import { ResultRenderer } from '@/core/engine/ResultRenderer.js';
import { initTelemetryListener, startQuestionTimer, getPureDwellTime } from '@/core/telemetry/telemetry.js';
import { isBotTraffic } from '@/core/security/honeypot.js';
import { checkSession, cacheUTM } from '@/core/security/validator.js';
import { generateSessionUUID } from '@/core/security/uuid.js';
import { TestService } from '@/core/testService.js';

export class TestRunner {
    static currentStep = 0;
    static totalSteps = 0;
    static scores = {};
    static questionsConfig = [];
    static testId = '';

    /**
     * 질문지(Question) 페이지 공통 초기화 로직
     * @param {string} id - 테스트 고유 ID (예: 'island', 'dopamine')
     * @param {Array} questions - 문항 JSON 데이터 배열
     * @param {Object} initialScores - 초기 점수 상태 객체 { leader: 0, ... }
     */
    static initQuestionStrategy(id, questions, initialScores) {
        this.testId = id;
        this.questionsConfig = questions;
        this.totalSteps = questions.length;

        // [Phase 4: State Recovery & FOUC Prevention]
        // DOMContentLoaded 이전에 동기적으로 상태를 읽어 즉시 복원(Rehydration)합니다.
        // 새션 클리어 로직은 `고민시간 측정 모듈과 충돌 위협`이 있으니 반드시 고려하여 주세요.
        let recoveredStep = 0;
        let recoveredScores = null;
        try {
            const cachedRaw = sessionStorage.getItem(`${id}_progress`);
            if (cachedRaw) {
                const cached = JSON.parse(cachedRaw);
                const TWENTY_MIN_MS = 20 * 60 * 1000; // 20 minutes TTL

                // [Phase 5: 20-minute Cache TTL] Check for Inactivity
                if (cached.timestamp && (Date.now() - cached.timestamp < TWENTY_MIN_MS)) {
                    if (cached && typeof cached.step === 'number' && cached.scores) {
                        recoveredStep = cached.step;
                        recoveredScores = cached.scores;
                    }
                } else {
                    // 세션 만료됨 (방치 후 재접속) -> 캐시 강제 파괴 (초기화)
                    sessionStorage.removeItem(`${id}_progress`);
                    console.log(`[Architecture] 20m Cache TTL expired. Flushed old state for ${id}.`);
                }
            }
        } catch (e) { /* 파싱 실패 시 무시 */ }

        this.scores = recoveredScores ? { ...recoveredScores } : { ...initialScores };
        this.currentStep = recoveredStep;

        document.addEventListener('DOMContentLoaded', () => {
            // 1. 텔레메트리 및 어뷰저 방어 초기화
            initTelemetryListener(id);
            startQuestionTimer();

            // 1.5. 트래픽 마케팅용 참여자 수 기록 (테스트 시작 기준)
            TestService.incrementParticipantCount(id);

            // 2. 이벤트 위임(Event Delegation) 설정
            const container = document.getElementById('answers-container');
            if (container) {
                container.addEventListener('click', (e) => this.handleAnswerClick(e));
            }

            // 3. 문제 렌더링 (Hydration)
            this.renderQuestion();
        });
    }

    static handleAnswerClick(e) {
        const btn = e.target.closest('.answer-btn');
        if (!btn) return;

        btn.blur(); // 포커스 해제 (모바일/사파리 잔상 방지)

        const type = btn.dataset.type;
        const types = type ? type.split(',') : []; // 다중 타입 지원 (콤마 구분)

        if (types.length > 0) {
            // 즉각적인 DOM 변이로 인한 :active CSS Stuck 현상 방지를 위해 Call Stack을 잠시 비워줌
            setTimeout(() => this.selectAnswer(types), 50);
        }
    }

    static renderQuestion() {
        const question = this.questionsConfig[this.currentStep];

        const qEl = document.getElementById('question-text');
        if (qEl) qEl.innerHTML = question.q;

        const container = document.getElementById('answers-container');
        if (container) {
            // DOM을 부수지 않고 값만 교체하는 Hydration 기법
            const buttons = Array.from(container.querySelectorAll('.answer-btn'));
            question.answers.forEach((ans, index) => {
                if (buttons[index]) {
                    buttons[index].innerText = ans.text;
                    buttons[index].dataset.type = ans.type;
                }
            });
        }

        // Progress
        const progress = ((this.currentStep + 1) / this.totalSteps) * 100;
        const bar = document.getElementById('progress-bar');
        const text = document.getElementById('progress-text');
        if (bar) bar.style.width = `${progress}%`;
        if (text) text.innerText = `${this.currentStep + 1} / ${this.totalSteps}`;

        // Animation
        const card = document.getElementById('question-card');
        if (card) {
            card.classList.remove('fade-in');
            void card.offsetWidth;
            card.classList.add('fade-in');
        }
    }

    static selectAnswer(types) {
        types.forEach(t => {
            const key = t.trim();
            if (this.scores[key] !== undefined) {
                this.scores[key]++;
            } else {
                this.scores[key] = 1; // 타입이 동적으로 생길 경우를 대비 (A/B 테스트 등)
            }
        });

        this.currentStep++;

        // [Phase 4 State Recovery] 
        // 매 클릭마다 문항 인덱스와 누적 점수를 고속 캐싱 (Micro-Funnel Analytics last_question_index 용도로도 활용됨)
        try {
            sessionStorage.setItem(`${this.testId}_progress`, JSON.stringify({
                step: this.currentStep,
                scores: this.scores,
                timestamp: Date.now()
            }));
        } catch (e) { }

        // [Phase 3 Architecture] Background Prefetching (Waterfall 해소)
        // 유저가 마지막 2문항 정도를 풀고 있을 때(Idle Time), 결과 화면에 나올 배너 이미지들을 미리 메모리에 캐싱해둠.
        if (this.currentStep === Math.max(0, this.totalSteps - 2) && !this.hasPrefetched) {
            this.hasPrefetched = true;
            this.prefetchRecommendations();
        }

        if (this.currentStep >= this.totalSteps) {
            this.showResult();
        } else {
            this.renderQuestion();
        }
    }

    /**
     * 추천 알고리즘 백그라운드 선탑재 (Prefetching)
     * 결과 페이지 진입 후 이미지가 덜컥거리며 로딩되는 CLS 현상을 방지
     */
    static prefetchRecommendations() {
        import('@/core/recommendationEngine.js').then(module => {
            const Engine = module.RecommendationEngine;
            const recommendations = Engine.getRecommendations(this.testId);
            if (!recommendations) return;

            recommendations.forEach(item => {
                if (item.bannerUrl) {
                    const link = document.createElement('link');
                    link.rel = 'preload';
                    link.as = 'image';
                    link.href = item.bannerUrl;
                    document.head.appendChild(link);
                }
            });
            console.log(`[Architecture] Prefetched ${recommendations.length} recommendation banners.`);
        }).catch(err => console.warn('Prefetching failed', err));
    }

    static showResult() {
        // 봇 트래픽 필터링 (허니팟 체크 시 무반응 혹은 튕겨내기)
        if (isBotTraffic()) {
            console.warn("Invalid Traffic Detected");
            location.href = '/index.html';
            return;
        }

        // 체류 시간 및 통계 처리
        const pureDwellTime = getPureDwellTime();

        // 식별자 및 검증 플래그 발급 (Owner Mode 증명서)
        const sessionKeyPrefix = this.testId.split('_')[0];

        if (!sessionStorage.getItem(`${sessionKeyPrefix}_test_uuid`)) {
            const uuid = generateSessionUUID();
            sessionStorage.setItem(`${sessionKeyPrefix}_test_uuid`, uuid);
        }
        sessionStorage.setItem(`${sessionKeyPrefix}_test_started`, 'true'); // 보안 검증 패스포트 부여
        sessionStorage.setItem(`${sessionKeyPrefix}_last_dwell_time`, pureDwellTime.toString()); // 차후 RPC 전송용 캐싱

        // 테스트가 완료되었으므로 진행 상태 캐시 삭제 (Micro-Funnel Analytics 찌꺼기 방지)
        sessionStorage.removeItem(`${this.testId}_progress`);

        // 엔진에 스코어 파싱 위임 (island는 단일, dopamine/demon은 다중 등. 기본은 최고점)
        // 도파민 테스트 커스텀 라우팅
        if (this.testId === 'dopamine') {
            const ranks = ScoreCalculator.getTopRankedKeys(this.scores, 2);
            const encoded = ScoreCalculator.encodeScores(ranks);
            location.href = `result.html?mode=owner&ranks=${encoded}`;
        } else {
            const topType = ScoreCalculator.getHighestScoreKey(this.scores);
            const encoded = ScoreCalculator.encodeScores(this.scores);
            location.href = `result.html?mode=owner&type=${topType}&scores=${encoded}`;
        }
    }

    /**
     * 결과 페이지 전면 광고 제어
     */
    static handleInterstitialAd() {
        const overlay = document.getElementById('lock-overlay');
        const progress = document.getElementById('loading-progress');
        const title = document.getElementById('loading-title');
        const btn = document.getElementById('btn-unlock');

        if (!overlay) return;

        setTimeout(() => {
            if (progress) progress.style.width = '100%';
        }, 100);

        setTimeout(() => {
            if (title) title.innerHTML = '분석이 완료되었습니다! 🏝️';
            if (btn) {
                btn.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-emerald-500');
                btn.classList.add('hover:shadow-xl', 'animate-pulse', 'bg-gradient-to-r', 'from-emerald-500', 'to-teal-600', 'shadow-lg');
                btn.disabled = false;
            }
        }, 3100);

        // 전역 바인딩 (인라인 HTML 호출용)
        window.unlockResult = () => {
            localStorage.setItem('adUnlockTime', Date.now());
            overlay.style.transition = 'opacity 0.6s ease';
            overlay.style.opacity = '0';
            const content = document.getElementById('result-content');
            setTimeout(() => {
                overlay.style.display = 'none';
                if (content) content.classList.remove('blur-content');
            }, 600);
        };
    }

    /**
     * 결과지(Result) 페이지 공통 초기화 로직
     */
    static initResultStrategy(id, resultsConfig, metaData = {}) {
        document.addEventListener('DOMContentLoaded', () => {
            // 1. 보안 검증 및 캐싱
            cacheUTM();
            const sessionKeyPrefix = id.split('_')[0];
            const mode = checkSession(`${sessionKeyPrefix}_test_started`, `/src/pages/tests/${id}/index.html`);
            if (mode === 'redirect') return;

            // 2. 파라미터 파싱
            const urlParams = new URLSearchParams(location.search);
            const encoded = urlParams.get('scores') || urlParams.get('ranks');
            // parseEncodedScores call omitted temporarily to keep it simple, just read type

            let resultData = null;
            if (id === 'dopamine') {
                // Dopamine: Currently requires dopamine specific result parsing, to be handled later
                // For now, let's keep dopamine using its own result.js and focus on island and standard tests
                return;
            } else {
                const type = urlParams.get('type') || 'survivor';
                resultData = resultsConfig[type];
            }

            if (!resultData) return;

            // 2.5. 원시 내부 데이터용 완료자 수 집계 (DB)
            TestService.incrementCompletionCount(id);

            // 3. UI 렌더링 
            const emojiEl = document.getElementById('result-emoji');
            if (emojiEl) emojiEl.innerText = resultData.emoji;

            const imageEl = document.getElementById('result-image');
            if (imageEl && resultData.image) {
                imageEl.src = resultData.image;
                imageEl.alt = resultData.name;
            }

            const titleEl = document.getElementById('result-title');
            if (titleEl) titleEl.innerText = resultData.name;

            const subTitleEl = document.getElementById('result-subtitle');
            if (subTitleEl) subTitleEl.innerText = resultData.subtitle || '';

            const descEl = document.getElementById('result-desc');
            if (descEl) descEl.innerHTML = resultData.combinedDesc ? resultData.combinedDesc.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>') : resultData.desc;

            const tagContainer = document.getElementById('result-tags');
            if (tagContainer && resultData.tags) {
                tagContainer.innerHTML = '';
                resultData.tags.forEach(tag => {
                    const span = document.createElement('span');
                    span.className = resultData.bgColor ? `px-3 py-1 ${resultData.bgColor} ${resultData.textColor} rounded-full text-xs font-bold border ${resultData.borderColor}` : `inline-block bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-sm font-medium mr-2 mb-2`;
                    span.innerText = tag;
                    tagContainer.appendChild(span);
                });
            }

            const card = document.getElementById('result-card');
            if (card && resultData.bgColor) card.className = `${resultData.bgColor} rounded-3xl shadow-xl overflow-hidden relative fade-in`;

            const bgContainer = document.getElementById('result-bg-container');
            if (bgContainer && resultData.textColor) bgContainer.className = `max-w-md w-full rounded-3xl shadow-lg p-8 mx-auto text-center border bg-white ${resultData.textColor}`;

            const gradientBar = document.getElementById('gradient-bar');
            if (gradientBar && resultData.color) gradientBar.className = `h-2 bg-gradient-to-r ${resultData.color} w-full`;

            ResultRenderer.renderAbilityBars(resultData.traits);
            ResultRenderer.renderHotContents(id, { layout: metaData.bannerLayout || 'card' });

            // 4. 모드에 따른 공유 분기
            ResultRenderer.renderActionButtons(mode);

            // 5. 로딩 화면 제어
            this.handleInterstitialAd();
        });

        window.unlockResult = this.handleInterstitialAd;
    }
}
