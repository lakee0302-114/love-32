import fs from 'fs';
import path from 'path';

const REPO = 'lakee0302-114/love-32';
const APK_PATH = 'C:/Users/lhnet/.gemini/antigravity/scratch/love8-ultra/Love32-Ultra.apk';

async function check() {
  const res = await fetch(`https://api.github.com/repos/${REPO}/actions/runs?per_page=1`, {
    headers: { 'User-Agent': 'Node' }
  });
  if (!res.ok) {
    console.error('Failed to query GitHub API:', res.status, res.statusText);
    return;
  }
  const data = await res.json();
  const run = data.workflow_runs?.[0];
  if (!run) {
    console.log('No runs found.');
    return;
  }
  console.log(`Run ID: ${run.id}, Status: ${run.status}, Conclusion: ${run.conclusion}, URL: ${run.html_url}`);
  return run;
}

check();
