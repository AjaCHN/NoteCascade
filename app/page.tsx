'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useMidi } from './hooks/use-midi';
import { useKeyboardInput } from './hooks/use-keyboard-input';
import { initAudio, startNote, stopNote, setVolume, startTransport, stopTransport, setAudioInstrument, scheduleNote, clearScheduledEvents, ensureAudioContext } from './lib/audio';
import * as Tone from 'tone';
import { Song, builtInSongs } from './lib/songs';
import { getNextSong, useAppActions, useLocale, useTheme, useInstrument, usePlayMode, useKeyboardRange, useShowNoteNames, useShowKeymap } from './lib/store';
import { translations } from './lib/translations';
import { Keyboard } from './components/Keyboard';
import { GameCanvas } from './components/GameCanvas';
import { AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

import { SettingsModal } from './components/SettingsModal';
import { ResultModal } from './components/ResultModal';
import { AppHeader } from './components/AppHeader';
import { AppSidebar } from './components/AppSidebar';

export default function MidiPlayApp() {
  const { 
    activeNotes, setActiveNotes, lastMessage, isSupported
  } = useMidi();
  const { 
    addScore, incrementPracticeTime, updateStreak, 
    setKeyboardRange
  } = useAppActions();
  const locale = useLocale();
  const theme = useTheme();
  const instrument = useInstrument();
  const playMode = usePlayMode();
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
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  const [mounted, setMounted] = useState(false);
  const { isSupported } = useMidi();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => setWindowWidth(window.innerWidth);
      // Use setTimeout to avoid synchronous state update warning during mount
      setTimeout(() => setWindowWidth(window.innerWidth), 0);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    if (!isSupported && mounted) {
      // Could show a toast here, but for now we'll just log it or maybe show a small banner
      console.warn('Web MIDI API is not supported in this browser.');
    }
  }, [isSupported, mounted]);

  useEffect(() => {
    if (lastMessage) {
      initAudio(); // Try to initialize audio on MIDI input
      const { command, note, velocity } = lastMessage;
      const status = command & 0xf0;
      if (status === 0x90 && velocity > 0) {
        startNote(note, velocity / 127);
      } else if (status === 0x80 || (status === 0x90 && velocity === 0)) {
        stopNote(note);
      }
    }
  }, [lastMessage]);

  // Keyboard input
  useKeyboardInput(setActiveNotes);

  useEffect(() => {
    setMounted(true);
    setVolume(volume);
    setAudioInstrument(instrument);

    // Mobile adaptation
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setKeyboardRange(48, 64); // ~1.5 octaves for mobile (C3 - E4)
      setShowSidebar(false);
    }
  }, []);

  useEffect(() => {
    setAudioInstrument(instrument);
  }, [instrument]);

  const handleSongEnd = useCallback(() => {
    if (playMode === 'demo') {
      setIsPlaying(false);
      setCurrentTime(0);
      return;
    }

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
  }, [lastScore, updateStreak, addScore, selectedSong.id, selectedSong.notes?.length, playMode]);

  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      setIsPlaying(false);
      stopTransport();
      clearScheduledEvents();
      setActiveNotes(new Map());
    } else {
      await initAudio();
      await ensureAudioContext();
      
      if (currentTime >= (selectedSong.duration || 0)) {
        setCurrentTime(0);
      }

      // Schedule notes for Demo mode
      if (playMode === 'demo') {
        clearScheduledEvents();
        selectedSong.notes?.forEach(note => {
          // Only schedule future notes if resuming? 
          // For simplicity, we assume start from 0 or current time.
          // Since we reset Transport on stop, we schedule all.
          
          scheduleNote(
            note,
            () => {
              // On Start
              setActiveNotes(prev => new Map(prev).set(note.midi, note.velocity));
            },
            () => {
              // On End
              setActiveNotes(prev => {
                const next = new Map(prev);
                next.delete(note.midi);
                return next;
              });
            }
          );
        });
      }

      setIsPlaying(true);
      startTransport();
    }
  }, [isPlaying, currentTime, selectedSong, playMode, setActiveNotes]);

  // Update currentTime from Transport
  useEffect(() => {
    let animationFrame: number;
    const updateTime = () => {
      if (isPlaying) {
        const time = Tone.Transport.seconds;
        setCurrentTime(time);
        
        if (time >= (selectedSong.duration || 0)) {
           setIsPlaying(false);
           stopTransport();
           clearScheduledEvents();
           handleSongEnd();
           setCurrentTime(0);
           setActiveNotes(new Map());
           return;
        }

        animationFrame = requestAnimationFrame(updateTime);
      }
    };
    
    if (isPlaying) {
      updateTime();
    }
    
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, selectedSong.duration, handleSongEnd, setActiveNotes]);

  // Practice time accumulator (approximate)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && playMode === 'perform') {
      interval = setInterval(() => {
        incrementPracticeTime(1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playMode, incrementPracticeTime]);

  const resetSong = useCallback(() => {
    setIsPlaying(false);
    stopTransport();
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

  // Calculate minimum width for game canvas based on key count
  const isBlackKey = (midi: number) => [1, 3, 6, 8, 10].includes(midi % 12);
  const whiteKeyCount = Array.from({ length: keyboardRange.end - keyboardRange.start + 1 }, (_, i) => keyboardRange.start + i)
      .filter(midi => !isBlackKey(midi)).length;
  // On mobile, ensure keys are at least 32px wide. On desktop, fit to screen.
  const minCanvasWidth = windowWidth < 768 
    ? Math.max(windowWidth, whiteKeyCount * 32) 
    : '100%';

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

      <AppHeader 
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        theme={theme}
        selectedInputId={selectedInputId}
        inputs={inputs}
        setShowSettings={setShowSettings}
        showSettings={showSettings}
      />

      <main id="main-content" className="flex flex-1 overflow-hidden relative z-10">
        <AppSidebar 
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedSong={selectedSong}
          setSelectedSong={setSelectedSong}
          resetSong={resetSong}
          togglePlay={togglePlay}
          isPlaying={isPlaying}
          currentTime={currentTime}
          handleNextSong={handleNextSong}
          t={t}
        />

        {/* Main Content Area */}
        <section id="game-section" className="relative flex flex-1 flex-col overflow-hidden bg-transparent overflow-x-auto custom-scrollbar">
          <div className="flex-1 flex flex-col min-h-0 relative" style={{ minWidth: typeof minCanvasWidth === 'number' ? `${minCanvasWidth}px` : minCanvasWidth }}>
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

            <div id="keyboard-wrapper" className="shrink-0 relative z-20 h-24 md:h-32">
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
          </div>
        </section>
      </main>

      <AnimatePresence>
        <ResultModal 
          show={showResult}
          onClose={() => { setShowResult(false); resetSong(); }}
          onRetry={() => { setShowResult(false); resetSong(); togglePlay(); }}
          score={lastScore}
          song={selectedSong}
          theme={theme}
        />

        <SettingsModal 
          show={showSettings}
          onClose={() => setShowSettings(false)}
          volume={volume}
          setVolume={(val) => {
            setVolumeState(val);
            setVolume(val);
          }}
        />
      </AnimatePresence>
    </div>
  );
}
