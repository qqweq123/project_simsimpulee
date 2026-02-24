import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

// ─── ADMIN Configuration (Bypasses RLS) ───
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'test_image';
const STORAGE_PATH = 'island_test/banners'; // sub-folder for hot issue banners

if (!SUPABASE_SERVICE_KEY) {
    console.error("FATAL: VITE_SUPABASE_SERVICE_ROLE_KEY not found in .env");
    process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const ARTIFACT_DIR = 'C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\17bc1cc5-0c12-4082-91f2-400518773a7d';

// Need to find the exact filenames of the generated images based on the prefix.
const files = fs.readdirSync(ARTIFACT_DIR);
const hormoneFile = files.find(f => f.startsWith('banner_hormone_v7') && f.endsWith('.png'));
const dessertFile = files.find(f => f.startsWith('banner_dessert_v7') && f.endsWith('.png'));
const demonFile = files.find(f => f.startsWith('banner_demon_v7') && f.endsWith('.png'));
const loveFile = files.find(f => f.startsWith('banner_love_v7') && f.endsWith('.png'));

const ASSETS = [
    { source: path.join(ARTIFACT_DIR, hormoneFile), targetName: 'banner_hormone_v7.webp' },
    { source: path.join(ARTIFACT_DIR, dessertFile), targetName: 'banner_dessert_v7.webp' },
    { source: path.join(ARTIFACT_DIR, demonFile), targetName: 'banner_demon_v7.webp' },
    { source: path.join(ARTIFACT_DIR, loveFile), targetName: 'banner_love_v7.webp' }
];

async function processBanners() {
    console.log('--- Processing Banners (PNG -> WebP -> Supabase) ---');
    let ok = 0, fail = 0;

    for (const asset of ASSETS) {
        if (!asset.source || !fs.existsSync(asset.source)) {
            console.error(`Not found: ${asset.source}`);
            fail++;
            continue;
        }

        try {
            console.log(`Converting ${path.basename(asset.source)} to WebP...`);
            const webpBuffer = await sharp(asset.source)
                .webp({ quality: 85, effort: 6 })
                .toBuffer();

            const storagePath = `${STORAGE_PATH}/${asset.targetName}`;

            const { error } = await supabaseAdmin.storage
                .from(BUCKET)
                .upload(storagePath, webpBuffer, {
                    contentType: 'image/webp',
                    cacheControl: '31536000',
                    upsert: true
                });

            if (error) {
                console.error(`Upload failed for ${asset.targetName}: ${error.message}`);
                fail++;
            } else {
                console.log(`[OK] Uploaded ${asset.targetName}`);
                ok++;
            }
        } catch (e) {
            console.error(`Error processing ${asset.targetName}: ${e.message}`);
            fail++;
        }
    }
    console.log(`Finished. Success: ${ok}, Fail: ${fail}`);
}

processBanners();
