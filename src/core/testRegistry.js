/**
 * Mellow Wave - Global Test Registry (SSOT)
 * 
 * 모든 테스트의 기초 메타데이터를 통합 관리하는 중앙 저장소입니다.
 * 이 데이터는 test_list.html의 카드 렌더링 및 동적 추천 알고리즘에 활용됩니다.
 */

import { TestService } from '@/core/testService.js';

export const testRegistry = [
    {
        id: 'dopamine',
        title: '현대인 도파민 생태계',
        desc: '무한스크롤 vs 탕진잼? 내 안의 도파민 괴물 찾기',
        tags: [
            { label: '도파민', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
            { label: '숏폼', bgColor: 'bg-pink-100', textColor: 'text-pink-700' }
        ],
        category: 'unique',
        icon: '📱',
        gradient: 'from-indigo-100 via-purple-50 to-pink-100',
        badge: 'NEW',
        badgeGradient: 'from-purple-500 to-pink-500',
        participants: 1205, // Monthly Top Candidate
        weeklyHits: 800,  // Weekly Top Candidate
        date: '2026-02-27',
        url: '/src/pages/tests/dopamine/index.html',
        bannerUrl: 'https://placehold.co/1200x330/8b5cf6/ffffff?text=Dopamine+Test+Banner'
    },
    {
        id: 'dessert',
        title: '내가 디저트라면?',
        desc: '달콤한 디저트로 알아보는 나의 MBTI 성격 유형',
        tags: [
            { label: '성격', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' },
            { label: 'MBTI', bgColor: 'bg-pink-100', textColor: 'text-pink-700' }
        ],
        category: 'personality',
        icon: '🍰',
        gradient: 'from-amber-100 to-yellow-50',
        badge: 'HOT',
        badgeGradient: 'from-red-500 to-orange-500',
        participants: 12345, // Monthly Higehst
        weeklyHits: 3500,
        date: '2024-01-20',
        url: '/src/pages/tests/dessert/index.html',
        bannerUrl: 'https://hykzfvrmnnykvinhtucc.supabase.co/storage/v1/object/public/test_image/island_test/banners/banner_dessert_v7.webp'
    },
    {
        id: 'love',
        title: '나의 연애 능력치',
        desc: '10가지 상황으로 측정하는 SS~D급 연애 등급',
        tags: [
            { label: '연애', bgColor: 'bg-red-100', textColor: 'text-red-700' },
            { label: '능력치', bgColor: 'bg-pink-100', textColor: 'text-pink-700' }
        ],
        category: 'love',
        icon: '💖',
        gradient: 'from-pink-100 via-rose-50 to-red-100',
        badge: 'NEW',
        badgeGradient: 'from-pink-500 to-rose-500',
        participants: 8742,
        weeklyHits: 4200, // Weekly Highest
        date: '2024-02-15',
        url: '/src/pages/tests/love/index.html',
        bannerUrl: 'https://hykzfvrmnnykvinhtucc.supabase.co/storage/v1/object/public/test_image/island_test/banners/banner_love_v7.webp'
    },
    {
        id: 'island',
        title: '무인도 생존 유형',
        desc: '극한 상황에서의 선택으로 보는 4가지 생존 유형',
        tags: [
            { label: '생존', bgColor: 'bg-green-100', textColor: 'text-green-700' },
            { label: '성향', bgColor: 'bg-teal-100', textColor: 'text-teal-700' }
        ],
        category: 'survival',
        icon: '🏝️',
        gradient: 'from-emerald-100 via-teal-50 to-cyan-100',
        badge: 'NEW',
        badgeGradient: 'from-emerald-500 to-teal-600',
        participants: 5231,
        weeklyHits: 2100,
        date: '2024-02-14',
        url: '/src/pages/tests/island/index.html',
        bannerUrl: 'https://placehold.co/1200x330/0ea5e9/ffffff?text=Island+Survival+Banner'
    },
    {
        id: 'hormoni',
        title: '에겐녀? 테토녀?',
        desc: '나의 호르몬 타입은 에스트로겐일까 테스토스테론일까?',
        tags: [
            { label: '성향', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
            { label: '트렌드', bgColor: 'bg-fuchsia-100', textColor: 'text-fuchsia-700' }
        ],
        category: 'personality',
        icon: '💉',
        gradient: 'from-pink-100 to-purple-100',
        badge: 'HOT',
        badgeGradient: 'from-pink-500 to-purple-500',
        participants: 9876,
        weeklyHits: 1500,
        date: '2024-02-01',
        url: '/src/pages/tests/hormoni/index.html',
        bannerUrl: 'https://hykzfvrmnnykvinhtucc.supabase.co/storage/v1/object/public/test_image/island_test/banners/banner_hormone_v7.webp'
    },
    {
        id: 'demon',
        title: '귀멸의 내면 서사시',
        desc: '모든 것을 잃은 폐허 속에서 찾는 나의 호흡',
        tags: [
            { label: '성격', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
            { label: '귀멸의칼날', bgColor: 'bg-red-100', textColor: 'text-red-700' }
        ],
        category: 'unique',
        icon: '⚔️',
        gradient: 'from-slate-800 to-red-900',
        badge: null,
        badgeGradient: null,
        participants: 3412,
        weeklyHits: 900,
        date: '2024-02-18',
        url: '/src/pages/tests/demon/index.html',
        bannerUrl: 'https://hykzfvrmnnykvinhtucc.supabase.co/storage/v1/object/public/test_image/island_test/banners/banner_demon_v7.webp'
    }
];

export function getTestById(id) {
    return testRegistry.find(test => test.id === id);
}

/**
 * Supabase DB에서 실제 참여자 수를 가져와 testRegistry 메모리를 실시간 업데이트합니다.
 */
export async function syncTestStats() {
    const stats = await TestService.getTestStats();
    if (!stats || stats.length === 0) return;

    stats.forEach(dbRow => {
        const testObj = testRegistry.find(t => t.id === dbRow.test_id);
        if (testObj && dbRow.participants_count != null) {
            testObj.participants = dbRow.participants_count;
        }
    });
}
