// 파일의 기능: 사이트 보호 및 개발 단계 비공개를 위한 Vercel 503 차단 API (가장 강력한 SEO 방어)
export default function handler(req, res) {
  // 503 상태 코드를 통해 서비스 점검 중임을 명시적으로 알림
  res.status(503);
  
  // 크롤러에게 24시간 후 다시 인덱싱 시도 권장
  res.setHeader('Retry-After', '86400');
  
  // 검색엔진 노출 및 크롤링 완전 차단
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  
  res.send(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="robots" content="noindex, nofollow">
      <title>Mallow Wave - 점검 중</title>
      <style>
        * { box-sizing: border-box; }
        body { 
          display: flex; 
          justify-content: center; 
          align-items: center; 
          height: 100vh; 
          margin: 0; 
          background: #0a0a0a; 
          color: #f5f5f5; 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
          text-align: center; 
          overflow: hidden;
        }
        .container {
          padding: 2.5rem 2rem;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(12px);
          max-width: 420px;
          width: 90%;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
        }
        h1 { 
          font-size: 1.6rem; 
          margin-top: 0; 
          margin-bottom: 1rem; 
          color: #fff; 
          font-weight: 600;
          letter-spacing: -0.02em;
        }
        p { 
          color: #888; 
          font-size: 1rem; 
          margin-bottom: 2rem; 
          line-height: 1.6; 
          word-break: keep-all;
        }
        .status {
          font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
          background: rgba(255, 85, 85, 0.1);
          color: #ff5555;
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          font-size: 0.85rem;
          display: inline-block;
          border: 1px solid rgba(255, 85, 85, 0.2);
          letter-spacing: 0.05em;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚧 Mallow Wave</h1>
        <p>현재 시스템 점검 및 개발 작업이 진행 중입니다.<br/>안전한 환경 구축을 위해 접속이 일시적으로 제한되었습니다.</p>
        <div class="status">HTTP 503 SERVICE UNAVAILABLE</div>
      </div>
    </body>
    </html>
  `);
}
