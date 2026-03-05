// app/lib/translations.ts v2.1.1
import { en } from '../locales/en';
import { zhCN } from '../locales/zh-CN';
import { zhTW } from '../locales/zh-TW';

export type Locale = 'en' | 'zh-CN' | 'zh-TW';

export const languageNames: Record<Locale, string> = {
  en: 'English',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
};

export type Translation = {
  ui: Record<string, string>;
  common: Record<string, string>;
  achievements: Record<string, string>;
  songs: Record<string, string>;
  artists: Record<string, string>;
  settings: Record<string, string>;
  game: Record<string, string>;
};

export const translations: Record<Locale, Translation> = {
  en: en as unknown as Translation,
  'zh-CN': zhCN as unknown as Translation,
  'zh-TW': zhTW as unknown as Translation,
};
