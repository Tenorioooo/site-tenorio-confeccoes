const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', '..', 'LOGO');
const targetDir = path.join(__dirname, '..', 'public', 'logo');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

if (fs.existsSync(sourceDir)) {
  const files = fs.readdirSync(sourceDir);
  for (const file of files) {
    if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.svg')) {
      const src = path.join(sourceDir, file);
      const dest = path.join(targetDir, file);
      fs.copyFileSync(src, dest);
      console.log(`Copied ${file} -> ${dest}`);
    }
  }
}
