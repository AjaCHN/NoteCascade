/**
 * @file lib/i18n.ts
 * @version v1.2.0
 */
import { en } from './locales/en';
import { zhCN } from './locales/zh-CN';
import { zhTW } from './locales/zh-TW';
import { es } from './locales/es';
import { ar } from './locales/ar';
import { fr } from './locales/fr';
import { ptBR } from './locales/pt-BR';
import { de } from './locales/de';
import { ja } from './locales/ja';
import { ko } from './locales/ko';
import { ru } from './locales/ru';

export type Locale = 'en' | 'zh-CN' | 'zh-TW' | 'es' | 'ar' | 'fr' | 'pt-BR' | 'de' | 'ja' | 'ko' | 'ru';

export const translations: Record<Locale, Record<string, string>> = {
  en,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  es,
  ar,
  fr,
  'pt-BR': ptBR,
  de,
  ja,
  ko,
  ru,
};
