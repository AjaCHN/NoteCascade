// app/lib/translations.ts v2.4.1
import { en } from "../locales/en";
import { zhCN } from "../locales/zh-CN";

export type Locale = "en" | "zh-CN";
export type Translation = typeof en;

export const translations = {
  en,
  "zh-CN": zhCN,
};

export const languageNames = {
  en: "English",
  "zh-CN": "简体中文",
};

export const useTranslation = (locale: Locale = "en") => {
  const t = translations[locale] || translations.en;
  return { t };
};
