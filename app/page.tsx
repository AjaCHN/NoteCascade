// app/page.tsx v1.4.7
'use client';

import React, { useState, useEffect } from 'react';
import { useMidi } from './hooks/use-midi';
import { useKeyboardInput } from './hooks/use-keyboard-input';
import { startNote, stopNote, setVolume, setAudioInstrument } from './lib/audio';
import { useAppActions, useLocale, useTheme, useInstrument, useKeyboardRange, useShowNoteNames, useShowKeymap, usePlayMode } from './lib/store';
import { translations } from './lib/translations';
import { Keyboard } from './components/Keyboard';
import { GameCanvas } from './components/GameCanvas';
import { AnimatePresence } from 'motion/react';
import { SettingsModal } from './components/SettingsModal';
import { ResultModal } from './components/ResultModal';
import { AchievementModal } from './components/AchievementModal';
import { AppHeader } from './components/AppHeader';
import { SongSelector } from './components/SongSelector';
import { UsageTips } from './components/UsageTips';
import { BackgroundEffects } from './components/BackgroundEffects';
import { useGameLogic } from './hooks/use-game-logic';

export default function MidiPlayApp() {
  const { 
    activeNotes, setActiveNotes, lastMessage, isSupported, isConnecting, inputs, selectedInputId,
    setSelectedInputId, midiChannel, setMidiChannel, velocityCurve, setVelocityCurve,
    transpose, setTranspose, connectMidi
  } = useMidi();
  const { setKeyboardRange, setPlayMode } = useAppActions();
  const locale = useLocale();
  const theme = useTheme();
  const instrument = useInstrument();
  const playMode = usePlayMode();
  const keyboardRange = useKeyboardRange();
  const showNoteNames = useShowNoteNames();
  const showKeymap = useShowKeymap();
  const t = translations[locale] || translations.en;
  
  const {
    selectedSong, setSelectedSong, isPlaying, currentTime, showResult, setShowResult,
    lastScore, setLastScore, togglePlay, resetSong, handleNextSong
  } = useGameLogic(activeNotes, setActiveNotes);

  const [showSettings, setShowSettings] = useState(false);
  const [activeSettingsSection, setActiveSettingsSection] = useState<'general' | 'audio' | 'keyboard' | 'midi' | 'about'>('general');
  const [showAchievements, setShowAchievements] = useState(false);
  const [volume, setVolumeState] = useState(80);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [mounted, setMounted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isRangeManuallySet, setIsRangeManuallySet] = useState(false);

  // Initial setup and audio sync
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mounted) {
      setAudioInstrument(instrument);
    }
  }, [instrument, mounted]);

  useEffect(() => {
    if (mounted) {
      setVolume(volume);
    }
  }, [volume, mounted]);

  // Dynamic keyboard range logic
  useEffect(() => {
    if (!mounted || isRangeManuallySet) return;

    const hasMidi = inputs.length > 0;
    
    if (hasMidi) {
      if (keyboardRange.start !== 21 || keyboardRange.end !== 108) {
         setKeyboardRange(21, 108);
      }
      return;
    }

    if (windowWidth < 768) {
      if (keyboardRange.start !== 48 || keyboardRange.end !== 72) {
        setKeyboardRange(48, 72);
      }
      return;
    }

    // No MIDI connected: Adjust range to fit the song
    if (selectedSong && selectedSong.notes && selectedSong.notes.length > 0) {
      const midis = selectedSong.notes.map(n => n.midi);
      const minMidi = Math.min(...midis);
      const maxMidi = Math.max(...midis);
      
      let start = Math.max(21, minMidi - 2);
      let end = Math.min(108, maxMidi + 2);
      
      while ([1, 3, 6, 8, 10].includes(start % 12) && start > 21) {
        start--;
      }
      while ([1, 3, 6, 8, 10].includes(end % 12) && end < 108) {
        end++;
      }
      
      const finalStart = start;
      let finalEnd = Math.max(start + 24, end); 

      while ([1, 3, 6, 8, 10].includes(finalEnd % 12) && finalEnd < 108) {
        finalEnd++;
      }
      
      if (finalStart !== keyboardRange.start || finalEnd !== keyboardRange.end) {
        setKeyboardRange(finalStart, finalEnd);
      }
    } else {
      if (keyboardRange.start !== 48 || keyboardRange.end !== 72) {
        setKeyboardRange(48, 72);
      }
    }
  }, [inputs.length, selectedSong, mounted, isRangeManuallySet, windowWidth, keyboardRange.start, keyboardRange.end, setKeyboardRange]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

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
      const { command, note, velocity } = lastMessage;
      const status = command & 0xf0;
      if (status === 0x90 && velocity > 0) {
        startNote(note, velocity / 127);
      } else if (status === 0x80 || (status === 0x90 && velocity === 0)) {
        stopNote(note);
      }
    }
  }, [lastMessage]);

  useKeyboardInput(setActiveNotes, inputs.length > 0);


  const isBlackKey = (midi: number) => [1, 3, 6, 8, 10].includes(midi % 12);
  const whiteKeyCount = Array.from({ length: keyboardRange.end - keyboardRange.start + 1 }, (_, i) => keyboardRange.start + i)
      .filter(midi => !isBlackKey(midi)).length;
  const minCanvasWidth = windowWidth < 768 
    ? Math.max(windowWidth, whiteKeyCount * 32) 
    : '100%';

  const midiProps = {
    activeNotes, setActiveNotes, lastMessage, isSupported, inputs, selectedInputId,
    setSelectedInputId, midiChannel, setMidiChannel, velocityCurve, setVelocityCurve,
    transpose, setTranspose, connectMidi, isConnecting
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
      <BackgroundEffects theme={theme} />

      <AppHeader 
        theme={theme}
        selectedInputId={selectedInputId}
        inputs={inputs}
        setShowSettings={setShowSettings}
        setActiveSettingsSection={setActiveSettingsSection}
        showSettings={showSettings}
        setShowAchievements={setShowAchievements}
        showAchievements={showAchievements}
        connectMidi={connectMidi}
        isConnecting={isConnecting}
        isFullScreen={isFullScreen}
        toggleFullScreen={toggleFullScreen}
      />

      <UsageTips />

      <main id="main-content" className="flex flex-1 overflow-hidden relative z-10">
        <section id="game-section" className="relative flex flex-1 flex-col overflow-hidden bg-transparent overflow-x-auto custom-scrollbar">
          <div className="flex-1 flex flex-col min-h-0 relative" style={{ minWidth: typeof minCanvasWidth === 'number' ? `${minCanvasWidth}px` : minCanvasWidth }}>
            <div id="game-canvas-container" className="flex-1 relative min-h-0">
              {playMode === 'library' ? (
                <div className="h-full w-full overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-950/50">
                  <SongSelector 
                    onSelect={(song, mode) => {
                      setSelectedSong(song);
                      resetSong();
                      setPlayMode(mode || 'practice'); // Switch to practice mode when song selected
                    }}
                    selectedSongId={selectedSong.id}
                  />
                </div>
              ) : (
                <>
                  <GameCanvas
                    song={selectedSong}
                    currentTime={currentTime}
                    activeNotes={activeNotes}
                    isPlaying={isPlaying}
                    onScoreUpdate={setLastScore}
                    keyboardRange={keyboardRange}
                    showNoteNames={showNoteNames}
                    theme={theme}
                    controls={{
                      isPlaying,
                      currentTime,
                      duration: selectedSong.duration || 0,
                      onReset: resetSong,
                      onRetry: () => { resetSong(); togglePlay(); },
                      onTogglePlay: togglePlay,
                      onNextSong: handleNextSong
                    }}
                  />
                </>
              )}
            </div>

            <div id="keyboard-wrapper" className="shrink-0 relative z-20 h-24 md:h-32 border-t theme-border">
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
                isMidiConnected={inputs.length > 0}
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
            activeSection={activeSettingsSection}
            onClose={() => setShowSettings(false)}
            midiProps={midiProps}
            setIsRangeManuallySet={setIsRangeManuallySet}
            volume={volume}
            setVolume={(val) => {
              setVolumeState(val);
              setVolume(val);
            }}
          />
        )}

        {showAchievements && (
          <AchievementModal
            key="achievement-modal"
            show={showAchievements}
            onClose={() => setShowAchievements(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
