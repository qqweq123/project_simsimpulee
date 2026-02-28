import urllib.request
from PIL import Image, ImageDraw
import io

# 1. Download the raw sand texture
url = "https://hykzfvrmnnykvinhtucc.supabase.co/storage/v1/object/public/test_image/island_test/bg_sand.webp"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as response:
    img_data = response.read()

# 2. Open image with Pillow
base_img = Image.open(io.BytesIO(img_data)).convert("RGBA")
width, height = base_img.size

# 3. Create Gradient Overlay (rgba(236, 253, 245, 0.45) to rgba(255, 255, 255, 0.5))
# RGB for #ecfdf5 is (236, 253, 245). Alpha 0.45 ~ 115
# RGB for white is (255, 255, 255). Alpha 0.5 ~ 128
overlay = Image.new('RGBA', (width, height), (0,0,0,0))
draw = ImageDraw.Draw(overlay)

for y in range(height):
    ratio = y / height
    r = int(236 + (255 - 236) * ratio)
    g = int(253 + (255 - 253) * ratio)
    b = int(245 + (255 - 245) * ratio)
    a = int(115 + (128 - 115) * ratio)
    draw.line([(0, y), (width, y)], fill=(r, g, b, a))

# 4. Composite (Alpha blend)
baked_img = Image.alpha_composite(base_img, overlay)

# 5. Save as WebP
out_path = r"c:\projects\mind_test\src\assets\images\island\bg_island_baked.webp"
# Ensure directory exists (it should, but just in case)
import os
os.makedirs(os.path.dirname(out_path), exist_ok=True)
baked_img.save(out_path, format="WEBP", quality=85)

print(f"Successfully baked texture to: {out_path}")
