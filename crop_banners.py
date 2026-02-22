import cv2
import glob
import os

artifact_dir = r"C:\Users\Administrator\.gemini\antigravity\brain\17bc1cc5-0c12-4082-91f2-400518773a7d"
files = glob.glob(os.path.join(artifact_dir, "banner_*_v2_*.png"))

for file in files:
    img = cv2.imread(file, cv2.IMREAD_UNCHANGED)
    if img is None: continue
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # 엣지 검출 또는 이진화 (간단히 캐니 엣지로 주요 객체 바운딩 박스 탐색)
    edges = cv2.Canny(gray, 50, 150)
    cnts, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if not cnts:
        continue
        
    x, y, w, h = cv2.boundingRect(max(cnts, key=cv2.contourArea))
    
    # 약간의 패딩 허용
    pad = 5
    crop_y1 = max(0, y - pad)
    crop_y2 = min(img.shape[0], y + h + pad)
    crop_x1 = max(0, x - pad)
    crop_x2 = min(img.shape[1], x + w + pad)
    
    cropped = img[crop_y1:crop_y2, crop_x1:crop_x2]
    
    # v3로 저장
    new_name = os.path.basename(file).replace("v2", "v3")
    out_path = os.path.join(artifact_dir, new_name)
    cv2.imwrite(out_path, cropped)
    print(f"Cropped {new_name}")
