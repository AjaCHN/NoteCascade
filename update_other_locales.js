const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'app', 'lib', 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.ts') && f !== 'en.ts' && f !== 'zh-CN.ts' && f !== 'zh-TW.ts');

const translations = {
  'es.ts': {
    style_classic: 'Clásico',
    style_custom: 'Personalizado',
    song_twinkle: 'Estrellita Dónde Estás',
    song_ode: 'Himno a la Alegría',
    song_elise: 'Para Elisa',
    song_canon: 'Canon en Re',
    artist_traditional: 'Tradicional',
    artist_beethoven: 'Beethoven',
    artist_pachelbel: 'Pachelbel',
    score: 'Puntuación',
  },
  'ar.ts': {
    style_classic: 'كلاسيكي',
    style_custom: 'مخصص',
    song_twinkle: 'وميض وميض أيتها النجمة الصغيرة',
    song_ode: 'قصيدة الفرح',
    song_elise: 'من أجل إليس',
    song_canon: 'كانون في دي',
    artist_traditional: 'تقليدي',
    artist_beethoven: 'بيتهوفن',
    artist_pachelbel: 'باتشيلبيل',
    score: 'النتيجة',
  },
  'fr.ts': {
    style_classic: 'Classique',
    style_custom: 'Personnalisé',
    song_twinkle: 'Ah! vous dirai-je, maman',
    song_ode: 'Ode à la joie',
    song_elise: 'Lettre à Élise',
    song_canon: 'Canon en ré',
    artist_traditional: 'Traditionnel',
    artist_beethoven: 'Beethoven',
    artist_pachelbel: 'Pachelbel',
    score: 'Score',
  },
  'pt-BR.ts': {
    style_classic: 'Clássico',
    style_custom: 'Personalizado',
    song_twinkle: 'Brilha Brilha Estrelinha',
    song_ode: 'Ode à Alegria',
    song_elise: 'Para Elisa',
    song_canon: 'Cânone em Ré',
    artist_traditional: 'Tradicional',
    artist_beethoven: 'Beethoven',
    artist_pachelbel: 'Pachelbel',
    score: 'Pontuação',
  },
  'de.ts': {
    style_classic: 'Klassisch',
    style_custom: 'Benutzerdefiniert',
    song_twinkle: 'Morgen kommt der Weihnachtsmann',
    song_ode: 'Ode an die Freude',
    song_elise: 'Für Elise',
    song_canon: 'Kanon in D',
    artist_traditional: 'Traditionell',
    artist_beethoven: 'Beethoven',
    artist_pachelbel: 'Pachelbel',
    score: 'Ergebnis',
  },
  'ja.ts': {
    style_classic: 'クラシック',
    style_custom: 'カスタム',
    song_twinkle: 'きらきら星',
    song_ode: '歓喜の歌',
    song_elise: 'エリーゼのために',
    song_canon: 'カノン',
    artist_traditional: '伝統的',
    artist_beethoven: 'ベートーヴェン',
    artist_pachelbel: 'パッヘルベル',
    score: 'スコア',
  },
  'ko.ts': {
    style_classic: '클래식',
    style_custom: '커스텀',
    song_twinkle: '반짝반짝 작은 별',
    song_ode: '환희의 송가',
    song_elise: '엘리제를 위하여',
    song_canon: '캐논 변주곡',
    artist_traditional: '전통적인',
    artist_beethoven: '베토벤',
    artist_pachelbel: '파헬벨',
    score: '점수',
  },
  'ru.ts': {
    style_classic: 'Классика',
    style_custom: 'Пользовательский',
    song_twinkle: 'Мерцай, мерцай, маленькая звездочка',
    song_ode: 'Ода к радости',
    song_elise: 'К Элизе',
    song_canon: 'Канон в ре мажор',
    artist_traditional: 'Традиционный',
    artist_beethoven: 'Бетховен',
    artist_pachelbel: 'Пахельбель',
    score: 'Счет',
  }
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
