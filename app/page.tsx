/**
 * @file app/page.tsx
 * @version v1.1.0
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useMidi } from './hooks/use-midi';
import { initAudio, playNote, setVolume } from './lib/audio';
import { Song, builtInSongs } from './lib/songs';
import { getNextSong, useAppActions, useLocale, useTheme, useKeyboardRange, useShowNoteNames, useShowKeymap, Theme } from './lib/store';
import { translations, Locale } from './lib/translations';
import { Keyboard } from './components/Keyboard';
import { GameCanvas } from './components/GameCanvas';
import { SongSelector } from './components/SongSelector';
import { AchievementList } from './components/AchievementList';
import { 
  Play, Pause, RotateCcw, Settings, Trophy, Music as MusicIcon, 
  Keyboard as KeyboardIcon, SkipForward, RefreshCw, Menu, X,
  Palette, Monitor, Info, Globe, ChevronDown, Check, ExternalLink, Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

import pkg from '../package.json';

const { version } = pkg;

export default function MidiPlayApp() {
  const { activeNotes, setActiveNotes, inputs, outputs, selectedInputId, setSelectedInputId } = useMidi();
  const { 
    addScore, setLocale, incrementPracticeTime, updateStreak, 
    setTheme, setKeyboardRange, setShowNoteNames, setShowKeymap
  } = useAppActions();
  const locale = useLocale();
  const theme = useTheme();
  const keyboardRange = useKeyboardRange();
  const showNoteNames = useShowNoteNames();
  const showKeymap = useShowKeymap();
  const t = translations[locale] || translations.en;
  
  const [selectedSong, setSelectedSong] = useState<Song>(builtInSongs[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false); // New state for mobile sidebar
  const [showResult, setShowResult] = useState(false);
  const [activeTab, setActiveTab] = useState<'songs' | 'achievements'>('songs');
  const [lastScore, setLastScore] = useState({ perfect: 0, good: 0, miss: 0, wrong: 0, currentScore: 0 });
  const [volume, setVolumeState] = useState(80);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setVolume(volume);

    const KEYBOARD_MAP: Record<string, number> = {
      'z': 48, 's': 49, 'x': 50, 'd': 51, 'c': 52, 'v': 53, 'g': 54, 'b': 55, 'h': 56, 'n': 57, 'j': 58, 'm': 59, // C3 - B3
      'q': 60, '2': 61, 'w': 62, '3': 63, 'e': 64, 'r': 65, '5': 66, 't': 67, '6': 68, 'y': 69, '7': 70, 'u': 71, // C4 - B4
      'i': 72, '9': 73, 'o': 74, '0': 75, 'p': 76 // C5 - E5
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      const key = e.key.toLowerCase();
      const midi = KEYBOARD_MAP[key];
      if (midi) {
        playNote(midi, 0.8);
        setActiveNotes(prev => new Map(prev).set(midi, 0.8));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const midi = KEYBOARD_MAP[key];
      if (midi) {
        setActiveNotes(prev => {
          const next = new Map(prev);
          next.delete(midi);
          return next;
        });
      }
    };

    const handleFirstInteraction = () => {
      initAudio();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setActiveNotes]);

  const handleSongEnd = useCallback(() => {
    const totalNotes = lastScore.perfect + lastScore.good + lastScore.miss + lastScore.wrong;
    const accuracy = totalNotes > 0 ? (lastScore.perfect + lastScore.good) / totalNotes : 0;

    const maxScore = (selectedSong.notes?.length || 0) * 100;

    addScore({
      songId: selectedSong.id,
      score: lastScore.currentScore,
      maxScore,
      accuracy,
      perfect: lastScore.perfect,
      good: lastScore.good,
      miss: lastScore.miss,
      wrong: lastScore.wrong,
      maxCombo: 0, // TODO: Implement combo tracking
      date: Date.now(),
    });

    if (accuracy > 0.8) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    
    updateStreak();
    setShowResult(true);
  }, [lastScore, updateStreak, addScore, selectedSong.id, selectedSong.notes?.length]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= (selectedSong.duration || 0)) {
            setIsPlaying(false);
            handleSongEnd();
            return 0;
          }
          return prev + 0.1;
        });
        incrementPracticeTime(0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedSong, incrementPracticeTime, handleSongEnd]);

  useEffect(() => {
    if (!isPlaying) return;
    
    selectedSong.notes?.forEach(note => {
      if (note.time >= currentTime && note.time < currentTime + 0.1) {
        playNote(note.midi, note.velocity, note.duration);
      }
    });
  }, [currentTime, isPlaying, selectedSong]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (currentTime >= (selectedSong.duration || 0)) {
        setCurrentTime(0);
      }
      setIsPlaying(true);
    }
  }, [isPlaying, currentTime, selectedSong]);

  const resetSong = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setLastScore({ perfect: 0, good: 0, miss: 0, wrong: 0, currentScore: 0 });
  }, []);

  const handleNextSong = useCallback(() => {
    const nextSong = getNextSong(selectedSong);
    if (nextSong) {
      setSelectedSong(nextSong);
      resetSong();
    }
  }, [selectedSong, resetSong]);

  if (!mounted) {
    return <div className="flex h-dvh w-full items-center justify-center bg-slate-950 text-slate-500">{t.loading}</div>;
  }

  return (
    <div 
      id="notecascade-app" 
      data-theme={theme}
      className="flex h-dvh w-full flex-col theme-bg-primary theme-text-primary font-sans selection:bg-indigo-500/30 overflow-hidden relative transition-colors duration-500"
    >
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className={`absolute -top-[20%] -left-[10%] w-[60%] h-[60%] blur-[120px] rounded-full transition-colors duration-1000 ${
          theme === 'cyber' ? 'bg-green-500/10' : theme === 'classic' ? 'bg-amber-500/10' : 'bg-indigo-500/10'
        }`} />
        <div className={`absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] blur-[120px] rounded-full transition-colors duration-1000 ${
          theme === 'cyber' ? 'bg-fuchsia-500/10' : theme === 'classic' ? 'bg-orange-500/10' : 'bg-purple-500/10'
        }`} />
        <div className="scanline-effect opacity-30" />
      </div>

      {/* Header */}
      <header id="app-header" className="flex h-14 md:h-16 shrink-0 items-center justify-between border-b theme-border px-4 md:px-6 glass-panel z-50">
        <div className="flex items-center gap-3">
          <button 
            className="md:hidden p-2 -ml-2 theme-text-secondary hover:theme-text-primary transition-colors"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            {showSidebar ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          
          <div className={`flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-xl shadow-lg glow-indigo transition-all ${
            theme === 'cyber' ? 'bg-green-500' : theme === 'classic' ? 'bg-amber-700' : 'bg-gradient-to-br from-indigo-500 to-purple-600'
          }`}>
            <KeyboardIcon className="text-white h-5 w-5 md:h-6 md:w-6" />
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
          <div className="hidden md:flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 border theme-border backdrop-blur-md">
            <div className={`h-2 w-2 rounded-full ${selectedInputId ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'}`} />
            <span className="text-[10px] uppercase tracking-widest font-bold theme-text-secondary">
              {selectedInputId ? inputs.find(i => i.id === selectedInputId)?.name : t.noDevice}
            </span>
          </div>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="rounded-full p-2 hover:bg-white/10 transition-all theme-text-secondary hover:theme-text-primary border border-transparent hover:theme-border"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main id="main-content" className="flex flex-1 overflow-hidden relative z-10">
        {/* Sidebar - Responsive */}
        <aside 
          id="sidebar" 
          className={`
            absolute inset-y-0 left-0 z-40 w-full md:w-80 theme-bg-primary md:bg-transparent
            flex flex-col border-r theme-border transition-transform duration-300 ease-in-out
            ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:relative'}
          `}
        >
          <div className="flex border-b theme-border bg-white/2 backdrop-blur-md">
            <button
              id="tab-songs"
              onClick={() => setActiveTab('songs')}
              className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                activeTab === 'songs' ? 'text-indigo-400 border-b-2 border-indigo-400 bg-indigo-400/5' : 'theme-text-secondary hover:theme-text-primary'
              }`}
            >
              <MusicIcon className="h-4 w-4" />
              {t.songs}
            </button>
            <button
              id="tab-achievements"
              onClick={() => setActiveTab('achievements')}
              className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                activeTab === 'achievements' ? 'text-indigo-400 border-b-2 border-indigo-400 bg-indigo-400/5' : 'theme-text-secondary hover:theme-text-primary'
              }`}
            >
              <Trophy className="h-4 w-4" />
              {t.awards}
            </button>
          </div>
          
          <div id="song-selector-container" className="flex-1 overflow-y-auto custom-scrollbar p-0">
            {activeTab === 'songs' ? (
              <SongSelector 
                onSelect={(song) => { 
                  setSelectedSong(song); 
                  resetSong(); 
                  setShowSidebar(false); // Close sidebar on selection (mobile)
                }} 
                selectedSongId={selectedSong.id} 
              />
            ) : (
              <AchievementList />
            )}
          </div>
          
          <div className="shrink-0 border-t theme-border p-4 theme-bg-secondary/50 backdrop-blur-md flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button onClick={resetSong} className="p-2 theme-text-secondary hover:theme-text-primary rounded-full hover:bg-white/5 transition-colors" title={t.reset}>
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button onClick={() => { resetSong(); togglePlay(); }} className="p-2 theme-text-secondary hover:theme-text-primary rounded-full hover:bg-white/5 transition-colors" title={t.retry}>
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <button onClick={togglePlay} className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg shadow-indigo-500/40 hover:bg-indigo-400 hover:scale-105 active:scale-95 transition-all">
                {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-1" />}
              </button>
              <button onClick={handleNextSong} className="p-2 theme-text-secondary hover:theme-text-primary rounded-full hover:bg-white/5 transition-colors" title={t.nextSong}>
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-col w-full">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest theme-text-secondary mb-1">
                <span>{Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')}</span>
                <span>{Math.floor((selectedSong.duration || 0) / 60)}:{((selectedSong.duration || 0) % 60).toFixed(0).padStart(2, '0')}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden border theme-border">
                <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${(currentTime / (selectedSong.duration || 1)) * 100}%` }} />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <section id="game-section" className="relative flex flex-1 flex-col overflow-hidden bg-transparent">
          <div id="game-canvas-container" className="flex-1 relative min-h-0">
            <GameCanvas
              song={selectedSong}
              currentTime={currentTime}
              activeNotes={activeNotes}
              isPlaying={isPlaying}
              onScoreUpdate={setLastScore}
              keyboardRange={keyboardRange}
              showNoteNames={showNoteNames}
              theme={theme}
            />
          </div>

          <div id="keyboard-wrapper" className="shrink-0 relative z-20">
            <div className="absolute inset-x-0 -top-8 h-8 bg-gradient-to-t theme-bg-primary to-transparent pointer-events-none" />
            <Keyboard 
              activeNotes={activeNotes} 
              startNote={keyboardRange.start} 
              endNote={keyboardRange.end} 
              showNoteNames={showNoteNames}
              showKeymap={showKeymap}
              keyMap={{
                'z': 48, 's': 49, 'x': 50, 'd': 51, 'c': 52, 'v': 53, 'g': 54, 'b': 55, 'h': 56, 'n': 57, 'j': 58, 'm': 59,
                'q': 60, '2': 61, 'w': 62, '3': 63, 'e': 64, 'r': 65, '5': 66, 't': 67, '6': 68, 'y': 69, '7': 70, 'u': 71,
                'i': 72, '9': 73, 'o': 74, '0': 75, 'p': 76
              }}
              onNoteOn={(midi) => setActiveNotes(prev => new Map(prev).set(midi, 0.7))}
              onNoteOff={(midi) => setActiveNotes(prev => { const next = new Map(prev); next.delete(midi); return next; })}
            />
          </div>
        </section>
      </main>


      <AnimatePresence>
        {showResult && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-lg rounded-[2.5rem] bg-slate-900 border border-slate-800 p-8 md:p-12 shadow-2xl text-center"
            >
              <div className="mb-8">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 mb-4">
                  <Trophy className="h-10 w-10" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-2">{t.result}</h2>
                <p className="text-slate-400 font-medium">{t[`song_${selectedSong.id}`] || selectedSong.title} - {t[`artist_${selectedSong.artist.toLowerCase()}`] || selectedSong.artist}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700/50">
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">{t.totalScore}</div>
                  <div className="text-3xl font-black text-white tabular-nums">{lastScore.currentScore.toLocaleString()}</div>
                </div>
                <div className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700/50">
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">{t.accuracy}</div>
                  <div className="text-3xl font-black text-indigo-400 tabular-nums">
                    {(( (lastScore.perfect + lastScore.good) / (lastScore.perfect + lastScore.good + lastScore.miss + lastScore.wrong || 1) ) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="col-span-2 grid grid-cols-4 gap-2">
                  {[
                    { label: t.perfect, value: lastScore.perfect, color: 'text-emerald-400' },
                    { label: t.good, value: lastScore.good, color: 'text-blue-400' },
                    { label: t.miss, value: lastScore.miss, color: 'text-amber-400' },
                    { label: t.wrong, value: lastScore.wrong, color: 'text-rose-400' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-slate-800/30 rounded-2xl p-3 border border-slate-700/30">
                      <div className={`text-[8px] uppercase tracking-tighter font-bold ${stat.color} mb-1`}>{stat.label}</div>
                      <div className="text-lg font-black text-white tabular-nums">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <button 
                  onClick={() => { setShowResult(false); resetSong(); togglePlay(); }}
                  className="flex-1 rounded-2xl bg-slate-800 py-4 font-bold text-white hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-5 w-5" />
                  {t.retry}
                </button>
                <button 
                  onClick={() => { setShowResult(false); resetSong(); }}
                  className="flex-1 rounded-2xl bg-indigo-500 py-4 font-bold text-white hover:bg-indigo-400 transition-colors"
                >
                  {t.continue}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-2xl rounded-[2.5rem] theme-bg-primary border theme-border p-6 md:p-10 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <Settings className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-bold theme-text-primary">{t.settings}</h2>
                </div>
                <button 
                  onClick={() => setShowSettings(false)} 
                  className="p-2 rounded-full hover:bg-white/5 theme-text-secondary hover:theme-text-primary transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: General Settings */}
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
                      <KeyboardIcon className="h-4 w-4 text-indigo-400" />
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] theme-text-secondary">{t.keyboardRange}</label>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between text-[10px] theme-text-secondary font-bold">
                          <span>{keyboardRange.start}</span>
                          <span>{keyboardRange.end}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {[25, 49, 61, 88].map(keys => (
                            <button
                              key={keys}
                              onClick={() => {
                                if (keys === 25) setKeyboardRange(48, 72);
                                if (keys === 49) setKeyboardRange(36, 84);
                                if (keys === 61) setKeyboardRange(36, 96);
                                if (keys === 88) setKeyboardRange(21, 108);
                              }}
                              className="px-2 py-2 rounded-xl border theme-border theme-bg-secondary text-[10px] font-bold theme-text-secondary hover:theme-text-primary transition-all"
                            >
                              {keys}{t.keys}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between p-4 rounded-2xl theme-bg-secondary border theme-border">
                      <span className="text-xs font-bold theme-text-primary">{t.showNoteNames}</span>
                      <button 
                        onClick={() => setShowNoteNames(!showNoteNames)}
                        className={`w-12 h-6 rounded-full transition-all relative ${showNoteNames ? 'bg-indigo-500' : 'bg-slate-700'}`}
                      >
                        <motion.div 
                          animate={{ x: showNoteNames ? 26 : 4 }}
                          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                        />
                      </button>
                    </div>
                    <div className="mt-4 flex items-center justify-between p-4 rounded-2xl theme-bg-secondary border theme-border">
                      <span className="text-xs font-bold theme-text-primary">{t.showKeymap || 'Show PC Keyboard Map'}</span>
                      <button 
                        onClick={() => setShowKeymap(!showKeymap)}
                        className={`w-12 h-6 rounded-full transition-all relative ${showKeymap ? 'bg-indigo-500' : 'bg-slate-700'}`}
                      >
                        <motion.div 
                          animate={{ x: showKeymap ? 26 : 4 }}
                          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                        />
                      </button>
                    </div>
                  </section>
                </div>

                {/* Right Column: MIDI & Info */}
                <div className="space-y-8">
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Volume2 className="h-4 w-4 text-indigo-400" />
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] theme-text-secondary">{t.volume || 'Volume'}</label>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-2xl theme-bg-secondary border theme-border">
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={volume} 
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setVolumeState(val);
                          setVolume(val);
                        }}
                        className="w-full accent-indigo-500"
                      />
                      <span className="text-xs font-bold theme-text-primary w-8 text-right">{volume}%</span>
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Monitor className="h-4 w-4 text-indigo-400" />
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] theme-text-secondary">{t.midiDevice}</label>
                    </div>
                    <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-2">
                      {inputs.length > 0 ? inputs.map(input => (
                        <button
                          key={input.id}
                          onClick={() => setSelectedInputId(input.id)}
                          className={`w-full flex items-center justify-between rounded-2xl p-4 border transition-all ${
                            selectedInputId === input.id 
                              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' 
                              : 'theme-border theme-bg-secondary theme-text-secondary hover:theme-border-primary'
                          }`}
                        >
                          <div className="flex flex-col items-start">
                            <span className="font-bold text-sm">{input.name}</span>
                            <span className="text-[10px] uppercase tracking-widest opacity-50">{input.manufacturer || 'Unknown'}</span>
                          </div>
                          {selectedInputId === input.id && <Check className="h-4 w-4" />}
                        </button>
                      )) : (
                        <div className="rounded-2xl border border-dashed theme-border p-8 text-center theme-text-secondary text-xs italic">
                          {t.noDevice}
                        </div>
                      )}
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Monitor className="h-4 w-4 text-indigo-400" />
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] theme-text-secondary">{t.midiOutputDevice || 'MIDI Output'}</label>
                    </div>
                    <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-2">
                      {outputs.length > 0 ? outputs.map(output => (
                        <div
                          key={output.id}
                          className="w-full flex items-center justify-between rounded-2xl p-4 border theme-border theme-bg-secondary theme-text-secondary"
                        >
                          <div className="flex flex-col items-start">
                            <span className="font-bold text-sm">{output.name}</span>
                            <span className="text-[10px] uppercase tracking-widest opacity-50">{output.manufacturer || 'Unknown'}</span>
                          </div>
                        </div>
                      )) : (
                        <div className="rounded-2xl border border-dashed theme-border p-8 text-center theme-text-secondary text-xs italic">
                          {t.noDevice}
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="p-6 rounded-3xl theme-bg-secondary border theme-border">
                    <div className="flex items-center gap-2 mb-4">
                      <Info className="h-4 w-4 text-indigo-400" />
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] theme-text-secondary">{t.appInfo}</label>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs theme-text-secondary">{t.version}</span>
                        <span className="text-xs font-mono font-bold theme-text-primary">v{version}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs theme-text-secondary">{t.developer}</span>
                        <span className="text-xs font-bold theme-text-primary">Sut</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs theme-text-secondary">{t.midiStatus}</span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${selectedInputId ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                          {selectedInputId ? t.connected : t.disconnected}
                        </span>
                      </div>
                      <div className="pt-3 mt-3 border-t theme-border flex justify-center">
                        <a 
                          href="https://github.com/sutchan" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                        >
                          {t.github} <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              <div className="mt-10 flex justify-end">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="px-10 py-4 rounded-2xl bg-indigo-500 font-bold text-white hover:bg-indigo-400 transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98]"
                >
                  {t.done}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}
