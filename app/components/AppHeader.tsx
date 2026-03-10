// app/components/AppHeader.tsx v1.7.2
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { 
  Settings, RefreshCw, Maximize2, Minimize2, 
  Keyboard as KeyboardIcon, Music, Library as LibraryIcon, Trophy, Menu, Play
} from 'lucide-react';
import { translations } from '../lib/translations';
import { 
  useLocale, usePlayMode, useAppActions, PlayMode
} from '../lib/store';

const version = "1.7.2";

interface AppHeaderProps {
  theme: string;
  selectedInputId: string | null;
  inputs: { id: string; name: string }[];
  setShowSettings: (show: boolean) => void;
  showSettings: boolean;
  connectMidi?: () => void;
  isConnecting?: boolean;
  isFullScreen: boolean;
  toggleFullScreen: () => void;
  setShowAchievements: (show: boolean) => void;
  showAchievements: boolean;
}

export function AppHeader({ 
  theme, 
  selectedInputId, 
  inputs, 
  setShowSettings,
  showSettings,
  connectMidi,
  isConnecting,
  isFullScreen,
  toggleFullScreen,
  setShowAchievements,
  showAchievements
}: AppHeaderProps) {
  const locale = useLocale();
  const playMode = usePlayMode();
  const { setPlayMode } = useAppActions();
  const t = translations[locale] || translations.en;
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const key = e.key.toLowerCase();
      
      if (key === 'l') setPlayMode('library');
      else if (key === 'a') setShowAchievements(!showAchievements);
      else if (key === 'm') connectMidi?.();
      else if (key === 's') setShowSettings(!showSettings);
      else if (key === 'escape') setShowMenu(prev => !prev);
      else if (showMenu) {
        if (key === 'f') { toggleFullScreen(); setShowMenu(false); }
        else if (key === 's') { setShowSettings(true); setShowMenu(false); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setPlayMode, setShowAchievements, showAchievements, connectMidi, showMenu, toggleFullScreen, setShowSettings, showSettings]);

  const modes = [
    { id: 'demo', icon: Play, label: t.demo || 'Demo' },
    { id: 'practice', icon: KeyboardIcon, label: t.practice || 'Practice' },
    { id: 'free', icon: Music, label: t.freePlay || 'Free' },
  ];

  return (
    <header id="app-header" className="flex h-14 md:h-20 shrink-0 items-center justify-between border-b theme-border px-4 md:px-6 glass-panel z-50">
      <div className="flex items-center gap-3">
        <div className={`flex h-8 w-8 md:h-12 md:w-12 items-center justify-center rounded-2xl shadow-lg glow-indigo transition-all overflow-hidden relative ${
          theme === 'cyber' ? 'bg-green-500' : theme === 'classic' ? 'bg-amber-700' : 'bg-gradient-to-br from-indigo-500 to-purple-600'
        }`}>
          <Image src="/logo.svg" alt="NoteCascade Logo" fill className="object-cover" referrerPolicy="no-referrer" />
        </div>
        <div className="hidden lg:block">
          <h1 id="app-title" className="text-lg md:text-xl font-bold tracking-tight theme-text-primary text-glow">
            {t.title} 
            <span className="text-[10px] font-mono text-indigo-400 ml-1 opacity-70">v{version}</span>
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] theme-text-secondary font-bold opacity-80">{t.subtitle}</p>
        </div>
      </div>

      {/* Mode Switcher - Center */}
      <div className="flex items-center bg-black/20 rounded-2xl p-1 border theme-border backdrop-blur-md">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setPlayMode(mode.id as PlayMode)}
            title={mode.label}
            className={`flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl transition-all ${
              playMode === mode.id 
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                : 'theme-text-secondary hover:theme-text-primary hover:bg-white/5'
            }`}
          >
            <mode.icon className={`h-4 w-4 ${playMode === mode.id ? 'animate-pulse' : ''}`} />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest hidden sm:inline">{mode.label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={() => setPlayMode('library')}
          className={`rounded-full p-2 hover:bg-white/10 transition-all border border-transparent hover:theme-border ${playMode === 'library' ? 'theme-text-primary bg-white/10' : 'theme-text-secondary hover:theme-text-primary'}`}
          title={`${t.library} (L)`}
        >
          <LibraryIcon className="h-5 w-5" />
        </button>

        <button 
          onClick={toggleFullScreen}
          className="hidden md:flex rounded-full p-2.5 hover:bg-white/10 transition-all theme-text-secondary hover:theme-text-primary border border-transparent hover:theme-border"
          title="Toggle Full Screen"
        >
          {isFullScreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </button>
        
        <button 
          onClick={() => connectMidi && connectMidi()}
          disabled={isConnecting}
          title="Connect MIDI (M)"
          className={`flex items-center gap-2 rounded-full px-3 md:px-5 py-2 border backdrop-blur-md transition-all cursor-pointer shadow-lg group relative ${
            isConnecting 
              ? 'bg-amber-500/20 border-amber-500/50 opacity-70 cursor-wait' 
              : selectedInputId 
                ? 'bg-emerald-500/20 border-emerald-500/50 hover:bg-emerald-500/30 ring-2 ring-emerald-500/20' 
                : 'bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20'
          }`}
        >
          <div className={`h-2.5 w-2.5 rounded-full ${
            isConnecting 
              ? 'bg-amber-500 animate-bounce' 
              : selectedInputId 
                ? 'bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,1)]' 
                : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
          }`} />
          
          <span className={`text-[11px] uppercase tracking-widest font-black max-w-[100px] md:max-w-[180px] truncate ${
            selectedInputId ? 'text-emerald-400' : 'theme-text-secondary'
          }`}>
            {selectedInputId ? inputs.find(i => i.id === selectedInputId)?.name : 'MIDI'}
          </span>

          {!selectedInputId && !isConnecting && <RefreshCw className="h-3 w-3 theme-text-secondary ml-1" />}

          {/* Tooltip on hover */}
          <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-black/80 backdrop-blur-md border theme-border rounded-lg text-[10px] font-bold uppercase tracking-widest theme-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            {isConnecting ? 'Connecting...' : selectedInputId ? 'Connected' : t.noDevice}
          </div>
        </button>
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="rounded-full p-2 hover:bg-white/10 transition-all theme-text-secondary hover:theme-text-primary border border-transparent hover:theme-border"
          title="Menu (Esc)"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        {showMenu && (
          <div className="absolute top-full right-4 mt-2 p-2 bg-black/90 backdrop-blur-md border theme-border rounded-2xl shadow-2xl z-50 flex flex-col gap-1">
            <button onClick={() => { setShowAchievements(true); setShowMenu(false); }} title="Achievements (A)" className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/10 theme-text-secondary hover:theme-text-primary text-xs font-bold uppercase tracking-widest">
              <Trophy className="h-4 w-4" />
              Achievements
            </button>
            <button onClick={toggleFullScreen} title="Full Screen (F)" className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/10 theme-text-secondary hover:theme-text-primary text-xs font-bold uppercase tracking-widest">
              {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
            </button>
            <button onClick={() => { setShowSettings(true); setShowMenu(false); }} title="Settings (S)" className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/10 theme-text-secondary hover:theme-text-primary text-xs font-bold uppercase tracking-widest">
              <Settings className="h-4 w-4" />
              Settings
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
