# Island Test Migration Notes

## Current goal
- The active Task list (Island Test Design Renewal Checklist) and Implementation Plan Revision 8 both drive a Supabase migration for the island experience so that all hero imagery lives in the island-test public bucket and data.js plus island.css switch to CDN URLs.

## Observed code tracker state
- Snapshot C:\Users\Administrator\.gemini\antigravity\code_tracker\active\mind_test_259f2761da8ba3521bf7a9d1c0176191fe5d75b3 still carries hashed copies of the front-end artifacts, island.css, and data.js that mirror the workspace.
- Both the tracked 8eb9ac9bb0df7ef4569d14ade44038f0_island.css and the live src/assets/styles/themes/island.css only reference /images/island/...; no Supabase CDN path is injected yet.
- The tracked 175a7c824e6fe6e03c736c73919e6d9a_data.js and the workspace src/features/tests/island/data.js still embed character/background image URLs such as /images/island/island_char_leader_v5_bg_matching_1771559589335.png.
- public/images/island still hosts the PNG/WebP files that the implementation plan wants pushed to Supabase once credentials land (the .env currently has empty VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY).

## Deduced next development step
- Fulfill Plan Step 1 by scripting or running an upload (see the referenced upload_island_assets.js idea) to place leader.png, explorer.png, survivor.png, diplomat.png, and bg_sand.webp into https://hykzfvrmnnykvinhtucc.supabase.co/storage/v1/object/public/island-test/ once we have the keys.
- Implement Plan Step 2 by defining const ISLAND_BASE_URL = https://hykzfvrmnnykvinhtucc.supabase.co/storage/v1/object/public/island-test/ in src/features/tests/island/data.js and rewriting every image/background reference (the five characters plus the sand texture) to ${ISLAND_BASE_URL}-prefixed file names.
- Update src/assets/styles/themes/island.css so the CDN texture (and any other url(/images/island/...) occurrences) references the new host instead of a local file, keeping the glassmorphism background working with the WebP tile.
- After rewriting URLs and uploading assets, run npm run preview/npm run build to ensure the bundle resolves the CDN host and the Supabase deployment renders the refreshed background.
- Record the Supabase URL/key in .env safely before the upload; the empty values there are the blocker for Step 1.

