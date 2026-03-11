const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'app/lib/locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.ts'));

// Read en.ts properly
const enContent = fs.readFileSync(path.join(localesDir, 'en.ts'), 'utf-8');
const enKeys = {};
const lines = enContent.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const match = line.match(/^\s+([a-zA-Z0-9_]+)\s*:\s*(.*)$/);
  if (match) {
    let val = match[2];
    if (val.endsWith(',')) {
      val = val.slice(0, -1);
    }
    enKeys[match[1]] = val;
  }
}

files.forEach(file => {
  if (file === 'en.ts' || file === 'zh-CN.ts') return;
  
  let content = fs.readFileSync(path.join(localesDir, file), 'utf-8');
  
  // Remove the bad lines that were added
  // The bad lines were added at the end before the last }
  // Let's just regenerate the file by reading the original keys from the file,
  // and then appending the missing ones.
  // Actually, the file is currently broken. Let's fix the broken lines.
  
  // Find lines that end with an unclosed quote, e.g. `mappingTip: '... Click ",`
  // and replace them with the correct value from enKeys.
  
  let fileLines = content.split('\n');
  let newLines = [];
  for (let i = 0; i < fileLines.length; i++) {
    let line = fileLines[i];
    const match = line.match(/^\s+([a-zA-Z0-9_]+)\s*:/);
    if (match) {
      const key = match[1];
      if (enKeys[key]) {
        // Replace the whole line with the correct one from enKeys
        newLines.push(`    ${key}: ${enKeys[key]},`);
      } else {
        newLines.push(line);
      }
    } else {
      newLines.push(line);
    }
  }
  
  fs.writeFileSync(path.join(localesDir, file), newLines.join('\n'), 'utf-8');
  console.log(`Fixed ${file}`);
});
