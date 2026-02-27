import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\17bc1cc5-0c12-4082-91f2-400518773a7d';
const ARCHIVE_DIR = 'C:\\projects\\mind_test\\docs\\archive\\test-image\\island-test\\hero_archive';

console.log('Archiving visualization assets...');

const files = fs.readdirSync(ARTIFACT_DIR);
files.forEach(file => {
    if (file.includes('island_hero_matched') || file.includes('funky_hero_') || file.includes('island_hero_campfire') || file.includes('hero_campfire') || file.includes('island_thumb')) {
        const src = path.join(ARTIFACT_DIR, file);
        const dest = path.join(ARCHIVE_DIR, file);
        fs.copyFileSync(src, dest);
        console.log(`Archived: ${file}`);
    }
});
console.log('Archive complete.');
