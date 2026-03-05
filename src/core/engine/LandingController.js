import { TestService } from '@/core/testService.js';
import { generateSessionUUID } from '@/core/security/uuid.js';
import { initTelemetryListener } from '@/core/telemetry/telemetry.js'; // Optional telemetry hook if needed on landing

/**
 * LandingController
 * 랜딩 페이지의 전역 논리(세션 발급, 조회수 SWR 렌더링, SEO 스키마 동기화)를
 * 완전히 캡슐화한 클래스입니다. HTML 내의 인라인 스크립트 오염을 원천 차단합니다.
 */
export class LandingController {
    static init(testId, participantCountElId = 'participant-count') {
        // 1. Telemetry Session Initialization (UUID 발급)
        const uuidKey = `${testId}_test_uuid`;
        if (!sessionStorage.getItem(uuidKey)) {
            sessionStorage.setItem(uuidKey, generateSessionUUID());
            sessionStorage.setItem(`${testId}_session_start_time`, Date.now());
        }

        // 2. SWR (Stale-While-Revalidate) - Participant Count Animation
        // Extract baseline from JSON-LD Schema to sync SEO with UI (Stale Value)
        let baseCount = 0;
        const schemaScript = document.querySelector('script[type="application/ld+json"]');
        if (schemaScript) {
            try {
                const schemaData = JSON.parse(schemaScript.textContent);
                if (schemaData.interactionStatistic && schemaData.interactionStatistic.userInteractionCount) {
                    baseCount = schemaData.interactionStatistic.userInteractionCount;
                }
            } catch (e) { console.error("SEO Schema Parse Error", e); }
        }

        if (baseCount === 0) baseCount = 5000; // Fallback

        const countEl = document.getElementById(participantCountElId);
        if (countEl) {
            let current = 0;
            const duration = 2000; // 2 seconds allows time for fetch to return
            const startTime = performance.now();
            let isFetched = false;

            // Count-up animation for engaging VFX without DB load blocking
            const animateCount = (timestamp) => {
                const progress = Math.min((timestamp - startTime) / duration, 1);
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const currentVal = Math.floor(baseCount * easeOut);

                countEl.innerText = `${currentVal.toLocaleString()}명 참여`;

                if (progress < 1) {
                    requestAnimationFrame(animateCount);
                } else if (isFetched) {
                    countEl.innerText = `${baseCount.toLocaleString()}명 참여`;
                } else {
                    countEl.innerText = `${baseCount.toLocaleString()}+ 참여`;
                }
            };

            // Start immediate UI animation (Stale)
            requestAnimationFrame(animateCount);

            // Revalidate (Background Fetch)
            const cacheKey = `${testId}_participants_cache`;
            const cached = sessionStorage.getItem(cacheKey);

            if (cached) {
                const cachedNum = parseInt(cached, 10);
                if (cachedNum > baseCount) baseCount = cachedNum;
                isFetched = true;
            } else {
                TestService.getSingleTestStats(testId).then(dbCount => {
                    if (dbCount && dbCount > baseCount) {
                        baseCount = dbCount; // Swap target goal mid-flight
                        sessionStorage.setItem(cacheKey, dbCount.toString());
                    }
                    isFetched = true;
                }).catch(err => {
                    // [Director Code Review Fix] SWR Cache Race Condition 로깅 강화
                    console.error(`[SWR Revalidate Fatal] Failed to fetch stats for ${testId}`, err);
                    // UX 방어: 에러 발생 시 초기 세팅된 JSON-LD Stale 값을 그대로 유지하여 사용자 기만 방지
                    isFetched = true;
                });
            }
        }
    }
}
