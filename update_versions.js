const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.next' && f !== '.git') {
        walkDir(dirPath, callback);
      }
    } else {
      callback(path.join(dir, f));
    }
  });
}

walkDir(__dirname, function(filePath) {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let lines = content.split('\n');
    if (lines.length > 0 && lines[0].startsWith('// ') && lines[0].includes(' v')) {
      lines[0] = lines[0].replace(/v[0-9]+\.[0-9]+\.[0-9]+/, 'v2.3.1');
      
      // Special case for AppHeader.tsx
      if (filePath.endsWith('AppHeader.tsx')) {
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('const version = "')) {
            lines[i] = lines[i].replace(/const version = "[0-9]+\.[0-9]+\.[0-9]+"/, 'const version = "2.3.1"');
          }
        }
      }
      
      fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
    }
  }
});

// Update package.json
const pkgPath = path.join(__dirname, 'package.json');
let pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
pkg.version = '2.3.1';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');

// Update metadata.json
const metaPath = path.join(__dirname, 'metadata.json');
let meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
meta.name = meta.name.replace(/v[0-9]+\.[0-9]+\.[0-9]+/, 'v2.3.1');
fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n', 'utf-8');

// Update CHANGELOG.md
const changelogPath = path.join(__dirname, 'CHANGELOG.md');
if (fs.existsSync(changelogPath)) {
  let changelog = fs.readFileSync(changelogPath, 'utf-8');
  if (!changelog.includes('## v2.3.1')) {
    changelog = changelog.replace('# Changelog\n', '# Changelog\n\n## v2.3.1\n- 增强：右上角菜单在鼠标移出 2 秒后自动关闭\n- 修复：国际化语言文件完整性检查及补全\n- 优化：更新 README 和 openspec 文档\n- 优化：提升应用鲁棒性\n');
    fs.writeFileSync(changelogPath, changelog, 'utf-8');
  }
}

// Update index.html if it exists
const indexPath = path.join(__dirname, 'index.html');
if (fs.existsSync(indexPath)) {
  let indexHtml = fs.readFileSync(indexPath, 'utf-8');
  indexHtml = indexHtml.replace(/<title>(.*?) v[0-9]+\.[0-9]+\.[0-9]+<\/title>/, '<title>$1 v2.3.1</title>');
  fs.writeFileSync(indexPath, indexHtml, 'utf-8');
}
