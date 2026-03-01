// app/components/AppHeader.tsx v1.4.10
'use client';

import React from 'react';
import { Menu, X, Settings, RefreshCw } from 'lucide-react';
import { translations } from '../lib/translations';
import { useLocale } from '../lib/store';
import pkg from '../../package.json';

const { version } = pkg;

interface AppHeaderProps {
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  theme: string;
  selectedInputId: string | null;
  inputs: { id: string; name: string }[];
  setShowSettings: (show: boolean) => void;
  showSettings: boolean;
  connectMidi?: () => void;
}

export function AppHeader({ 
  showSidebar, 
  setShowSidebar, 
  theme, 
  selectedInputId, 
  inputs, 
  setShowSettings,
  showSettings,
  connectMidi
}: AppHeaderProps) {
  const locale = useLocale();
  const t = translations[locale] || translations.en;

  return (
    <header id="app-header" className="flex h-14 md:h-16 shrink-0 items-center justify-between border-b theme-border px-4 md:px-6 glass-panel z-50">
      <div className="flex items-center gap-3">
        <button 
          className="md:hidden p-2 -ml-2 theme-text-secondary hover:theme-text-primary transition-colors"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          {showSidebar ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        
        <div className={`flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-xl shadow-lg glow-indigo transition-all overflow-hidden ${
          theme === 'cyber' ? 'bg-green-500' : theme === 'classic' ? 'bg-amber-700' : 'bg-gradient-to-br from-indigo-500 to-purple-600'
        }`}>
          <img src="/logo.svg" alt="NoteCascade Logo" className="h-full w-full object-cover" />
        </div>
        <div>
          <h1 id="app-title" className="text-lg md:text-xl font-bold tracking-tight theme-text-primary text-glow">
            {t.title} 
            <span className="text-[10px] font-mono text-indigo-400 ml-1 opacity-70">v{version}</span>
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] theme-text-secondary font-bold hidden md:block opacity-80">{t.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={() => connectMidi && connectMidi()}
          className="hidden md:flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 border theme-border backdrop-blur-md hover:bg-white/10 transition-colors cursor-pointer"
          title="Click to connect or refresh MIDI devices"
        >
          <div className={`h-2 w-2 rounded-full ${selectedInputId ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'}`} />
          <span className="text-[10px] uppercase tracking-widest font-bold theme-text-secondary">
            {selectedInputId ? inputs.find(i => i.id === selectedInputId)?.name : t.noDevice}
          </span>
          {!selectedInputId && <RefreshCw className="h-3 w-3 theme-text-secondary ml-1" />}
        </button>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="rounded-full p-2 hover:bg-white/10 transition-all theme-text-secondary hover:theme-text-primary border border-transparent hover:theme-border"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
