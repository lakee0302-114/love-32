import sharp from 'sharp';

async function createOg() {
  const icon = await sharp('C:/Users/lhnet/.gemini/antigravity/scratch/love8-ultra/public/app-icon.png')
    .resize(400, 400)
    .toBuffer();
  
  const svgText = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#0B0D17"/>
    <text x="600" y="490" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="bold" fill="#ffffff" text-anchor="middle">Love32 Ultra</text>
    <text x="600" y="540" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="#fda4af" text-anchor="middle">#1 Couple Intimacy &amp; Real-Time Sync</text>
  </svg>`);

  await sharp(svgText)
    .composite([{ input: icon, top: 40, left: 400 }])
    .png()
    .toFile('C:/Users/lhnet/.gemini/antigravity/scratch/love8-ultra/public/og-image.png');
  console.log('✓ og-image.png created');
}

createOg().catch(console.error);
