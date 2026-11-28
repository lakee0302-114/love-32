import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SRC_IMG = 'C:/Users/lhnet/.gemini/antigravity/brain/64c53ee3-27a8-4213-a0bf-41f13340b14b/love32_ultra_app_icon_1795888060039.jpg';
const PROJECT_DIR = 'C:/Users/lhnet/.gemini/antigravity/scratch/love8-ultra';
const RES_DIR = path.join(PROJECT_DIR, 'android/app/src/main/res');

async function run() {
  console.log('--- Generating Icons for Love32 Ultra ---');
  
  // 1. Analyze source image and corner background color
  const img = sharp(SRC_IMG);
  const meta = await img.metadata();
  console.log(`Source: ${meta.width}x${meta.height}, format: ${meta.format}`);

  // Sample pixel at (10, 10) for background hex
  const { data } = await sharp(SRC_IMG)
    .resize(100, 100)
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  const r = data[0], g = data[1], b = data[2];
  const bgHex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
  console.log(`Sampled icon background color: ${bgHex} (RGB: ${r}, ${g}, ${b})`);

  // We ensure the background color is a deep sleek obsidian/midnight color
  const resolvedBg = '#0B0D17';

  // 2. Base 1024x1024 high-res icon
  const base1024 = await sharp(SRC_IMG)
    .resize(1024, 1024, { fit: 'cover' })
    .png()
    .toBuffer();

  // 3. Web & PWA assets in public/
  const publicDir = path.join(PROJECT_DIR, 'public');
  await sharp(base1024).resize(512, 512).toFile(path.join(publicDir, 'app-icon.png'));
  await sharp(base1024).resize(512, 512).toFile(path.join(publicDir, 'icon-512.png'));
  await sharp(base1024).resize(192, 192).toFile(path.join(publicDir, 'icon-192.png'));
  await sharp(base1024).resize(180, 180).toFile(path.join(publicDir, 'apple-touch-icon.png'));
  await sharp(base1024).resize(64, 64).toFile(path.join(publicDir, 'favicon.png'));
  await sharp(base1024).resize(32, 32).toFile(path.join(publicDir, 'favicon-32x32.png'));
  console.log('✓ Updated web assets in public/');

  // 4. Android Mipmap densities
  const densities = [
    { name: 'mipmap-mdpi', iconSize: 48, fgSize: 108 },
    { name: 'mipmap-hdpi', iconSize: 72, fgSize: 162 },
    { name: 'mipmap-xhdpi', iconSize: 96, fgSize: 216 },
    { name: 'mipmap-xxhdpi', iconSize: 144, fgSize: 324 },
    { name: 'mipmap-xxxhdpi', iconSize: 192, fgSize: 432 },
  ];

  const createCircleMask = (size) => Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="#ffffff"/></svg>`
  );

  for (const d of densities) {
    const targetDir = path.join(RES_DIR, d.name);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // 1. Full standard icon (ic_launcher.png) - for legacy launchers
    await sharp(base1024)
      .resize(d.iconSize, d.iconSize)
      .png()
      .toFile(path.join(targetDir, 'ic_launcher.png'));

    // 2. Round icon (ic_launcher_round.png) - for legacy circular launchers
    await sharp(base1024)
      .resize(d.iconSize, d.iconSize)
      .composite([{
        input: createCircleMask(d.iconSize),
        blend: 'dest-in'
      }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_round.png'));

    // 3. Foreground layer (ic_launcher_foreground.png) for Adaptive Icons
    // Sized at 108dp (d.fgSize). The image is centered so the heart emblem is inside
    // the 72dp visible safe mask, against a solid resolvedBg background canvas.
    const scaledEmblemSize = Math.round(d.fgSize * 0.95);
    const scaledEmblem = await sharp(base1024)
      .resize(scaledEmblemSize, scaledEmblemSize, { fit: 'contain' })
      .toBuffer();

    await sharp({
      create: {
        width: d.fgSize,
        height: d.fgSize,
        channels: 4,
        background: { r: 11, g: 13, b: 23, alpha: 1 } // #0B0D17
      }
    })
    .composite([{
      input: scaledEmblem,
      gravity: 'center'
    }])
    .png()
    .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));

    console.log(`✓ Generated ${d.name}: ic_launcher.png (${d.iconSize}px), ic_launcher_round.png (${d.iconSize}px), ic_launcher_foreground.png (${d.fgSize}px)`);
  }

  // 5. Update Android XML resources
  // Update values/ic_launcher_background.xml
  const valuesBgXmlPath = path.join(RES_DIR, 'values/ic_launcher_background.xml');
  const bgXmlContent = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">${resolvedBg}</color>
</resources>
`;
  fs.writeFileSync(valuesBgXmlPath, bgXmlContent, 'utf8');
  console.log(`✓ Updated ${valuesBgXmlPath} with ${resolvedBg}`);

  // Update drawable/ic_launcher_background.xml to match solid background
  const drawableBgXmlPath = path.join(RES_DIR, 'drawable/ic_launcher_background.xml');
  const drawableBgContent = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="${resolvedBg}"
        android:pathData="M0,0h108v108h-108z" />
</vector>
`;
  fs.writeFileSync(drawableBgXmlPath, drawableBgContent, 'utf8');
  console.log(`✓ Updated ${drawableBgXmlPath}`);

  // Remove the old capacitor grid vector from drawable-v24 if present
  const oldFgXmlPath = path.join(RES_DIR, 'drawable-v24/ic_launcher_foreground.xml');
  if (fs.existsSync(oldFgXmlPath)) {
    fs.unlinkSync(oldFgXmlPath);
    console.log(`✓ Removed legacy capacitor vector ${oldFgXmlPath}`);
  }

  console.log('--- All Android and Web Icon Assets Successfully Updated! ---');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
