// app/lib/translations.ts v2.4.2
import { en } from "../locales/en";
import { zhCN } from "../locales/zh-CN";
import { zhTW } from "../locales/zh-TW";

export type Locale = "en" | "zh-CN" | "zh-TW";
export type Translation = typeof en;

export const translations = {
  en,
  "zh-CN": zhCN,
  "zh-TW": zhTW as unknown as Translation,
};

export const languageNames = {
  en: "English",
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
};

export const useTranslation = (locale: Locale = "en") => {
  const t = translations[locale] || translations.en;
  return { t };
};
