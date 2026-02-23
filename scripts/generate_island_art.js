/**
 * Mallow Wave - Island Test Concept Art Generator (v3 - Final)
 * Model: imagen-4.0-fast-generate-001 (Animation Styles)
 * 
 * Usage: node scripts/generate_island_art.js
 * Requires: GOOGLE_API_KEY environment variable
 */

import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'assets', 'images', 'island');

// API Key Validation
const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
    console.error('❌ GOOGLE_API_KEY environment variable is missing.');
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// ───────────────────────────────────────────
// Chief Designer's Direction (v3)
// "90s Retro, Flat Motion, and Comic Manga"
// ───────────────────────────────────────────

const concepts = [
    {
        name: 'island_concept_v3_retro_cel',
        prompt: `A 90s retro anime screenshot style illustration. Lo-fi aesthetic with film grain and slightly blurred edges. A pathetic but cute blob character crying on a tiny tropical island. Vapourwave color palette: soft pinks, mint greens, and cyan. The character looks insignificant and melodramatic. Fake subtitles at the bottom. Aesthetic of old Sailor Moon backgrounds but with a silly character. High emotional vibe.`,
    },
    {
        name: 'island_concept_v3_flat_motion',
        prompt: `A trendy modern flat vector art illustration. 'Corporate Memphis' or 'Big Tech' art style but ironic. A character with exaggerated long rubbery limbs and a tiny head, sitting slumped on a perfect yellow circle island. Very clean geometry, solid colors, no outlines. The character looks physically exhausted and melting. Minimalist, abstract, and humorous. Bright pastel colors: Cobalt Blue, Lemon Yellow, Coral.`,
    },
    {
        name: 'island_concept_v3_manga',
        prompt: `A black and white Japanese manga panel. Traditional screentone textures (halftone dots). A simple, hastily drawn cute character on a desert island looking shocked. Dramatic speed lines (focus lines) converging on the character. 'Gag manga' aesthetic like Pop Team Epic or One Punch Man doodles. High contrast black ink on white paper. The character looks hilariously insignificant amidst the dramatic effect.`,
    },
];

async function generateImages() {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    console.log('🎨 Mallow Wave Art Gen v3 (Animation Styles)...');

    for (const concept of concepts) {
        console.log(`⏳ Generating: ${concept.name}...`);
        try {
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-fast-generate-001',
                prompt: concept.prompt,
                config: {
                    numberOfImages: 1,
                    aspectRatio: '1:1',
                },
            });

            if (response.generatedImages?.[0]) {
                const filePath = path.join(OUTPUT_DIR, `${concept.name}.png`);
                fs.writeFileSync(filePath, Buffer.from(response.generatedImages[0].image.imageBytes, 'base64'));
                console.log(`   ✅ Saved: ${filePath}`);
            }
        } catch (error) {
            console.error(`   ❌ Failed: ${error.message}`);
        }
    }
}

generateImages().catch(console.error);
