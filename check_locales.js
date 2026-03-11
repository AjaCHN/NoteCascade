const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'app/lib/locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.ts'));

const keysMap = {};

files.forEach(file => {
  const content = fs.readFileSync(path.join(localesDir, file), 'utf-8');
  // Extract keys using a simple regex
  const keys = [];
  const regex = /^\s+([a-zA-Z0-9_]+)\s*:/gm;
  let match;
  while ((match = regex.exec(content)) !== null) {
    keys.push(match[1]);
  }
  keysMap[file] = new Set(keys);
});

const enKeys = keysMap['en.ts'];
if (!enKeys) {
  console.log('en.ts not found');
  process.exit(1);
}

let hasMissing = false;
files.forEach(file => {
  if (file === 'en.ts') return;
  const fileKeys = keysMap[file];
  const missing = [];
  enKeys.forEach(key => {
    if (!fileKeys.has(key)) {
      missing.push(key);
    }
  });
  if (missing.length > 0) {
    console.log(`${file} is missing keys: ${missing.join(', ')}`);
    hasMissing = true;
  }
});

if (!hasMissing) {
  console.log('All files have all keys.');
}
