// app/components/AppHeader.tsx v2.3.2
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  Settings, RefreshCw, Maximize2, Minimize2, 
  Library as LibraryIcon, Sliders,
  Menu, LayoutGrid, Music, Hash, BookOpen
} from 'lucide-react';
import { translations } from '../lib/translations';
import { useLocale, useAppActions, usePlayMode,
  useMetronomeEnabled, useMetronomeBpm, useMetronomeBeats, useKeyboardType
} from '../lib/store';
import { InfoModals } from './InfoModals';
import { ProfileButton } from './ProfileButton';
import { AudioControls } from './header/AudioControls';
import { MenuDropdown } from './header/MenuDropdown';

const version = '2.3.2';

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
  setShowLibrary: (show: boolean) => void;
  showLibrary: boolean;
  viewMode: 'waterfall' | 'sheet' | 'numbered' | 'theory';
  setViewMode: (mode: 'waterfall' | 'sheet' | 'numbered' | 'theory') => void;
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
  setShowLibrary,
  showLibrary,
  viewMode,
  setViewMode
}: AppHeaderProps) {
  const locale = useLocale();
  const metronomeEnabled = useMetronomeEnabled();
  const metronomeBpm = useMetronomeBpm();
  const metronomeBeats = useMetronomeBeats();
  const keyboardType = useKeyboardType();
  const playMode = usePlayMode();
  const { setMetronomeEnabled, setMetronomeBpm, setMetronomeBeats, setPlayMode, setKeyboardType } = useAppActions();
  const t = translations[locale] || translations.en;
  const [showAudioControls, setShowAudioControls] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [infoModalType, setInfoModalType] = useState<'about' | 'changelog' | 'guide' | null>(null);

  return (
    <>
      <InfoModals 
        isOpen={!!infoModalType} 
        onClose={() => setInfoModalType(null)} 
        type={infoModalType} 
      />
      <header id="app-header" className="flex h-14 md:h-20 shrink-0 items-center justify-between border-b theme-border px-4 md:px-6 glass-panel z-50">
      <div className="flex items-center gap-3">
        <div className={`flex h-8 w-8 md:h-12 md:w-12 items-center justify-center rounded-2xl shadow-lg glow-indigo transition-all overflow-hidden relative ${
          theme === 'cyber' ? 'bg-green-500' : theme === 'classic' ? 'bg-amber-700' : 'bg-gradient-to-br from-indigo-500 to-purple-600'
        }`}>
          <Image src="/logo.svg" alt="NoteCascade Logo" fill className="object-cover" referrerPolicy="no-referrer" />
        </div>
        <div className="hidden lg:block">
          <h1 id="app-title" className="text-lg md:text-xl font-bold tracking-tight theme-text-primary text-glow">
            {t.ui.title} 
            <span className="text-[10px] font-mono text-indigo-400 ml-1 opacity-70">v{version}</span>
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] theme-text-secondary font-bold opacity-80">{t.ui.subtitle}</p>
        </div>

        {/* Menu Button */}
        <div className="relative ml-2">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`p-2 rounded-lg transition-all ${showMenu ? 'bg-white/10 theme-text-primary' : 'theme-text-secondary hover:theme-text-primary hover:bg-white/5'}`}
          >
            <Menu className="w-5 h-5" />
          </button>

          <MenuDropdown 
            show={showMenu} 
            t={t} 
            setShowMenu={setShowMenu} 
            setInfoModalType={setInfoModalType} 
          />
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center gap-4 overflow-hidden px-2">
        {/* Play Mode Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-full theme-bg-secondary border theme-border overflow-x-auto custom-scrollbar-mini max-w-full">
          {(['demo', 'practice', 'free'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setPlayMode(mode)}
              className={`px-3 md:px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${
                playMode === mode
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                  : 'theme-text-secondary hover:theme-text-primary hover:bg-white/5'
              }`}
            >
              {t.game[mode] || mode}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="hidden sm:flex items-center gap-1 p-1 rounded-full theme-bg-secondary border theme-border shrink-0">
          <button
            onClick={() => setViewMode('waterfall')}
            className={`p-1.5 rounded-full transition-all ${
              viewMode === 'waterfall' 
                ? 'bg-indigo-500 text-white shadow-md' 
                : 'theme-text-secondary hover:theme-text-primary hover:bg-white/5'
            }`}
            title="Waterfall View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('sheet')}
            className={`p-1.5 rounded-full transition-all ${
              viewMode === 'sheet' 
                ? 'bg-indigo-500 text-white shadow-md' 
                : 'theme-text-secondary hover:theme-text-primary hover:bg-white/5'
            }`}
            title="Sheet Music"
          >
            <Music className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('numbered')}
            className={`p-1.5 rounded-full transition-all ${
              viewMode === 'numbered' 
                ? 'bg-indigo-500 text-white shadow-md' 
                : 'theme-text-secondary hover:theme-text-primary hover:bg-white/5'
            }`}
            title="Numbered Notation"
          >
            <Hash className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('theory')}
            className={`p-1.5 rounded-full transition-all ${
              viewMode === 'theory' 
                ? 'bg-indigo-500 text-white shadow-md' 
                : 'theme-text-secondary hover:theme-text-primary hover:bg-white/5'
            }`}
            title="Music Theory"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <button 
          onClick={() => setShowLibrary(!showLibrary)}
          className={`rounded-full p-2 hover:bg-white/10 transition-all border border-transparent hover:theme-border ${showLibrary ? 'theme-text-primary bg-white/10' : 'theme-text-secondary hover:theme-text-primary'}`}
          title={t.ui.library || 'Library'}
        >
          <LibraryIcon className="h-5 w-5" />
        </button>

        {/* Audio Controls Button */}
        <div className="relative">
          <button
            onClick={() => setShowAudioControls(!showAudioControls)}
            className={`rounded-full p-2 hover:bg-white/10 transition-all border border-transparent hover:theme-border ${showAudioControls ? 'theme-text-primary bg-white/10' : 'theme-text-secondary hover:theme-text-primary'}`}
            title={t.settings.audioSettings || 'Audio Settings'}
          >
            <Sliders className="h-5 w-5" />
          </button>

                <AudioControls 
                  show={showAudioControls}
                  t={t}
                  keyboardType={keyboardType}
                  setKeyboardType={setKeyboardType}
                  metronomeEnabled={metronomeEnabled}
                  setMetronomeEnabled={setMetronomeEnabled}
                  metronomeBpm={metronomeBpm}
                  setMetronomeBpm={setMetronomeBpm}
                  metronomeBeats={metronomeBeats}
                  setMetronomeBeats={setMetronomeBeats}
                />
        </div>

        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="rounded-full p-2 hover:bg-white/10 transition-all theme-text-secondary hover:theme-text-primary border border-transparent hover:theme-border"
          title={t.settings.title || 'Settings'}
        >
          <Settings className="h-5 w-5" />
        </button>
        
        <ProfileButton />

        <button 
          onClick={() => connectMidi && connectMidi()}
          disabled={isConnecting}
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
            {isConnecting ? (t.game.connecting || 'Connecting...') : selectedInputId ? (t.game.connected || 'Connected') : t.game.noDevice}
          </div>
        </button>

        <button 
          onClick={toggleFullScreen}
          className="hidden md:flex rounded-full p-2.5 hover:bg-white/10 transition-all theme-text-secondary hover:theme-text-primary border border-transparent hover:theme-border"
          title={t.settings.toggleFullScreen || 'Toggle Full Screen'}
        >
          {isFullScreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </button>
      </div>
    </header>
    </>
  );
}
