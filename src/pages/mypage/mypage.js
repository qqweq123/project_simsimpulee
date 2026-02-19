/**
 * Mellow Wave — 마이페이지 로직
 * 
 * - Supabase 세션에서 유저 정보 로드
 * - 고유넘버 생성 (user.id 해시)
 * - 테스트 기록 렌더링 (Supabase DB 또는 localStorage)
 */

import { supabase } from '/js/src/lib/supabaseClient.js';

// ===== 테스트 메타데이터 (test_list.js의 데이터와 매칭) =====
const TEST_META = {
    dessert: {
        title: '내가 디저트라면?',
        icon: '🍰',
        gradient: 'from-amber-100 to-yellow-50',
        tags: [
            { label: '성격', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' },
            { label: 'MBTI', bgColor: 'bg-pink-100', textColor: 'text-pink-700' }
        ],
        resultUrl: '/src/pages/tests/dessert/result.html'
    },
    love: {
        title: '나의 연애 능력치',
        icon: '💖',
        gradient: 'from-pink-100 to-rose-50',
        tags: [
            { label: '연애', bgColor: 'bg-red-100', textColor: 'text-red-700' },
            { label: '능력치', bgColor: 'bg-pink-100', textColor: 'text-pink-700' }
        ],
        resultUrl: '/src/pages/tests/love/result.html'
    },
    island: {
        title: '무인도 생존 유형',
        icon: '🏝️',
        gradient: 'from-emerald-100 to-teal-50',
        tags: [
            { label: '생존', bgColor: 'bg-green-100', textColor: 'text-green-700' },
            { label: '성향', bgColor: 'bg-teal-100', textColor: 'text-teal-700' }
        ],
        resultUrl: '/src/pages/tests/island/result.html'
    },
    hormoni: {
        title: '에겐녀? 테토녀?',
        icon: '💉',
        gradient: 'from-pink-100 to-purple-100',
        tags: [
            { label: '성향', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
            { label: '트렌드', bgColor: 'bg-fuchsia-100', textColor: 'text-fuchsia-700' }
        ],
        resultUrl: '/src/pages/tests/hormoni/result.html'
    },
    demon: {
        title: '귀멸의 내면 서사시',
        icon: '⚔️',
        gradient: 'from-slate-800 to-red-900',
        tags: [
            { label: '성격', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
            { label: '귀멸의칼날', bgColor: 'bg-red-100', textColor: 'text-red-700' }
        ],
        resultUrl: '/src/pages/tests/demon/result.html'
    }
};

// ===== 고유넘버 생성 (user.id를 짧은 해시로 변환) =====
function generateUniqueCode(userId) {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        const char = userId.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 32bit int
    }
    return Math.abs(hash).toString(36).slice(0, 9).padEnd(9, '0');
}

// ===== 고유 타이틀 생성 시스템 =====
// 형용사 풀 (40개)
const ADJECTIVES = [
    '용감한', '귀여운', '빛나는', '포근한', '신비한',
    '활기찬', '달콤한', '몽글한', '반짝이는', '느긋한',
    '씩씩한', '수줍은', '따뜻한', '산뜻한', '깜찍한',
    '명랑한', '소중한', '청량한', '부드러운', '엉뚱한',
    '다정한', '천진난만한', '호기심많은', '당당한', '사랑스러운',
    '장난꾸러기', '순수한', '행복한', '꿈꾸는', '반달같은',
    '무지개빛', '솜사탕같은', '별빛의', '노을빛', '바다향기',
    '꽃잎같은', '새벽이슬', '숲속의', '햇살가득', '파도타는'
];

// 명사 풀 (40개)
const NOUNS = [
    '꼬깔전사', '파도타기선수', '구름여행자', '별똥별', '마시멜로',
    '솜사탕요정', '무지개도둑', '달빛기사', '바람둥이', '꿀벌대장',
    '판다전사', '고양이왕', '토끼기사', '물고기왕자', '다람쥐탐험가',
    '구름조각가', '낮잠대마왕', '피자영웅', '도넛사냥꾼', '젤리곰',
    '펭귄기장', '코알라왕', '수달대장', '오리모험가', '사슴기사',
    '너구리대장', '라쿤탐정', '해파리댄서', '달팽이레이서', '반딧불이',
    '나비사냥꾼', '햄스터왕', '물개서퍼', '꿈해적', '초코전사',
    '구름빵장인', '별사탕수집가', '파도서퍼', '눈꽃기사', '하늘산책러'
];

// 타이틀용 이모지 풀 (20개)
const TITLE_EMOJIS = [
    '🌊', '⭐', '🌈', '🍀', '🎪', '🦋', '🌸', '🎯', '🔮', '🎠',
    '🧸', '🎨', '🌙', '☀️', '🍩', '🐾', '🏄', '🎵', '💫', '🌻'
];

/**
 * 고유넘버(uniqueCode)를 기반으로 귀여운 타이틀을 생성
 * @param {string} uniqueCode - generateUniqueCode()의 결과
 * @returns {{ title: string, emoji: string, bgColor: string, textColor: string }}
 */
function generateUserTitle(uniqueCode) {
    // uniqueCode를 숫자로 변환하여 시드로 사용
    let seed = 0;
    for (let i = 0; i < uniqueCode.length; i++) {
        seed = seed * 31 + uniqueCode.charCodeAt(i);
        seed = seed & 0x7FFFFFFF; // 양수 유지
    }

    const adjIdx = seed % ADJECTIVES.length;
    const nounIdx = Math.floor(seed / ADJECTIVES.length) % NOUNS.length;
    const emojiIdx = Math.floor(seed / (ADJECTIVES.length * NOUNS.length)) % TITLE_EMOJIS.length;

    const title = `${ADJECTIVES[adjIdx]} ${NOUNS[nounIdx]}`;
    const emoji = TITLE_EMOJIS[emojiIdx];

    // HSL 색상: 고유넘버에서 Hue 추출 (0~360), 파스텔 톤 유지
    const hue = seed % 360;
    const bgColor = `hsl(${hue}, 75%, 92%)`;
    const textColor = `hsl(${hue}, 60%, 35%)`;
    const borderColor = `hsl(${hue}, 65%, 82%)`;

    return { title, emoji, bgColor, textColor, borderColor };
}

// ===== 날짜 포맷 =====
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function timeAgo(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
    return formatDate(dateStr);
}

// ===== DOM Init =====
document.addEventListener('DOMContentLoaded', async () => {
    const nicknameEl = document.getElementById('user-nickname');
    const codeEl = document.getElementById('user-unique-code');
    const avatarImg = document.getElementById('profile-avatar');
    const defaultAvatar = document.getElementById('default-avatar');
    const statTestCount = document.getElementById('stat-test-count');
    const statJoinDate = document.getElementById('stat-join-date');
    const historyGrid = document.getElementById('history-grid');
    const emptyHistory = document.getElementById('empty-history');

    // 1. 세션 확인
    let session = null;
    let user = null;

    // ⚡ [DEV ONLY] 개발 환경 Mock Session 체크
    if (import.meta.env.DEV && localStorage.getItem('mw_dev_auth') === 'true') {
        session = {
            user: {
                id: 'dev-user-mock-12345', // 가짜 ID
                email: 'developer@mellowwave.com',
                user_metadata: {
                    nickname: '🛠️ 개발자',
                    avatar_url: null
                },
                created_at: new Date().toISOString()
            }
        };
        console.log('⚡ [DEV] 마이페이지: Mock Session 로드됨');
    } else {
        // 실제 Supabase 세션
        const { data } = await supabase.auth.getSession();
        session = data.session;
    }

    if (!session) {
        // 비로그인 → 로그인 페이지로 리다이렉트
        window.location.href = '/src/pages/auth/login/index.html';
        return;
    }

    user = session.user;

    // 2. 프로필 정보 표시
    const nickname = user.user_metadata?.nickname || user.user_metadata?.name || user.email?.split('@')[0] || '익명의 파도';
    const avatarUrl = user.user_metadata?.avatar_url || null;
    const uniqueCode = generateUniqueCode(user.id);
    const userTitle = generateUserTitle(uniqueCode);

    nicknameEl.textContent = nickname;
    codeEl.textContent = `#${uniqueCode}`;

    // 고유 타이틀 뱃지 렌더링
    const titleBadgeEl = document.getElementById('user-title-badge');
    if (titleBadgeEl) {
        titleBadgeEl.innerHTML = `${userTitle.emoji} ${userTitle.title}`;
        titleBadgeEl.style.backgroundColor = userTitle.bgColor;
        titleBadgeEl.style.color = userTitle.textColor;
        titleBadgeEl.style.borderColor = userTitle.borderColor;
    }

    if (avatarUrl) {
        avatarImg.src = avatarUrl;
        avatarImg.classList.remove('hidden');
        defaultAvatar.classList.add('hidden');
    }

    // 가입일
    statJoinDate.textContent = formatDate(user.created_at);

    // 3. 테스트 기록 로드
    let testHistory = [];

    // 3a. Supabase에서 로드 시도
    try {
        const { data, error } = await supabase
            .from('test_results')
            .select('*')
            .eq('user_id', user.id)
            .order('taken_at', { ascending: false });

        if (!error && data && data.length > 0) {
            testHistory = data;
        }
    } catch (e) {
        console.log('test_results 테이블이 아직 없거나 연결 불가:', e.message);
    }

    // 3b. Supabase 데이터가 없으면 localStorage에서 로드
    if (testHistory.length === 0) {
        const localResults = JSON.parse(localStorage.getItem('mw_guest_results') || '[]');
        testHistory = localResults;
    }

    // 4. 통계 업데이트
    statTestCount.textContent = testHistory.length;

    // 5. 테스트 기록 렌더링
    if (testHistory.length === 0) {
        emptyHistory.classList.remove('hidden');
        historyGrid.classList.add('hidden');
    } else {
        emptyHistory.classList.add('hidden');
        historyGrid.classList.remove('hidden');
        renderHistory(historyGrid, testHistory);
    }
});

// ===== 히스토리 카드 렌더링 =====
function renderHistory(container, history) {
    container.innerHTML = '';

    history.forEach((item, index) => {
        const meta = TEST_META[item.test_id];
        if (!meta) return; // 알 수 없는 테스트는 스킵

        const card = document.createElement('div');
        card.className = 'group bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer history-card-anim';
        card.style.animationDelay = `${index * 80}ms`;
        card.onclick = () => location.href = meta.resultUrl;

        // 태그 HTML
        const tagsHtml = meta.tags.map(t =>
            `<span class="${t.bgColor} ${t.textColor} text-xs font-bold px-2.5 py-0.5 rounded-full">#${t.label}</span>`
        ).join('');

        // 결과 뱃지
        const resultBadge = item.result_type
            ? `<span class="absolute top-2 right-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">${item.result_type}</span>`
            : '';

        // 시간
        const takenTime = item.taken_at ? timeAgo(item.taken_at) : '';

        card.innerHTML = `
            <div class="relative h-32 bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                ${meta.icon}
                ${resultBadge}
            </div>
            <div class="p-4">
                <h5 class="font-bold text-sm mb-1">${meta.title}</h5>
                <div class="flex items-center justify-between mb-2">
                    <div class="flex gap-1.5">${tagsHtml}</div>
                </div>
                <p class="text-xs text-gray-400">${takenTime}</p>
            </div>
        `;
        container.appendChild(card);
    });
}
