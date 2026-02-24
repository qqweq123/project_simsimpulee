import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ARTIFACT_DIR = 'C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\17bc1cc5-0c12-4082-91f2-400518773a7d';
const files = fs.readdirSync(ARTIFACT_DIR);
// Find the genuinely cropped v3 banners to resize
const targetFiles = files.filter(f => f.startsWith('banner_') && f.includes('_v3_') && f.endsWith('.png'));

// We want a very wide portrait ratio, e.g. 1200 x 310 (4:1ish)
const TARGET_WIDTH = 1200;
const TARGET_HEIGHT = 330;

async function processCrop() {
    console.log(`Found ${targetFiles.length} base banners to strictly resize to wide format.`);

    for (const file of targetFiles) {
        const sourcePath = path.join(ARTIFACT_DIR, file);
        const destName = file.replace(/_v[1-6]_/, '_v7_');
        const destPath = path.join(ARTIFACT_DIR, destName);

        try {
            console.log(`Processing: ${file}...`);
            // Force resizing to a thin, wide rectangle. 
            // position: 'attention' tries to keep the most "interesting" part of the image in the crop frame.
            await sharp(sourcePath)
                .resize({
                    width: TARGET_WIDTH,
                    height: TARGET_HEIGHT,
                    fit: sharp.fit.cover,
                    position: sharp.strategy.attention
                })
                .toFile(destPath);
            console.log(` -> Resized and saved as: ${destName}`);
        } catch (err) {
            console.error(`Failed to resize ${file}:`, err);
        }
    }
}

processCrop();
