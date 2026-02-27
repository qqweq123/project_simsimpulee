import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// ─── ADMIN Configuration (Bypasses RLS) ───
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'test_image';
const STORAGE_PATH = 'island_test/banners/hero_banner_v1.webp';

if (!SUPABASE_SERVICE_KEY) {
    console.error("FATAL: VITE_SUPABASE_SERVICE_ROLE_KEY not found in .env");
    process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const ARTIFACT_DIR = 'C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\17bc1cc5-0c12-4082-91f2-400518773a7d';
const sourcePath = path.join(ARTIFACT_DIR, 'hero_banner_v1.webp');

async function processHero() {
    console.log('--- Processing Hero Banner (WebP -> Supabase) ---');

    if (!fs.existsSync(sourcePath)) {
        console.error(`Not found: ${sourcePath}`);
        return;
    }

    try {
        const fileBuffer = fs.readFileSync(sourcePath);

        const { error } = await supabaseAdmin.storage
            .from(BUCKET)
            .upload(STORAGE_PATH, fileBuffer, {
                contentType: 'image/webp',
                cacheControl: '31536000',
                upsert: true
            });

        if (error) {
            console.error(`Upload failed: ${error.message}`);
        } else {
            console.log(`[OK] Uploaded Hero Banner`);
        }
    } catch (e) {
        console.error(`Error processing: ${e.message}`);
    }
}

processHero();
