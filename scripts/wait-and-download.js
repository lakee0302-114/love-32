import fs from 'fs';
import path from 'path';

const REPO = 'lakee0302-114/love-32';
const RUN_ID = '46172829401';
const APK_DEST = 'C:/Users/lhnet/.gemini/antigravity/scratch/love8-ultra/Love32-Ultra.apk';

async function waitAndDownload() {
  console.log(`Monitoring GitHub Actions build run ${RUN_ID}...`);

  while (true) {
    try {
      const res = await fetch(`https://api.github.com/repos/${REPO}/actions/runs/${RUN_ID}`, {
        headers: { 'User-Agent': 'Node' }
      });
      if (!res.ok) {
        console.log(`Failed fetch: ${res.status}`);
        await new Promise(r => setTimeout(r, 10000));
        continue;
      }
      const run = await res.json();
      console.log(`[${new Date().toLocaleTimeString()}] Status: ${run.status}, Conclusion: ${run.conclusion}`);
      
      if (run.status === 'completed') {
        if (run.conclusion === 'success') {
          console.log('Build succeeded! Fetching release v1.0.7 asset...');
          
          // Wait 3 seconds for release asset to be ready
          await new Promise(r => setTimeout(r, 4000));
          
          const relRes = await fetch(`https://api.github.com/repos/${REPO}/releases/tags/v1.0.7`, {
            headers: { 'User-Agent': 'Node' }
          });
          const relData = await relRes.json();
          const asset = relData.assets?.find(a => a.name === 'Love32-Ultra.apk');
          
          if (!asset) {
            console.error('Could not find Love32-Ultra.apk in release assets:', relData.assets);
            process.exit(1);
          }

          console.log(`Downloading APK from ${asset.browser_download_url} (${(asset.size / (1024*1024)).toFixed(2)} MB)...`);
          const apkRes = await fetch(asset.browser_download_url);
          const buf = Buffer.from(await apkRes.arrayBuffer());
          fs.writeFileSync(APK_DEST, buf);
          console.log(`✓ Love32-Ultra.apk saved successfully! (${(buf.length / (1024*1024)).toFixed(2)} MB)`);
          return;
        } else {
          console.error(`Build failed with conclusion: ${run.conclusion}`);
          process.exit(1);
        }
      }
    } catch (e) {
      console.error('Error during monitoring:', e);
    }
    await new Promise(r => setTimeout(r, 10000));
  }
}

waitAndDownload();
