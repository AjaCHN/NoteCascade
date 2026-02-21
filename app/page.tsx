'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useMidi } from '../hooks/use-midi';
import { initAudio, playNote, releaseNote } from '../lib/audio';
import { Song, builtInSongs } from '../lib/songs';
import { useAppStore } from '../lib/store';
import { Keyboard } from '../components/Keyboard';
import { GameCanvas } from '../components/GameCanvas';
import { SongSelector } from '../components/SongSelector';
import { AchievementList } from '../components/AchievementList';
import { Play, Pause, RotateCcw, Settings, Trophy, Music as MusicIcon, Keyboard as KeyboardIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

export default function MidiPlayApp() {
  const { activeNotes, inputs, selectedInputId, setSelectedInputId, error: midiError } = useMidi();
  const { unlockAchievement, addScore, addPracticeTime } = useAppStore();
  
  const [selectedSong, setSelectedSong] = useState<Song>(builtInSongs[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'songs' | 'achievements'>('songs');
  const [lastScore, setLastScore] = useState({ perfect: 0, good: 0, miss: 0, wrong: 0, currentScore: 0 });

  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // Audio feedback for MIDI
  useEffect(() => {
    activeNotes.forEach(note => playNote(note));
  }, [activeNotes]);

  // Handle note releases
  const prevNotes = useRef<Set<number>>(new Set());
  useEffect(() => {
    prevNotes.current.forEach(note => {
      if (!activeNotes.has(note)) releaseNote(note);
    });
    prevNotes.current = new Set(activeNotes);
  }, [activeNotes]);

  const animate = useCallback((time: number) => {
    if (!startTimeRef.current) startTimeRef.current = time - currentTime * 1000;
    const elapsed = (time - startTimeRef.current) / 1000;
    
    if (elapsed >= selectedSong.duration) {
      setIsPlaying(false);
      handleSongEnd();
      return;
    }

    setCurrentTime(elapsed);
    requestRef.current = requestAnimationFrame(animate);
  }, [currentTime, selectedSong.duration]);

  const handleSongEnd = () => {
    const accuracy = (lastScore.perfect + lastScore.good) / (selectedSong.notes.length || 1);
    addScore({
      songId: selectedSong.id,
      score: lastScore.currentScore,
      maxScore: selectedSong.notes.length * 100,
      accuracy,
      perfect: lastScore.perfect,
      good: lastScore.good,
      miss: lastScore.miss,
      wrong: lastScore.wrong,
      date: Date.now(),
    });

    unlockAchievement('first_song');
    if (accuracy >= 0.9) unlockAchievement('score_90');
    if (lastScore.perfect >= 10) unlockAchievement('perfect_10');

    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#10b981', '#f59e0b']
    });
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      startTimeRef.current = 0;
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, animate]);

  const togglePlay = async () => {
    await initAudio();
    setIsPlaying(!isPlaying);
  };

  const resetSong = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    startTimeRef.current = 0;
  };

  return (
    <div className="flex h-screen w-full flex-col bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-slate-800 px-6 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
            <KeyboardIcon className="text-white h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">MidiPlay <span className="text-xs font-mono text-indigo-400 ml-1">v1.0.2</span></h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Master your keys</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 rounded-full bg-slate-800/50 px-4 py-1.5 border border-slate-700">
            <div className={`h-2 w-2 rounded-full ${selectedInputId ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-xs font-medium text-slate-300">
              {selectedInputId ? inputs.find(i => i.id === selectedInputId)?.name : 'No MIDI Device'}
            </span>
          </div>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="rounded-full p-2 hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-80 flex flex-col border-r border-slate-800 bg-slate-900/20">
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setActiveTab('songs')}
              className={`flex-1 py-4 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'songs' ? 'text-indigo-400 border-b-2 border-indigo-400 bg-indigo-400/5' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <MusicIcon className="h-4 w-4" />
              Songs
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`flex-1 py-4 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'achievements' ? 'text-indigo-400 border-b-2 border-indigo-400 bg-indigo-400/5' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Trophy className="h-4 w-4" />
              Awards
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {activeTab === 'songs' ? (
              <SongSelector 
                onSelect={(song) => { setSelectedSong(song); resetSong(); }} 
                selectedSongId={selectedSong.id} 
              />
            ) : (
              <AchievementList />
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="relative flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 relative">
            <GameCanvas
              song={selectedSong}
              currentTime={currentTime}
              activeNotes={activeNotes}
              isPlaying={isPlaying}
              onScoreUpdate={setLastScore}
            />
            
            <div className="absolute top-6 left-6 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={selectedSong.id}
              >
                <h2 className="text-3xl font-black text-white drop-shadow-md">{selectedSong.title}</h2>
                <p className="text-indigo-400 font-medium">{selectedSong.artist}</p>
              </motion.div>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/10 p-4 shadow-2xl">
              <button 
                onClick={resetSong}
                className="p-3 text-slate-400 hover:text-white transition-colors"
              >
                <RotateCcw className="h-6 w-6" />
              </button>
              
              <button
                onClick={togglePlay}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg shadow-indigo-500/40 hover:bg-indigo-400 hover:scale-105 active:scale-95 transition-all"
              >
                {isPlaying ? <Pause className="h-8 w-8 fill-current" /> : <Play className="h-8 w-8 fill-current ml-1" />}
              </button>

              <div className="flex flex-col w-32">
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
                  <span>{Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')}</span>
                  <span>{Math.floor(selectedSong.duration / 60)}:{(selectedSong.duration % 60).toFixed(0).padStart(2, '0')}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <motion.div 
                    className="h-full bg-indigo-500"
                    style={{ width: `${(currentTime / (selectedSong.duration || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <Keyboard activeNotes={activeNotes} />
        </section>
      </main>

      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">Settings</h2>
                <button onClick={() => setShowSettings(false)} className="text-slate-500 hover:text-white">
                  <RotateCcw className="h-5 w-5 rotate-45" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 block">MIDI Input Device</label>
                  <div className="space-y-2">
                    {inputs.length > 0 ? inputs.map(input => (
                      <button
                        key={input.id}
                        onClick={() => setSelectedInputId(input.id)}
                        className={`w-full flex items-center justify-between rounded-xl p-4 border transition-all ${
                          selectedInputId === input.id 
                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' 
                            : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="font-medium">{input.name}</span>
                        {selectedInputId === input.id && <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />}
                      </button>
                    )) : (
                      <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-slate-500">
                        No MIDI devices detected. Connect a keyboard via USB.
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="w-full rounded-xl bg-indigo-500 py-4 font-bold text-white hover:bg-indigo-400 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
}
