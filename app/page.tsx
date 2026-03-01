// app/page.tsx v1.4.7
'use client';

import React, { useState, useEffect } from 'react';
import { useMidi } from './hooks/use-midi';
import { useKeyboardInput } from './hooks/use-keyboard-input';
import { initAudio, startNote, stopNote, setVolume, setAudioInstrument } from './lib/audio';
import { useAppActions, useLocale, useTheme, useInstrument, useKeyboardRange, useShowNoteNames, useShowKeymap } from './lib/store';
import { translations } from './lib/translations';
import { Keyboard } from './components/Keyboard';
import { GameCanvas } from './components/GameCanvas';
import { AnimatePresence } from 'motion/react';

import { SettingsModal } from './components/SettingsModal';
import { ResultModal } from './components/ResultModal';
import { AppHeader } from './components/AppHeader';
import { AppSidebar } from './components/AppSidebar';
import { useGameLogic } from './hooks/use-game-logic';
import { useSidebarResize } from './hooks/use-sidebar-resize';

export default function MidiPlayApp() {
  const { 
    activeNotes, setActiveNotes, lastMessage, isSupported, inputs, selectedInputId,
    setSelectedInputId, midiChannel, setMidiChannel, velocityCurve, setVelocityCurve,
    transpose, setTranspose, connectMidi
  } = useMidi();
  const { setKeyboardRange } = useAppActions();
  const locale = useLocale();
  const theme = useTheme();
  const instrument = useInstrument();
  const keyboardRange = useKeyboardRange();
  const showNoteNames = useShowNoteNames();
  const showKeymap = useShowKeymap();
  const t = translations[locale] || translations.en;
  
  const {
    selectedSong, setSelectedSong, isPlaying, currentTime, showResult, setShowResult,
    lastScore, setLastScore, togglePlay, resetSong, handleNextSong
  } = useGameLogic(activeNotes, setActiveNotes);

  const { sidebarWidth, setIsResizing } = useSidebarResize();

  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState<'songs' | 'achievements'>('songs');
  const [volume, setVolumeState] = useState(80);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [mounted, setMounted] = useState(false);

  // Dynamic keyboard range logic
  useEffect(() => {
    if (!mounted) return;

    const hasMidi = inputs.length > 0;
    
    if (!hasMidi) {
      // No MIDI connected: Adjust range to fit the song
      if (selectedSong && selectedSong.notes && selectedSong.notes.length > 0) {
        const midis = selectedSong.notes.map(n => n.midi);
        const minMidi = Math.min(...midis);
        const maxMidi = Math.max(...midis);
        
        // Add some padding (e.g., 2-3 notes on each side)
        const start = Math.max(21, minMidi - 2);
        const end = Math.min(108, maxMidi + 2);
        
        // Ensure at least an octave or reasonable range
        const finalStart = start;
        const finalEnd = Math.max(start + 12, end);
        
        if (finalStart !== keyboardRange.start || finalEnd !== keyboardRange.end) {
          setKeyboardRange(finalStart, finalEnd);
        }
      } else {
        // Default range for no song
        if (keyboardRange.start !== 48 || keyboardRange.end !== 72) {
          setKeyboardRange(48, 72);
        }
      }
    } else {
      // MIDI connected: Use a standard full range or user setting (defaulting to 48-84)
      if (keyboardRange.start === 48 && keyboardRange.end === 72) {
         setKeyboardRange(48, 84);
      }
    }
  }, [inputs.length, selectedSong, setKeyboardRange, mounted, keyboardRange.start, keyboardRange.end]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => setWindowWidth(window.innerWidth);
      setTimeout(() => setWindowWidth(window.innerWidth), 0);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    if (!isSupported && mounted) {
      console.warn('Web MIDI API is not supported in this browser.');
    }
  }, [isSupported, mounted]);

  useEffect(() => {
    if (lastMessage) {
      initAudio();
      const { command, note, velocity } = lastMessage;
      const status = command & 0xf0;
      if (status === 0x90 && velocity > 0) {
        startNote(note, velocity / 127);
      } else if (status === 0x80 || (status === 0x90 && velocity === 0)) {
        stopNote(note);
      }
    }
  }, [lastMessage]);

  useKeyboardInput(setActiveNotes);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
    setVolume(volume);
    setAudioInstrument(instrument);

    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setTimeout(() => {
        setKeyboardRange(48, 64);
        setShowSidebar(false);
      }, 0);
    }
  }, [instrument, setKeyboardRange, volume]);

  useEffect(() => {
    setAudioInstrument(instrument);
  }, [instrument]);

  const isBlackKey = (midi: number) => [1, 3, 6, 8, 10].includes(midi % 12);
  const whiteKeyCount = Array.from({ length: keyboardRange.end - keyboardRange.start + 1 }, (_, i) => keyboardRange.start + i)
      .filter(midi => !isBlackKey(midi)).length;
  const minCanvasWidth = windowWidth < 768 
    ? Math.max(windowWidth, whiteKeyCount * 32) 
    : '100%';

  const midiProps = {
    activeNotes, setActiveNotes, lastMessage, isSupported, inputs, selectedInputId,
    setSelectedInputId, midiChannel, setMidiChannel, velocityCurve, setVelocityCurve,
    transpose, setTranspose, connectMidi
  };

  if (!mounted) {
    return <div className="flex h-dvh w-full items-center justify-center bg-slate-950 text-slate-500">{t.loading}</div>;
  }

  return (
    <div 
      id="notecascade-app" 
      data-theme={theme}
      className="flex h-dvh w-full flex-col theme-bg-primary theme-text-primary font-sans selection:bg-indigo-500/30 overflow-hidden relative transition-colors duration-500"
    >
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
        connectMidi={connectMidi}
      />

      <main id="main-content" className="flex flex-1 overflow-hidden relative z-10">
        <div style={{ width: windowWidth >= 768 ? sidebarWidth : '100%', position: windowWidth >= 768 ? 'relative' : 'absolute', zIndex: 40, height: '100%' }} className={windowWidth < 768 && !showSidebar ? 'hidden' : ''}>
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
        </div>
        
        <div 
          className="hidden md:flex w-1 hover:w-2 bg-transparent hover:bg-indigo-500/20 cursor-col-resize items-center justify-center transition-all z-50 absolute h-full"
          style={{ left: sidebarWidth }}
          onMouseDown={() => setIsResizing(true)}
        >
           <div className="h-8 w-1 bg-slate-400/50 rounded-full" />
        </div>

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
        {showResult && (
          <ResultModal 
            key="result-modal"
            show={showResult}
            onClose={() => { setShowResult(false); resetSong(); }}
            onRetry={() => { setShowResult(false); resetSong(); togglePlay(); }}
            score={lastScore}
            song={selectedSong}
          />
        )}

        {showSettings && (
          <SettingsModal 
            key="settings-modal"
            show={showSettings}
            onClose={() => setShowSettings(false)}
            volume={volume}
            setVolume={(val) => {
              setVolumeState(val);
              setVolume(val);
            }}
            midiProps={midiProps}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
