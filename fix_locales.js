const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'app/lib/locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.ts'));

// Read en.ts to get all keys and values
const enContent = fs.readFileSync(path.join(localesDir, 'en.ts'), 'utf-8');
const enRegex = /^\s+([a-zA-Z0-9_]+)\s*:\s*(['"`].*?['"`]),?/gm;
const enKeys = {};
let match;
while ((match = enRegex.exec(enContent)) !== null) {
  enKeys[match[1]] = match[2];
}

files.forEach(file => {
  if (file === 'en.ts' || file === 'zh-CN.ts') return; // Assuming zh-CN is complete or we'll check it later
  
  let content = fs.readFileSync(path.join(localesDir, file), 'utf-8');
  const fileKeys = new Set();
  const fileRegex = /^\s+([a-zA-Z0-9_]+)\s*:/gm;
  while ((match = fileRegex.exec(content)) !== null) {
    fileKeys.add(match[1]);
  }
  
  const missingKeys = [];
  for (const key in enKeys) {
    if (!fileKeys.has(key)) {
      missingKeys.push(`    ${key}: ${enKeys[key]},`);
    }
  }
  
  if (missingKeys.length > 0) {
    // Insert missing keys before the last closing brace
    const lastBraceIndex = content.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
      const newContent = content.slice(0, lastBraceIndex) + missingKeys.join('\n') + '\n' + content.slice(lastBraceIndex);
      fs.writeFileSync(path.join(localesDir, file), newContent, 'utf-8');
      console.log(`Updated ${file} with ${missingKeys.length} missing keys.`);
    }
  }
});
