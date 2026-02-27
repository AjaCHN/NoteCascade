const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'app', 'lib', 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.ts') && f !== 'en.ts' && f !== 'zh-CN.ts' && f !== 'zh-TW.ts');

const translations = {
  'es.ts': { artist_unknown: 'Desconocido' },
  'ar.ts': { artist_unknown: 'مجهول' },
  'fr.ts': { artist_unknown: 'Inconnu' },
  'pt-BR.ts': { artist_unknown: 'Desconhecido' },
  'de.ts': { artist_unknown: 'Unbekannt' },
  'ja.ts': { artist_unknown: '不明' },
  'ko.ts': { artist_unknown: '알 수 없음' },
  'ru.ts': { artist_unknown: 'Неизвестно' }
};

for (const file of files) {
  const filePath = path.join(localesDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  const trans = translations[file];
  if (trans) {
    let newKeys = '';
    for (const [key, value] of Object.entries(trans)) {
      if (!content.includes(`${key}:`)) {
        newKeys += `    ${key}: '${value.replace(/'/g, "\\'")}',\n`;
      }
    }
    
    if (newKeys) {
      content = content.replace(/};\s*$/, `${newKeys}};\n`);
      fs.writeFileSync(filePath, content);
      console.log(`Updated ${file}`);
    }
  }
}
