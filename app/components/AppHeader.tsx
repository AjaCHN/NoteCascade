// app/components/AppHeader.tsx v1.4.10
'use client';

import React from 'react';
import Image from 'next/image';
import { Menu, X, Settings, RefreshCw, Maximize2, Minimize2, Play, Eye, Keyboard as KeyboardIcon, Music } from 'lucide-react';
import { translations } from '../lib/translations';
import { useLocale, usePlayMode, useAppActions, PlayMode } from '../lib/store';
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
  isConnecting?: boolean;
  isFullScreen: boolean;
  toggleFullScreen: () => void;
}

export function AppHeader({ 
  showSidebar, 
  setShowSidebar, 
  theme, 
  selectedInputId, 
  inputs, 
  setShowSettings,
  showSettings,
  connectMidi,
  isConnecting,
  isFullScreen,
  toggleFullScreen
}: AppHeaderProps) {
  const locale = useLocale();
  const playMode = usePlayMode();
  const { setPlayMode } = useAppActions();
  const t = translations[locale] || translations.en;

  const modes = [
    { id: 'follow', icon: KeyboardIcon, label: t.follow || 'Follow' },
    { id: 'demo', icon: Eye, label: t.demo || 'Demo' },
    { id: 'free', icon: Music, label: t.freePlay || 'Free' },
    { id: 'perform', icon: Play, label: t.perform || 'Perform' },
  ];

  return (
    <header id="app-header" className="flex h-14 md:h-20 shrink-0 items-center justify-between border-b theme-border px-4 md:px-6 glass-panel z-50">
      <div className="flex items-center gap-3">
        <button 
          className="md:hidden p-2 -ml-2 theme-text-secondary hover:theme-text-primary transition-colors"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          {showSidebar ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        
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
          onClick={toggleFullScreen}
          className="hidden md:flex rounded-full p-2.5 hover:bg-white/10 transition-all theme-text-secondary hover:theme-text-primary border border-transparent hover:theme-border"
          title="Toggle Full Screen"
        >
          {isFullScreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </button>
        
        <button 
          onClick={() => connectMidi && connectMidi()}
          disabled={isConnecting}
          className={`flex items-center gap-2 rounded-full px-3 md:px-5 py-2 border backdrop-blur-md transition-all cursor-pointer shadow-lg ${
            isConnecting 
              ? 'bg-amber-500/20 border-amber-500/50 opacity-70 cursor-wait' 
              : selectedInputId 
                ? 'bg-emerald-500/20 border-emerald-500/50 hover:bg-emerald-500/30 ring-2 ring-emerald-500/20' 
                : 'bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20'
          }`}
          title="Click to connect or refresh MIDI devices"
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
            {isConnecting ? 'Connecting...' : selectedInputId ? inputs.find(i => i.id === selectedInputId)?.name : t.noDevice}
          </span>
          {!selectedInputId && !isConnecting && <RefreshCw className="h-3 w-3 theme-text-secondary ml-1" />}
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
