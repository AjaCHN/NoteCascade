'use client';

import React from 'react';
import { Info, Github, User, Heart, ExternalLink } from 'lucide-react';
import pkg from '../../../package.json';

interface AppInfoSectionProps {
  t: Record<string, string>;
}

export function AppInfoSection({ t }: AppInfoSectionProps) {
  const { version } = pkg;

  return (
    <section className="mt-12 pt-12 border-t theme-border">
      <div className="flex items-center gap-2 mb-6">
        <Info className="h-4 w-4 text-indigo-400" />
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] theme-text-secondary">{t.appInfo}</label>
      </div>
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 rounded-2xl theme-bg-secondary border theme-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-xs">NC</div>
            <div>
              <div className="text-xs font-black theme-text-primary tracking-tight">Notecascade</div>
              <div className="text-[10px] theme-text-secondary font-bold">v{version}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {t.statusActive}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <a 
            href="https://github.com/sutchan" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-2xl theme-bg-secondary border theme-border hover:theme-border-primary transition-all group"
          >
            <Github className="h-5 w-5 theme-text-secondary group-hover:theme-text-primary transition-colors" />
            <div className="flex flex-col">
              <span className="text-xs font-bold theme-text-secondary group-hover:theme-text-primary transition-colors">GitHub</span>
              <span className="text-[8px] theme-text-secondary opacity-50 flex items-center gap-1">sutchan <ExternalLink className="h-2 w-2" /></span>
            </div>
          </a>
          <div className="flex items-center gap-3 p-4 rounded-2xl theme-bg-secondary border theme-border">
            <User className="h-5 w-5 theme-text-secondary" />
            <div className="flex flex-col">
              <span className="text-xs font-bold theme-text-secondary">Sut</span>
              <span className="text-[8px] theme-text-secondary opacity-50">Lead Developer</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 text-[10px] theme-text-secondary font-bold italic opacity-60">
          Made with <Heart className="h-3 w-3 text-rose-500 fill-rose-500" /> for musicians
        </div>
      </div>
    </section>
  );
}
