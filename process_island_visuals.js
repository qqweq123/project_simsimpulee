import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'test_image';

if (!SUPABASE_SERVICE_KEY) {
    console.error("FATAL: VITE_SUPABASE_SERVICE_ROLE_KEY not found in .env");
    process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const ARTIFACT_DIR = 'C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\17bc1cc5-0c12-4082-91f2-400518773a7d';

async function processAndUpload() {
    console.log('--- Processing New Island Visuals ---');
    const files = fs.readdirSync(ARTIFACT_DIR);

    // Find latest campfire hero
    const heroFile = files.filter(f => f.startsWith('island_hero_campfire_') && f.endsWith('.png')).sort().pop();
    // Find latest thumb
    const thumbFile = files.filter(f => f.startsWith('island_thumb_') && f.endsWith('.png')).sort().pop();

    if (!heroFile || !thumbFile) {
        console.error("Missing generated images.", { heroFile, thumbFile });
        process.exit(1);
    }

    try {
        console.log(`Processing Hero: ${heroFile}`);
        const heroBuffer = await sharp(path.join(ARTIFACT_DIR, heroFile))
            .resize(1200, 330, { fit: 'cover', position: 'center' })
            .webp({ quality: 85, effort: 6 })
            .toBuffer();

        console.log(`Processing Thumb: ${thumbFile}`);
        const thumbBuffer = await sharp(path.join(ARTIFACT_DIR, thumbFile))
            .resize(600, 600, { fit: 'cover', position: 'center' })
            .webp({ quality: 85, effort: 6 })
            .toBuffer();

        // Upload Hero
        let { error: err1 } = await supabaseAdmin.storage
            .from(BUCKET)
            .upload('island_test/banners/hero_campfire.webp', heroBuffer, {
                contentType: 'image/webp', cacheControl: '31536000', upsert: true
            });
        if (err1) throw err1;
        console.log('[OK] Hero uploaded to /island_test/banners/hero_campfire.webp');

        // Upload Thumb
        let { error: err2 } = await supabaseAdmin.storage
            .from(BUCKET)
            .upload('island_test/thumbnails/island_thumb.webp', thumbBuffer, {
                contentType: 'image/webp', cacheControl: '31536000', upsert: true
            });
        if (err2) throw err2;
        console.log('[OK] Thumb uploaded to /island_test/thumbnails/island_thumb.webp');

    } catch (e) {
        console.error("Error:", e);
    }
}

processAndUpload();
