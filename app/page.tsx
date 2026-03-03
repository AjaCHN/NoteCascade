// app/page.tsx v1.7.2
'use client';

import React, { useState, useEffect } from 'react';
import { useMidi } from './hooks/use-midi';
import { useKeyboardInput } from './hooks/use-keyboard-input';
import { setVolume } from './lib/audio';
import { useAppActions, useLocale, useTheme, useInstrument, useKeyboardRange, useShowNoteNames, useShowKeymap, useIsRangeManuallySet } from './lib/store';
import { translations } from './lib/translations';
import { Keyboard } from './components/Keyboard';
import { GameCanvas } from './components/GameCanvas';
import { AppHeader } from './components/AppHeader';
import { FloatingControls } from './components/FloatingControls';
import { GameOverlays } from './components/GameOverlays';
import { BackgroundEffects } from './components/BackgroundEffects';
import { useGameLogic } from './hooks/use-game-logic';
import { usePlayMode } from './lib/store';
import { useAppInitialization } from './hooks/use-app-initialization';
import { useKeyboardRangeLogic } from './hooks/use-keyboard-range-logic';
import { useUIState } from './hooks/use-ui-state';
import { useCountdownAndPrompts } from './hooks/use-countdown-and-prompts';
import { useMidiAudioBridge } from './hooks/use-midi-audio-bridge';
import { GameModals } from './components/GameModals';

export default function MidiPlayApp() {
  const { 
    activeNotes, setActiveNotes, inputs, lastMessage, isSupported, isConnecting,
    selectedInputId, setSelectedInputId, midiChannel, setMidiChannel,
    velocityCurve, setVelocityCurve, transpose, setTranspose, connectMidi
  } = useMidi();
  const { setKeyboardRange, setPlayMode } = useAppActions();

  const locale = useLocale();
  const theme = useTheme();
  const instrument = useInstrument();
  const playMode = usePlayMode();
  const keyboardRange = useKeyboardRange();
  const showNoteNames = useShowNoteNames();
  const showKeymap = useShowKeymap();
  const isRangeManuallySet = useIsRangeManuallySet();
  const t = translations[locale] || translations.en;
  
  const {
    selectedSong, setSelectedSong, isPlaying, currentTime, showResult, setShowResult,
    lastScore, setLastScore, togglePlay, resetSong, handleNextSong
  } = useGameLogic(activeNotes, setActiveNotes);

  const [volume, setVolumeState] = useState(80);
  const { mounted, windowWidth } = useAppInitialization(volume, instrument);
  const { 
    showSettings, setShowSettings, 
    showLibrary, setShowLibrary, 
    isFullScreen, toggleFullScreen 
  } = useUIState();
  const { countdown, setCountdown, hasPressedKey, setHasPressedKey } = useCountdownAndPrompts(isPlaying, togglePlay, activeNotes.size, playMode);

  useKeyboardRangeLogic(mounted, isRangeManuallySet, inputs.length, selectedSong, keyboardRange, setKeyboardRange);
  useMidiAudioBridge(lastMessage);
  useKeyboardInput(setActiveNotes);

  useEffect(() => {
    if (!isSupported && mounted) {
      console.warn('Web MIDI API is not supported in this browser.');
    }
  }, [isSupported, mounted]);

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
        showSettings={showSettings}
        setShowLibrary={setShowLibrary}
        showLibrary={showLibrary}
        connectMidi={connectMidi}
        isConnecting={isConnecting}
        isFullScreen={isFullScreen}
        toggleFullScreen={toggleFullScreen}
        volume={volume}
        setVolume={(val) => {
          setVolumeState(val);
          setVolume(val);
        }}
      />

      <main id="main-content" className="flex flex-1 overflow-hidden relative z-10">
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

              <GameOverlays 
                countdown={countdown}
                playMode={playMode}
                hasPressedKey={hasPressedKey}
                isPlaying={isPlaying}
                t={t}
              />

              <FloatingControls 
                playMode={playMode}
                isPlaying={isPlaying}
                currentTime={currentTime}
                selectedSong={selectedSong}
                resetSong={resetSong}
                togglePlay={togglePlay}
                handleNextSong={handleNextSong}
                t={t}
              />
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
              />
            </div>
          </div>
        </section>
      </main>

      <GameModals
        showResult={showResult}
        setShowResult={setShowResult}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        showLibrary={showLibrary}
        setShowLibrary={setShowLibrary}
        lastScore={lastScore}
        selectedSong={selectedSong}
        resetSong={resetSong}
        togglePlay={togglePlay}
        setSelectedSong={setSelectedSong}
        setPlayMode={setPlayMode}
        setHasPressedKey={setHasPressedKey}
        setCountdown={setCountdown}
        midiProps={midiProps}
      />
    </div>
  );
}
