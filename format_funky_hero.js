import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ARTIFACT_DIR = 'C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\17bc1cc5-0c12-4082-91f2-400518773a7d';

const files = fs.readdirSync(ARTIFACT_DIR);
// Find the new matched hero image
const targetFile = files.find(f => f.startsWith('island_hero_matched_') && f.endsWith('.png'));

if (!targetFile) {
    console.error("No matched hero image found.");
    process.exit(1);
}

const inputPath = path.join(ARTIFACT_DIR, targetFile);
const outputPath = path.join(ARTIFACT_DIR, 'funky_hero_v3.webp');

async function processHero() {
    try {
        console.log(`Processing matched hero: ${targetFile}`);
        await sharp(inputPath)
            .resize(1200, 330, {
                fit: 'cover',
                position: 'center' // Center crop because prompt guaranteed subject is in the middle
            })
            .webp({ quality: 85, effort: 6 })
            .toFile(outputPath);

        console.log(`Successfully formatted WebP v3: ${outputPath}`);
    } catch (e) {
        console.error(e);
    }
}

processHero();
