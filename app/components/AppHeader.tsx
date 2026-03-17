// app/components/AppHeader.tsx v2.0.1
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { 
  Settings, RefreshCw, Maximize2, Minimize2, 
  Keyboard as KeyboardIcon, Music, Library, Trophy, Menu, Play, HelpCircle, LogIn, LogOut, User as UserIcon
} from 'lucide-react';
import { translations } from '../lib/translations';
import { 
  useLocale, usePlayMode, useAppActions, PlayMode
} from '../lib/store';
import { useAuth } from '../lib/auth-context';

const version = "2.0.1";

interface AppHeaderProps {
  theme: string;
  selectedInputId: string | null;
  inputs: { id: string; name: string }[];
  setShowSettings: (show: boolean) => void;
  setActiveSettingsSection: (section: 'general' | 'audio' | 'keyboard' | 'midi' | 'about' | 'account') => void;
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
  setActiveSettingsSection,
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
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, signIn, logOut } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openSettings = useCallback((section: 'general' | 'audio' | 'keyboard' | 'midi' | 'about' | 'account') => {
    setActiveSettingsSection(section);
    setShowSettings(true);
    setShowMenu(false);
  }, [setActiveSettingsSection, setShowSettings]);

  const handleMouseLeave = () => {
    setTimeout(() => {
      setShowMenu(false);
    }, 2000);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const key = e.key.toLowerCase();
      
      if (key === 'l') setPlayMode('library');
      else if (key === 'a') setShowAchievements(!showAchievements);
      else if (key === 'm') connectMidi?.();
      else if (key === 's') {
        setActiveSettingsSection('general');
        setShowSettings(!showSettings);
      }
      else if (key === 'escape') setShowMenu(prev => !prev);
      else if (showMenu) {
        if (key === 'f') { toggleFullScreen(); setShowMenu(false); }
        else if (key === 's') { openSettings('general'); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setPlayMode, setShowAchievements, showAchievements, connectMidi, showMenu, toggleFullScreen, setShowSettings, showSettings, setActiveSettingsSection, openSettings]);

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
          className={`flex items-center gap-2 rounded-full px-3 py-2 hover:bg-white/10 transition-all border border-transparent hover:theme-border ${playMode === 'library' ? 'theme-text-primary bg-white/10' : 'theme-text-secondary hover:theme-text-primary'}`}
          title={`${t.library} (L)`}
        >
          <Library className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-widest hidden md:inline">{t.library}</span>
        </button>

        <button 
          onClick={toggleFullScreen}
          className="hidden md:flex rounded-full p-2.5 hover:bg-white/10 transition-all theme-text-secondary hover:theme-text-primary border border-transparent hover:theme-border"
          title={isFullScreen ? t.exitFullScreen : t.fullScreen}
        >
          {isFullScreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </button>
        
        <button 
          onClick={() => connectMidi && connectMidi()}
          disabled={isConnecting}
          title={`${t.midi} (M)`}
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
        <div 
          className="relative" 
          ref={menuRef}
          onMouseLeave={handleMouseLeave}
        >
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-full p-2 hover:bg-white/10 transition-all theme-text-secondary hover:theme-text-primary border border-transparent hover:theme-border flex items-center justify-center overflow-hidden"
            title="Menu (Esc)"
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="User" className="h-5 w-5 rounded-full object-cover" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
          
          {showMenu && (
            <div className="absolute top-full right-0 mt-2 p-2 bg-black/90 backdrop-blur-md border theme-border rounded-2xl shadow-2xl z-50 flex flex-col gap-1 min-w-[160px]">
              <button onClick={() => { setShowAchievements(true); setShowMenu(false); }} title={`${t.achievements} (A)`} className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/10 theme-text-secondary hover:theme-text-primary text-xs font-bold uppercase tracking-widest text-left">
                <Trophy className="h-4 w-4" />
                {t.achievements}
              </button>
              <button onClick={() => { setPlayMode('library'); setShowMenu(false); }} title={`${t.library} (L)`} className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/10 theme-text-secondary hover:theme-text-primary text-xs font-bold uppercase tracking-widest text-left">
                <Library className="h-4 w-4" />
                {t.library}
              </button>
              <button onClick={toggleFullScreen} title={`${isFullScreen ? t.exitFullScreen : t.fullScreen} (F)`} className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/10 theme-text-secondary hover:theme-text-primary text-xs font-bold uppercase tracking-widest text-left">
                {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                {isFullScreen ? t.exitFullScreen : t.fullScreen}
              </button>
              <div className="h-px bg-white/10 my-1" />
              <button onClick={() => openSettings('general')} className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/10 theme-text-secondary hover:theme-text-primary text-xs font-bold uppercase tracking-widest text-left">
                <Settings className="h-4 w-4" />
                {t.general}
              </button>
              <button onClick={() => openSettings('audio')} className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/10 theme-text-secondary hover:theme-text-primary text-xs font-bold uppercase tracking-widest text-left">
                <Music className="h-4 w-4" />
                {t.audio}
              </button>
              <button onClick={() => openSettings('keyboard')} className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/10 theme-text-secondary hover:theme-text-primary text-xs font-bold uppercase tracking-widest text-left">
                <KeyboardIcon className="h-4 w-4" />
                {t.keyboard}
              </button>
              <button onClick={() => openSettings('midi')} className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/10 theme-text-secondary hover:theme-text-primary text-xs font-bold uppercase tracking-widest text-left">
                <RefreshCw className="h-4 w-4" />
                {t.midi}
              </button>
              <button onClick={() => openSettings('about')} className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/10 theme-text-secondary hover:theme-text-primary text-xs font-bold uppercase tracking-widest text-left">
                <HelpCircle className="h-4 w-4" />
                {t.about}
              </button>
              <div className="h-px bg-white/10 my-1" />
              {user ? (
                <button onClick={() => { logOut(); setShowMenu(false); }} className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/10 theme-text-secondary hover:theme-text-primary text-xs font-bold uppercase tracking-widest text-left">
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              ) : (
                <button onClick={() => { signIn(); setShowMenu(false); }} className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/10 theme-text-secondary hover:theme-text-primary text-xs font-bold uppercase tracking-widest text-left">
                  <LogIn className="h-4 w-4" />
                  Login
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
