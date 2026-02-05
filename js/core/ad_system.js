

//광고배너 로직

// 애드블록 감지
export function initAdBlockDetector() {
        document.addEventListener('DOMContentLoaded', function () {
                const bait = document.createElement('div');
                bait.innerHTML = '&nbsp;';
                bait.className = 'adsbox';
                bait.style.position = 'absolute';
                bait.style.top = '-1000px';
                bait.style.left = '-1000px';
                document.body.appendChild(bait);
                setTimeout(function () {
                        if (bait.offsetHeight === 0 || bait.style.display === 'none') {
                                document.getElementById('adblock-modal').classList.remove('hidden');
                                document.getElementById('adblock-modal').classList.add('flex');
                        }
                        document.body.removeChild(bait);
                }, 500);
        });
}


//잠금해제 로직
export function checkLockStatus() {

        window.unlockResult = function () {
                window.open('https://www.coupang.com', '_blank');
                localStorage.setItem('adUnlockTime', Date.now());

                const overlay = document.getElementById('lock-overlay');
                const content = document.getElementById('result-content');
                overlay.style.opacity = '0';
                setTimeout(() => {
                        overlay.style.display = 'none';
                        content.classList.remove('blur-content');
                }, 500);
        }

}

//화면 블러 제거
export function unlockContent() {
        window.open('https://www.coupang.com', '_blank');
        localStorage.setItem('adUnlockTime', Date.now());

        function checkAdLockStatus() {
                const unlockTime = localStorage.getItem('adUnlockTime');
                if (unlockTime) {
                        const now = Date.now();
                        if (now - parseInt(unlockTime) < 60 * 60 * 1000) {
                                window.unlockResult(); // Re-use unlock logic logic but without popup if already unlocked? 
                                // No, avoid popup. Manual implementation:
                                document.getElementById('lock-overlay').style.display = 'none';
                                document.getElementById('result-content').classList.remove('blur-content');
                        }
                }
        }
}
window.copyLink = function () {
        navigator.clipboard.writeText(window.location.href).then(() => {
                alert('링크가 복사되었습니다!');
        });
}
