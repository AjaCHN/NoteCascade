'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useMidi } from '../hooks/use-midi';
import { initAudio, playNote } from '../lib/audio';
import { Song, builtInSongs } from '../lib/songs';
import { getNextSong, useAppActions, useLocale } from '../lib/store';
import { translations, Locale } from '../lib/i18n';
import { Keyboard } from '../components/Keyboard';
import { GameCanvas } from '../components/GameCanvas';
import { SongSelector } from '../components/SongSelector';
import { AchievementList } from '../components/AchievementList';
import { Play, Pause, RotateCcw, Settings, Trophy, Music as MusicIcon, Keyboard as KeyboardIcon, SkipForward, RefreshCw, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

import pkg from '../package.json';

const { version } = pkg;

export default function MidiPlayApp() {
  const { activeNotes, inputs, selectedInputId, setSelectedInputId } = useMidi();
  const { addScore, setLocale, incrementPracticeTime, updateStreak } = useAppActions();
  const locale = useLocale();
  const t = translations[locale] || translations.en;
  
  const [selectedSong, setSelectedSong] = useState<Song>(builtInSongs[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false); // New state for mobile sidebar
  const [showResult, setShowResult] = useState(false);
  const [activeTab, setActiveTab] = useState<'songs' | 'achievements'>('songs');
  const [lastScore, setLastScore] = useState({ perfect: 0, good: 0, miss: 0, wrong: 0, currentScore: 0 });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    const handleFirstInteraction = () => {
      initAudio();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  const handleSongEnd = useCallback(() => {
    const totalNotes = lastScore.perfect + lastScore.good + lastScore.miss + lastScore.wrong;
    const accuracy = totalNotes > 0 ? (lastScore.perfect + lastScore.good) / totalNotes : 0;

    const maxScore = selectedSong.notes.length * 100;

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
  }, [lastScore, updateStreak, addScore, selectedSong.id, selectedSong.notes.length]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= selectedSong.duration) {
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
    
    selectedSong.notes.forEach(note => {
      if (note.time >= currentTime && note.time < currentTime + 0.1) {
        playNote(note.midi, note.velocity, note.duration);
      }
    });
  }, [currentTime, isPlaying, selectedSong]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (currentTime >= selectedSong.duration) {
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
    <div id="notecascade-app" className="flex h-dvh w-full flex-col bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden relative">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full" />
        <div className="scanline-effect opacity-30" />
      </div>

      {/* Header */}
      <header id="app-header" className="flex h-14 md:h-16 shrink-0 items-center justify-between border-b border-white/5 px-4 md:px-6 bg-slate-950/40 backdrop-blur-xl z-50">
        <div className="flex items-center gap-3">
          <button 
            className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white transition-colors"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            {showSidebar ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          
          <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 glow-indigo">
            <KeyboardIcon className="text-white h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div>
            <h1 id="app-title" className="text-lg md:text-xl font-bold tracking-tight text-white text-glow">{t.title} <span className="text-[10px] font-mono text-indigo-400 ml-1 opacity-70">v{version}</span></h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold hidden md:block opacity-80">{t.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 border border-white/5 backdrop-blur-md">
            <div className={`h-2 w-2 rounded-full ${selectedInputId ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'}`} />
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
              {selectedInputId ? inputs.find(i => i.id === selectedInputId)?.name : t.noDevice}
            </span>
          </div>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="rounded-full p-2 hover:bg-white/10 transition-all text-slate-400 hover:text-white border border-transparent hover:border-white/10"
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
            absolute inset-y-0 left-0 z-40 w-full md:w-80 bg-slate-950/95 md:bg-transparent
            flex flex-col border-r border-white/5 transition-transform duration-300 ease-in-out
            ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:relative'}
          `}
        >
          <div className="flex border-b border-white/5 bg-white/2 backdrop-blur-md">
            <button
              id="tab-songs"
              onClick={() => setActiveTab('songs')}
              className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                activeTab === 'songs' ? 'text-indigo-400 border-b-2 border-indigo-400 bg-indigo-400/5' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <MusicIcon className="h-4 w-4" />
              {t.songs}
            </button>
            <button
              id="tab-achievements"
              onClick={() => setActiveTab('achievements')}
              className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                activeTab === 'achievements' ? 'text-indigo-400 border-b-2 border-indigo-400 bg-indigo-400/5' : 'text-slate-500 hover:text-slate-300'
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
        </aside>

        {/* Main Content Area */}
        <section id="game-section" className="relative flex flex-1 flex-col overflow-hidden w-full bg-transparent">
          <div id="game-canvas-container" className="flex-1 relative min-h-0">
            <GameCanvas
              song={selectedSong}
              currentTime={currentTime}
              activeNotes={activeNotes}
              isPlaying={isPlaying}
              onScoreUpdate={setLastScore}
            />
            
            <div id="song-info" className="absolute top-4 left-4 md:top-8 md:left-8 pointer-events-none z-10">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={selectedSong.id}
                className="space-y-1"
              >
                <h2 className="text-2xl md:text-5xl font-black text-white text-glow tracking-tighter leading-none">{selectedSong.title}</h2>
                <div className="flex items-center gap-3">
                  <p className="text-sm md:text-lg text-indigo-400 font-bold uppercase tracking-widest opacity-90">{selectedSong.artist}</p>
                  <div className="h-4 w-px bg-white/10" />
                  <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">{selectedSong.style}</p>
                </div>
              </motion.div>
            </div>

            <div id="game-controls" className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 md:gap-6 rounded-[2rem] bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-2 md:p-4 shadow-2xl z-20 max-w-[95%] glow-indigo">
              <div id="secondary-controls" className="flex items-center gap-1 md:gap-2 pl-2">
                <button 
                  id="btn-reset"
                  onClick={resetSong}
                  className="p-2 md:p-3 text-slate-500 hover:text-white transition-all hover:bg-white/5 rounded-full"
                  title="Reset"
                >
                  <RotateCcw className="h-4 w-4 md:h-5 md:w-5" />
                </button>
                
                <button 
                  id="btn-retry"
                  onClick={() => { resetSong(); togglePlay(); }}
                  className="p-2 md:p-3 text-slate-500 hover:text-white transition-all hover:bg-white/5 rounded-full"
                  title="Retry"
                >
                  <RefreshCw className="h-4 w-4 md:h-5 md:w-5" />
                </button>
              </div>
              
              <button
                id="btn-play-pause"
                onClick={togglePlay}
                className="flex h-12 w-12 md:h-20 md:w-20 items-center justify-center rounded-full bg-indigo-500 text-white shadow-xl shadow-indigo-500/40 hover:bg-indigo-400 hover:scale-105 active:scale-95 transition-all group"
              >
                {isPlaying ? <Pause className="h-6 w-6 md:h-10 md:w-10 fill-current" /> : <Play className="h-6 w-6 md:h-10 md:w-10 fill-current ml-1" />}
              </button>

              <button 
                id="btn-next-song"
                onClick={handleNextSong}
                className="p-2 md:p-3 text-slate-500 hover:text-white transition-all hover:bg-white/5 rounded-full"
                title="Next Song"
              >
                <SkipForward className="h-4 w-4 md:h-5 md:w-5" />
              </button>

              <div id="playback-progress" className="flex flex-col w-24 md:w-48 pr-4">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                  <span>{Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')}</span>
                  <span>{Math.floor(selectedSong.duration / 60)}:{(selectedSong.duration % 60).toFixed(0).padStart(2, '0')}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden border border-white/5">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    style={{ width: `${(currentTime / (selectedSong.duration || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div id="keyboard-wrapper" className="shrink-0 relative z-20">
            <div className="absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
            <Keyboard activeNotes={activeNotes} />
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
                <p className="text-slate-400 font-medium">{selectedSong.title} - {selectedSong.artist}</p>
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
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">{t.settings}</h2>
                <button onClick={() => setShowSettings(false)} className="text-slate-500 hover:text-white">
                  <RotateCcw className="h-5 w-5 rotate-45" />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4 block">{t.language}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(translations) as Locale[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setLocale(lang)}
                        className={`px-3 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                          locale === lang 
                            ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/20' 
                            : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {lang.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4 block">{t.midiDevice}</label>
                  <div className="space-y-2">
                    {inputs.length > 0 ? inputs.map(input => (
                      <button
                        key={input.id}
                        onClick={() => setSelectedInputId(input.id)}
                        className={`w-full flex items-center justify-between rounded-2xl p-4 border transition-all ${
                          selectedInputId === input.id 
                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 shadow-lg shadow-indigo-500/10' 
                            : 'border-white/5 bg-white/5 text-slate-400 hover:border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-bold text-sm">{input.name}</span>
                          <span className="text-[10px] uppercase tracking-widest text-slate-500">{input.manufacturer}</span>
                        </div>
                        {selectedInputId === input.id && <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />}
                      </button>
                    )) : (
                      <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-slate-500 text-sm font-medium">
                        {t.noDevice}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="w-full rounded-2xl bg-indigo-500 py-4 font-bold text-white hover:bg-indigo-400 transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98]"
                  >
                    {t.done}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}
