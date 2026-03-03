// app/components/AppHeader.tsx v1.7.2
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Settings, RefreshCw, Maximize2, Minimize2, 
  Volume2, VolumeX, Clock, Library as LibraryIcon, Sliders 
} from 'lucide-react';
import { translations } from '../lib/translations';
import { 
  useLocale, useAppActions,
  useMetronomeEnabled, useMetronomeBpm, useMetronomeBeats
} from '../lib/store';
import pkg from '../../package.json';
import { motion, AnimatePresence } from 'motion/react';

const { version } = pkg;

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
  volume: number;
  setVolume: (val: number) => void;
  setShowLibrary: (show: boolean) => void;
  showLibrary: boolean;
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
  volume,
  setVolume,
  setShowLibrary,
  showLibrary
}: AppHeaderProps) {
  const locale = useLocale();
  const metronomeEnabled = useMetronomeEnabled();
  const metronomeBpm = useMetronomeBpm();
  const metronomeBeats = useMetronomeBeats();
  const { setMetronomeEnabled, setMetronomeBpm, setMetronomeBeats } = useAppActions();
  const t = translations[locale] || translations.en;
  const [showAudioControls, setShowAudioControls] = useState(false);

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

      {/* Mode Switcher - Removed */}

      <div className="flex items-center gap-2 md:gap-4">
        {/* Audio Controls Button */}
        <div className="relative">
          <button
            onClick={() => setShowAudioControls(!showAudioControls)}
            className={`rounded-full p-2 hover:bg-white/10 transition-all border border-transparent hover:theme-border ${showAudioControls ? 'theme-text-primary bg-white/10' : 'theme-text-secondary hover:theme-text-primary'}`}
            title="Audio Settings"
          >
            <Sliders className="h-5 w-5" />
          </button>

          <AnimatePresence>
            {showAudioControls && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 mt-2 p-4 rounded-2xl theme-bg-secondary border theme-border shadow-2xl w-64 z-50 flex flex-col gap-4"
              >
                {/* Metronome */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest theme-text-secondary">Metronome</span>
                    <button 
                      onClick={() => setMetronomeEnabled(!metronomeEnabled)}
                      className={`p-1.5 rounded-lg transition-all ${metronomeEnabled ? 'bg-indigo-500 text-white' : 'bg-white/5 theme-text-secondary'}`}
                    >
                      <Clock className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={metronomeBpm}
                      onChange={(e) => setMetronomeBpm(parseInt(e.target.value) || 120)}
                      className="w-16 bg-white/5 rounded px-2 py-1 theme-text-primary text-xs font-bold focus:outline-none border theme-border"
                    />
                    <span className="text-[10px] theme-text-secondary font-bold">BPM</span>
                    <select
                      value={metronomeBeats}
                      onChange={(e) => setMetronomeBeats(parseInt(e.target.value))}
                      className="ml-auto bg-white/5 rounded px-2 py-1 text-[10px] font-bold theme-text-secondary focus:outline-none border theme-border"
                    >
                      {[2, 3, 4, 6].map(b => <option key={b} value={b}>{b}/4</option>)}
                    </select>
                  </div>
                </div>

                <div className="h-px bg-white/10 w-full" />

                {/* Volume */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest theme-text-secondary">Volume</span>
                    <span className="text-xs font-bold theme-text-primary">{volume}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="theme-text-secondary">
                      {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={volume}
                      onChange={(e) => setVolume(parseInt(e.target.value))}
                      className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button 
          onClick={() => setShowLibrary(!showLibrary)}
          className={`rounded-full p-2 hover:bg-white/10 transition-all border border-transparent hover:theme-border ${showLibrary ? 'theme-text-primary bg-white/10' : 'theme-text-secondary hover:theme-text-primary'}`}
          title={t.library || 'Library'}
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
          onClick={() => setShowSettings(!showSettings)}
          className="rounded-full p-2 hover:bg-white/10 transition-all theme-text-secondary hover:theme-text-primary border border-transparent hover:theme-border"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
