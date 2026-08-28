const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const targetDirs = ['app', 'components', 'lib'];

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // Replace amber with blue
  content = content.replace(/amber/g, 'blue');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${path.relative(rootDir, filePath)}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        walkDir(fullPath);
      }
    } else if (/\.(tsx|ts|jsx|js|css)$/.test(file)) {
      replaceInFile(fullPath);
    }
  }
}

for (const dir of targetDirs) {
  const fullDir = path.join(rootDir, dir);
  if (fs.existsSync(fullDir)) {
    walkDir(fullDir);
  }
}
console.log('Finished updating colors to blue.');
