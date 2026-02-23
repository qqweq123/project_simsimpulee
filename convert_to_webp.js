import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS = [
    { source: 'island_char_leader_v5_bg_matching_1771559589335.png', target: 'leader.webp' },
    { source: 'island_char_explorer_v5_bg_matching_1771559608476.png', target: 'explorer.webp' },
    { source: 'island_char_survivor_v5_bg_matching_1771559657365.png', target: 'survivor.webp' },
    { source: 'island_char_diplomat_v5_bg_matching_1771559638093.png', target: 'diplomat.webp' }
];

const DIR = path.join(__dirname, 'public/images/island');

async function transform() {
    console.log('--- Transform PNG to WebP ---');
    for (const asset of ASSETS) {
        const sourcePath = path.join(DIR, asset.source);
        const targetPath = path.join(DIR, asset.target);

        if (fs.existsSync(sourcePath)) {
            await sharp(sourcePath)
                .webp({ quality: 85, effort: 6 })
                .toFile(targetPath);
            console.log(`[OK] Created ${asset.target}`);
        } else {
            console.error(`[FAIL] Not found: ${asset.source}`);
        }
    }
}

transform();
