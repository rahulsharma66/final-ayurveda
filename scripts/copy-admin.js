const fs = require('fs');
const path = require('path');

const adminDist = path.join(__dirname, '..', 'dinkar-admin', 'dist');
const frontendDist = path.join(__dirname, '..', 'ayurveda-frontend', 'dist');
const target = path.join(frontendDist, 'admin');

if (!fs.existsSync(frontendDist)) {
  console.error('Frontend dist not found');
  process.exit(1);
}
if (!fs.existsSync(adminDist)) {
  console.error('Admin dist not found');
  process.exit(1);
}

fs.rmSync(target, { recursive: true, force: true });
fs.mkdirSync(target, { recursive: true });

// Copy recursively
function copyDir(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir(adminDist, target);
console.log('Admin copied to', target);
