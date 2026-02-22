import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIR = path.join(__dirname, 'public/images/island');
const files = ['leader.png', 'explorer.png', 'survivor.png', 'diplomat.png', 'bg_sand.png'];

async function restore() {
    for (const file of files) {
        const sourcePath = path.join(DIR, file);
        const webpName = file.replace('.png', '.webp');
        const targetPath = path.join(DIR, webpName);

        if (fs.existsSync(sourcePath)) {
            await sharp(sourcePath)
                .webp({ quality: 85, effort: 6 })
                .toFile(targetPath);
            console.log(`Restored ${webpName}`);
            fs.unlinkSync(sourcePath); // Clean up PNG
        }
    }
}

restore();
