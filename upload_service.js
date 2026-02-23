/**
 * ============================================================
 *  Mellow Wave — Island Test Asset ETL Pipeline (Admin Mode)
 *  데이터 아키텍처 디렉터 (@dataarchitecturedirector)
 * ============================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── ADMIN Configuration (Bypasses RLS) ───
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'test_image';
const STORAGE_PATH = 'island_test';

if (!SUPABASE_SERVICE_KEY) {
    console.error("FATAL: VITE_SUPABASE_SERVICE_ROLE_KEY not found in .env");
    process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// ─── Asset Manifest ───
const ASSETS = [
    { source: path.join(__dirname, 'public/images/island/leader.webp'), targetName: 'leader.webp', contentType: 'image/webp' },
    { source: path.join(__dirname, 'public/images/island/explorer.webp'), targetName: 'explorer.webp', contentType: 'image/webp' },
    { source: path.join(__dirname, 'public/images/island/survivor.webp'), targetName: 'survivor.webp', contentType: 'image/webp' },
    { source: path.join(__dirname, 'public/images/island/diplomat.webp'), targetName: 'diplomat.webp', contentType: 'image/webp' },
    { source: path.join(__dirname, 'public/images/island/bg_sand.webp'), targetName: 'bg_sand.webp', contentType: 'image/webp' }
];

async function runPipeline() {
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║  Admin ETL Pipeline (RLS Bypass)                 ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    let successCount = 0;
    let failCount = 0;

    for (const asset of ASSETS) {
        const storagePath = `${STORAGE_PATH}/${asset.targetName}`;

        try {
            if (!fs.existsSync(asset.source)) {
                console.error(`  ✗ [EXTRACT FAIL] Not found: ${asset.source}`);
                failCount++;
                continue;
            }

            const uploadBuffer = fs.readFileSync(asset.source);

            const { data, error } = await supabaseAdmin.storage
                .from(BUCKET)
                .upload(storagePath, uploadBuffer, {
                    contentType: asset.contentType,
                    cacheControl: '31536000',
                    upsert: true
                });

            if (error) {
                console.error(`  ✗ [LOAD FAIL] ${storagePath}: ${error.message}`);
                failCount++;
            } else {
                console.log(`  ✓ [LOAD OK] ${asset.targetName} uploaded successfully via Admin Key.`);
                successCount++;
            }
        } catch (err) {
            console.error(`  ✗ [ERROR] ${asset.targetName}: ${err.message}`);
            failCount++;
        }
    }

    console.log(`\n  Success: ${successCount} | Fail: ${failCount}\n`);
    fs.unlinkSync('./upload_service.js');
}

runPipeline();
