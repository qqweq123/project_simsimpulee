import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ARTIFACT_DIR = 'C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\17bc1cc5-0c12-4082-91f2-400518773a7d';
const files = fs.readdirSync(ARTIFACT_DIR);
const targetFiles = files.filter(f => f.startsWith('banner_') && f.includes('_v2_') && f.endsWith('.png'));

async function processCrop() {
    console.log(`Found ${targetFiles.length} V2 banners to crop.`);

    for (const file of targetFiles) {
        const sourcePath = path.join(ARTIFACT_DIR, file);
        const destName = file.replace('_v2_', '_v3_');
        const destPath = path.join(ARTIFACT_DIR, destName);

        try {
            // sharp의 trim()을 사용하면 주변 동일 색상(배경)을 자동으로 잘라줍니다.
            // threshold 설정으로 부드러운 그라데이션 여백도 제거 시도.
            console.log(`Processing: ${file}...`);
            await sharp(sourcePath)
                .trim({ threshold: 40 })
                .toFile(destPath);
            console.log(` -> Cropped and saved as: ${destName}`);
        } catch (err) {
            console.error(`Failed to crop ${file}:`, err);
        }
    }
}

processCrop();
