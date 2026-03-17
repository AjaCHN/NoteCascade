'use client';

import { useEffect } from 'react';
import { useAppStore } from '../lib/store';
import { Locale } from '../lib/translations';

export function LanguageDetector() {
  const { locale, localeSetByUser, actions } = useAppStore();

  useEffect(() => {
    if (localeSetByUser) return;

    const browserLang = navigator.language;
    let detectedLocale: Locale = 'en';

    if (browserLang.startsWith('zh-CN')) {
      detectedLocale = 'zh-CN';
    } else if (browserLang.startsWith('zh-TW') || browserLang.startsWith('zh-HK')) {
      detectedLocale = 'zh-TW';
    } else if (browserLang.startsWith('es')) {
      detectedLocale = 'es';
    } else if (browserLang.startsWith('ar')) {
      detectedLocale = 'ar';
    } else if (browserLang.startsWith('fr')) {
      detectedLocale = 'fr';
    } else if (browserLang.startsWith('pt')) {
      detectedLocale = 'pt-BR';
    } else if (browserLang.startsWith('de')) {
      detectedLocale = 'de';
    } else if (browserLang.startsWith('ja')) {
      detectedLocale = 'ja';
    } else if (browserLang.startsWith('ko')) {
      detectedLocale = 'ko';
    } else if (browserLang.startsWith('ru')) {
      detectedLocale = 'ru';
    }

    if (detectedLocale !== locale) {
      actions.setLocale(detectedLocale, false);
    }
  }, [locale, localeSetByUser, actions]);

  return null;
}
