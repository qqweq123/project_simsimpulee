export async function executeShare(platform, customConfig = {}) {
    // Determine the base URL to share
    const urlObj = new URL(window.location.href);
    if (!urlObj.searchParams.has('mode')) {
        urlObj.searchParams.set('mode', 'viewer');
    }
    const targetUrl = customConfig.url || urlObj.href;
    const encodedUrl = encodeURIComponent(targetUrl);

    // Determine Metadata (Title, Desc, Image)
    const getMeta = (prop) => document.querySelector(`meta[property="${prop}"]`)?.content || '';

    const title = customConfig.title || document.getElementById('result-title')?.innerText || document.title || 'Mellow Wave 심리테스트';
    let desc = customConfig.desc || document.getElementById('result-subtitle')?.innerText || getMeta('og:description') || '당신의 결과와 어울리는 테스트를 확인해보세요!';

    // Process image: Must be a public URL for SNS crawlers (Kakao/Facebook). 
    // Fallback to a placeholder on Supabase if the detected src is a local vite dev server URL (localhost).
    let imgSrc = customConfig.image || document.getElementById('result-image')?.src || getMeta('og:image');
    if (!imgSrc || imgSrc.includes('localhost') || imgSrc.includes('127.0.0.1')) {
        // Fallback to public storage banner if local
        imgSrc = 'https://hykzfvrmnnykvinhtucc.supabase.co/storage/v1/object/public/test_image/island_test/banners/hero_banner_island_v1.png';
    }

    const text = encodeURIComponent(`${title} - ${desc} ✨`);

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Native Web Share API (Mobile Web Fallback except Kakao)
    if (isMobile && navigator.share && platform !== 'kakao') {
        navigator.share({
            title: title,
            text: desc,
            url: targetUrl,
        }).catch(console.error);
        return;
    }

    switch (platform) {
        case 'facebook':
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank', 'width=600,height=400');
            break;
        case 'twitter':
            window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${text}`, '_blank', 'width=600,height=400');
            break;
        case 'threads':
            window.open(`https://www.threads.net/intent/post?text=${text} ${encodedUrl}`, '_blank', 'width=600,height=400');
            break;
        case 'kakao':
            try {
                if (!window.Kakao) {
                    await new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.5.0/kakao.min.js';
                        script.integrity = 'sha384-D4h2/d3u29X1s1bBfE8L1t31QkP1fN25L2RzY6K2z//6Wv8Y6eB/8/f0B27qI2Hj';
                        script.crossOrigin = 'anonymous';
                        script.onload = resolve;
                        script.onerror = reject;
                        document.head.appendChild(script);
                    });
                }

                if (window.Kakao && !window.Kakao.isInitialized()) {
                    window.Kakao.init(import.meta.env.VITE_KAKAO_APP_KEY || '2d5b6a715767b0d77af8f59d5b035dd2');
                }

                if (window.Kakao && window.Kakao.isInitialized()) {
                    window.Kakao.Share.sendDefault({
                        objectType: 'feed',
                        content: {
                            title: title,
                            description: desc,
                            imageUrl: imgSrc,
                            link: {
                                mobileWebUrl: targetUrl,
                                webUrl: targetUrl,
                            },
                        },
                        buttons: [
                            {
                                title: '테스트 직접 하기 🌊',
                                link: {
                                    mobileWebUrl: targetUrl,
                                    webUrl: targetUrl,
                                },
                            },
                        ],
                    });
                } else {
                    throw new Error("Kakao Script not found or Init failed");
                }
            } catch (err) {
                console.error("Kakao Share Error:", err);
                navigator.clipboard.writeText(targetUrl).then(() => {
                    alert('카카오톡 공유를 시작할 수 없어 링크가 복사되었습니다. 채팅방에 붙여넣어 공유해주세요! 💌');
                });
            }
            break;
        case 'instagram':
        case 'link':
            navigator.clipboard.writeText(targetUrl).then(() => {
                alert('테스트 링크가 성공적으로 복사되었습니다! 🔗');
            });
            break;
        default:
            navigator.clipboard.writeText(targetUrl).then(() => {
                alert('링크 복사 완료!');
            });
            break;
    }
}

// Global binding for convenience in inline HTML handlers
export function bindGlobalShare() {
    if (typeof window !== 'undefined') {
        window.shareSNS = executeShare;
    }
}
