/**
 * Mallow Wave - Island Test Asset Generator
 * Style: Flat Motion (Trendy Insignificant)
 * Model: imagen-4.0-fast-generate-001
 */

import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'assets', 'images', 'island');

const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
    console.error('❌ GOOGLE_API_KEY environment variable is missing.');
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// ───────────────────────────────────────────
// Chief Designer's Direction (Flat Motion)
// "Corporate Memphis" style but ironic/exhausted.
// Rubbery limbs, tiny heads, clean vectors.
// Palette: Cobalt Blue, Lemon Yellow, Coral Pink, Cream.
// ───────────────────────────────────────────

const assets = [
    {
        name: 'result_leader',
        prompt: `A trendy flat vector illustration of a 'Leader' character on a desert island. The character is a blue blob with long rubbery arms, wearing a tiny captain's hat. He is holding a megaphone but looks exhausted and melting like a Dali clock. He is slumped over a rock. Corporate Memphis art style but ironic. Clean solid colors (Cobalt Blue, Yellow, Coral). Minimalist and funny. White background.`,
    },
    {
        name: 'result_explorer',
        prompt: `A trendy flat vector illustration of an 'Explorer' character on a desert island. The character is green with noodle limbs, being comedically crushed under a giant rolled-up map and a huge telescope. Only legs are sticking out playfully. Corporate Memphis art style. Clean geometry, no outlines. Funny and insignificant. White background.`,
    },
    {
        name: 'result_survivor',
        prompt: `A trendy flat vector illustration of a 'Survivor' character on a desert island. The character is an orange shape holding a crude stone axe. His arm is shaking (vibration lines). He looks overwhelmed by a tiny coconut. Corporate Memphis art style but ironic. Exaggerated proportions. Clean flat colors. White background.`,
    },
    {
        name: 'result_diplomat',
        prompt: `A trendy flat vector illustration of a 'Diplomat' character on a desert island. The character is pink with long winding arms, trying to shake hands with a seagull, but the seagull is looking away indifferently. The character looks awkward and sweaty. Corporate Memphis art style. Clean solid colors. Minimalist and funny. White background.`,
    },
    {
        name: 'bg_island_texture',
        prompt: `A seamless background pattern for a website. Minimalist tropical island theme. Very faint, subtle doodles of palm leaves, waves, and dots. Pastel yellow and warm cream tones (#FFFDF5). Flat vector style. High quality wallpaper texture. Low contrast, suitable for text overlay.`,
    },
];

async function generateAssets() {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    console.log('🎨 Mallow Wave - Generating Island Assets (Flat Motion)...');

    for (const asset of assets) {
        console.log(`⏳ Generating: ${asset.name}...`);
        try {
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-fast-generate-001',
                prompt: asset.prompt,
                config: {
                    numberOfImages: 1,
                    aspectRatio: asset.name.startsWith('bg') ? '16:9' : '1:1',
                },
            });

            if (response.generatedImages?.[0]) {
                const filePath = path.join(OUTPUT_DIR, `${asset.name}.png`);
                fs.writeFileSync(filePath, Buffer.from(response.generatedImages[0].image.imageBytes, 'base64'));
                console.log(`   ✅ Saved: ${filePath}`);
            }
        } catch (error) {
            console.error(`   ❌ Failed: ${asset.name} - ${error.message}`);
        }
    }
}

generateAssets().catch(console.error);
