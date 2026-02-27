// @ts-ignore: Deno URL imports are not recognized by the default Node.js TS compiler
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req: Request) => {
    const url = new URL(req.url);
    const type = url.searchParams.get('type') || 'survivor';

    // 봇 감지 (Bot Detection)
    // 카카오, 페이스북, 트위터 등의 크롤러 봇 User-Agent 식별
    const userAgent = req.headers.get('user-agent') || "";
    const isBot = /bot|kakaotalk|facebookexternalhit|twitterbot|slackbot|line/i.test(userAgent);

    // 봇이 아닌 일반 유저가 접근할 경우, 실제 브라우저 렌더링용 페이지(result.html)로 즉시 튕겨버립니다.
    if (!isBot) {
        // 쿼리 파라미터 보존 (mode=viewer 주입)
        const redirectUrl = new URL(`/src/pages/tests/island/result.html`, url.origin);
        url.searchParams.forEach((val, key) => {
            redirectUrl.searchParams.set(key, val);
        });
        redirectUrl.searchParams.set('mode', 'viewer');

        return Response.redirect(redirectUrl.href, 302);
    }

    // ============== Bot 전용 HTML 렌더링 ==============

    // 결과 타입에 따른 메타데이터 하드코딩 (DB 조회도 가능하나 성능상 하드코딩 유리)
    const metaMap: Record<string, { title: string, desc: string, img: string }> = {
        leader: {
            title: "나의 무인도 생존 유형은 [카리스마 리더] 👑",
            desc: "위기의 섬을 이끄는 사령관! 당신의 생존 전략을 확인하세요.",
            img: "https://hykzfvrmnnykvinhtucc.supabase.co/storage/v1/object/public/test_image/island_test/leader.webp"
        },
        explorer: {
            title: "나의 무인도 생존 유형은 [호기심 탐험가] 🧭",
            desc: "미지의 세계를 개척하는 자유로운 탐험가! 당신의 생존 전략을 확인하세요.",
            img: "https://hykzfvrmnnykvinhtucc.supabase.co/storage/v1/object/public/test_image/island_test/explorer.webp"
        },
        survivor: {
            title: "나의 무인도 생존 유형은 [고독한 생존가] 🔥",
            desc: "맨손으로 문명을 건설하는 장인! 당신의 생존 전략을 확인하세요.",
            img: "https://hykzfvrmnnykvinhtucc.supabase.co/storage/v1/object/public/test_image/island_test/survivor.webp"
        },
        diplomat: {
            title: "나의 무인도 생존 유형은 [평화주의 외교관] 🤝",
            desc: "사람들을 하나로 묶는 화합의 달인! 당신의 생존 전략을 확인하세요.",
            img: "https://hykzfvrmnnykvinhtucc.supabase.co/storage/v1/object/public/test_image/island_test/diplomat.webp"
        }
    };

    const meta = metaMap[type as string] || metaMap.survivor;

    // 순수 빈 HTML이지만 풍부한 OG 태그를 품고 있음
    const html = `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <title>${meta.title}</title>
      <meta property="og:title" content="${meta.title}">
      <meta property="og:description" content="${meta.desc}">
      <meta property="og:image" content="${meta.img}">
      <meta property="og:type" content="website">
      
      <!-- Twitter Card Meta Tags -->
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:title" content="${meta.title}">
      <meta name="twitter:description" content="${meta.desc}">
      <meta name="twitter:image" content="${meta.img}">
    </head>
    <body>
      <!-- 봇 전용 페이지. JS 미지원 환경에서는 이 텍스트만 렌더링됨 -->
      <h1>Mellow Wave 무인도 테스트</h1>
      <p>${meta.desc}</p>
    </body>
    </html>
  `;

    return new Response(html, {
        headers: {
            "content-type": "text/html; charset=UTF-8",
        },
    });
});
