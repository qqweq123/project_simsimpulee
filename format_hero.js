import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ARTIFACT_DIR = 'C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\17bc1cc5-0c12-4082-91f2-400518773a7d';
// Search for the hero banner we just generated
const files = fs.readdirSync(ARTIFACT_DIR);
const targetFile = files.find(f => f.startsWith('hero_banner_island_v1') && f.endsWith('.png'));

if (!targetFile) {
    console.error("Hero banner not found in artifacts directory.");
    process.exit(1);
}

const sourcePath = path.join(ARTIFACT_DIR, targetFile);
const destName = 'hero_banner_v1.webp';
const destPath = path.join(ARTIFACT_DIR, destName);

async function formatHero() {
    try {
        console.log(`Processing: ${targetFile}...`);
        await sharp(sourcePath)
            .resize({
                width: 1200,
                height: 330,
                fit: sharp.fit.cover,
                position: sharp.strategy.attention
            })
            .webp({ quality: 85 })
            .toFile(destPath);
        console.log(` -> Resized, converted to WebP, and saved as: ${destName}`);
    } catch (err) {
        console.error(`Failed to format ${targetFile}:`, err);
    }
}

formatHero();
