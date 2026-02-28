'use client';

import React from 'react';
import { Globe, Palette, Mic2, ChevronDown, Check } from 'lucide-react';
import { Locale, translations } from '../../lib/translations';
import { Theme, Instrument } from '../../lib/store';

interface GeneralSettingsProps {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  instrument: Instrument;
  setInstrument: (instrument: Instrument) => void;
  t: Record<string, string>;
}

export function GeneralSettings({
  locale,
  setLocale,
  theme,
  setTheme,
  instrument,
  setInstrument,
  t
}: GeneralSettingsProps) {
  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-4 w-4 text-indigo-400" />
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] theme-text-secondary">{t.language}</label>
        </div>
        <div className="relative group">
          <select 
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            className="w-full appearance-none theme-bg-secondary border theme-border rounded-2xl px-5 py-4 theme-text-primary font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
          >
            {(Object.keys(translations) as Locale[]).map((lang) => (
              <option key={lang} value={lang}>{lang.toUpperCase()}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 theme-text-secondary pointer-events-none group-hover:theme-text-primary transition-colors" />
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Palette className="h-4 w-4 text-indigo-400" />
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] theme-text-secondary">{t.theme}</label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(['dark', 'light', 'cyber', 'classic'] as Theme[]).map((tName) => (
            <button
              key={tName}
              onClick={() => setTheme(tName)}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all ${
                theme === tName 
                  ? 'border-indigo-500 bg-indigo-500/10 theme-text-primary shadow-lg shadow-indigo-500/10' 
                  : 'theme-border theme-bg-secondary theme-text-secondary hover:theme-border-primary'
              }`}
            >
              <span className="text-xs font-bold capitalize">{t[`theme_${tName}`] || tName}</span>
              {theme === tName && <Check className="h-4 w-4 text-indigo-400" />}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Mic2 className="h-4 w-4 text-indigo-400" />
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] theme-text-secondary">{t.instrument}</label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(['piano', 'synth', 'epiano', 'strings'] as Instrument[]).map((inst) => (
            <button
              key={inst}
              onClick={() => setInstrument(inst)}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all ${
                instrument === inst 
                  ? 'border-indigo-500 bg-indigo-500/10 theme-text-primary shadow-lg shadow-indigo-500/10' 
                  : 'theme-border theme-bg-secondary theme-text-secondary hover:theme-border-primary'
              }`}
            >
              <span className="text-xs font-bold capitalize">{t[`inst_${inst}`] || inst}</span>
              {instrument === inst && <Check className="h-4 w-4 text-indigo-400" />}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
