// app/components/AppRoot.tsx v2.4.2
'use client';

import { useState, useEffect, useRef } from 'react';
import { useMidi } from '../hooks/use-midi';
import { useKeyboardInput } from '../hooks/use-keyboard-input';
import { setVolume } from '../lib/audio';
import { useAppActions, useLocale, useTheme, useKeyboardRange, useShowNoteNames, useShowKeymap, useIsRangeManuallySet, useAppStore, useKeyboardType } from '../lib/store';
import { builtInSongs } from '../lib/songs';
import { translations } from '../lib/translations';
import { Keyboard } from './Keyboard';
import { AppHeader } from './AppHeader';
import { FloatingControls } from './FloatingControls';
import { GameOverlays } from './GameOverlays';
import { GameModals } from './GameModals';
import { BackgroundEffects } from './BackgroundEffects';
import { useGameLogic } from '../hooks/use-game-logic';
import { usePlayMode } from '../lib/store';
import { useAppInitialization } from '../hooks/use-app-initialization';
import { useKeyboardRangeLogic } from '../hooks/use-keyboard-range-logic';
import { useUIState } from '../hooks/use-ui-state';
import { useCountdownAndPrompts } from '../hooks/use-countdown-and-prompts';
import { GameViews } from './GameViews';
import { useWakeLock } from '../hooks/useWakeLock';

export default function AppRoot() {
  const { 
    activeNotes, setActiveNotes, inputs, lastMessage, isSupported, isConnecting,
    selectedInputId, setSelectedInputId, midiChannel, setMidiChannel,
    velocityCurve, setVelocityCurve, transpose, setTranspose, connectMidi
  } = useMidi();
  const { setKeyboardRange, setPlayMode, setSongs } = useAppActions();
  const songs = useAppStore(state => state.songs);
  const keyboardType = useKeyboardType();
  
  // Updated viewMode state type
  const [viewMode, setViewMode] = useState<'waterfall' | 'sheet' | 'numbered' | 'theory'>('waterfall');
  
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setSongs(builtInSongs);
  }, [setSongs]);

  useEffect(() => {
    if (!canvasContainerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(canvasContainerRef.current);
    return () => observer.disconnect();
  }, []);

  const locale = useLocale();
  const theme = useTheme();
  const playMode = usePlayMode();
  const keyboardRange = useKeyboardRange();
  const showNoteNames = useShowNoteNames();
  const showKeymap = useShowKeymap();
  const isRangeManuallySet = useIsRangeManuallySet();
  const t = translations[locale] || translations.en;
  
  const {
    selectedSong, setSelectedSong, isPlaying, currentTime, showResult, setShowResult,
    lastScore, setLastScore, togglePlay, resetSong, handleNextSong
  } = useGameLogic(activeNotes, setActiveNotes, songs);

  const [volume, setVolumeState] = useState(80);
  const { mounted, windowWidth } = useAppInitialization();
  useWakeLock(mounted);
  const { 
    showSettings, setShowSettings, 
    showLibrary, setShowLibrary, 
    isFullScreen, toggleFullScreen 
  } = useUIState();
  const { countdown, setCountdown, hasPressedKey, setHasPressedKey } = useCountdownAndPrompts(isPlaying, togglePlay, activeNotes.size, playMode);

  useKeyboardRangeLogic(mounted, isRangeManuallySet, inputs.length, selectedSong, keyboardRange, setKeyboardRange);
  useKeyboardInput(setActiveNotes, keyboardType === 'virtual');

  useEffect(() => {
    if (!isSupported && mounted) {
      console.warn('Web MIDI API is not supported in this browser.');
    }
  }, [isSupported, mounted]);

  const isBlackKey = (midi: number) => [1, 3, 6, 8, 10].includes(midi % 12);
  const whiteKeyCount = Array.from({ length: keyboardRange.end - keyboardRange.start + 1 }, (_, i) => keyboardRange.start + i)
      .filter(midi => !isBlackKey(midi)).length;
  const minCanvasWidth = mounted && windowWidth < 768 
    ? Math.max(windowWidth, whiteKeyCount * 32) 
    : '100%';

  const midiProps = {
    activeNotes, setActiveNotes, lastMessage, isSupported, inputs, selectedInputId,
    setSelectedInputId, midiChannel, setMidiChannel, velocityCurve, setVelocityCurve,
    transpose, setTranspose, connectMidi, isConnecting
  };

  if (!mounted) {
    return <div className="flex h-dvh w-full items-center justify-center bg-slate-950 text-slate-500">Loading...</div>;
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
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <main id="main-content" className="flex flex-1 overflow-hidden relative z-10">
        <section id="game-section" className="relative flex flex-1 flex-col overflow-hidden bg-transparent overflow-x-auto custom-scrollbar">
          <div className="flex-1 flex flex-col min-h-0 relative" style={{ minWidth: typeof minCanvasWidth === 'number' ? `${minCanvasWidth}px` : minCanvasWidth }}>
            <div id="game-canvas-container" ref={canvasContainerRef} className="flex-1 relative min-h-0">
              
              <GameViews 
                viewMode={viewMode}
                selectedSong={selectedSong}
                currentTime={currentTime}
                activeNotes={activeNotes}
                isPlaying={isPlaying}
                onScoreUpdate={setLastScore}
                keyboardRange={keyboardRange}
                showNoteNames={showNoteNames}
                theme={theme}
                containerSize={containerSize}
                playMode={playMode}
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

            <div 
              id="keyboard-wrapper" 
              className={`shrink-0 relative z-20 h-24 md:h-32 border-t theme-border ${
                keyboardType !== 'virtual' ? 'pointer-events-none opacity-80' : ''
              }`}
            >
              <Keyboard 
                activeNotes={activeNotes} 
                startNote={keyboardRange.start} 
                endNote={keyboardRange.end} 
                showNoteNames={showNoteNames}
                showKeymap={showKeymap && keyboardType === 'virtual'}
                keyMap={keyboardType === 'virtual' ? {
                  'z': 48, 's': 49, 'x': 50, 'd': 51, 'c': 52, 'v': 53, 'g': 54, 'b': 55, 'h': 56, 'n': 57, 'j': 58, 'm': 59,
                  'q': 60, '2': 61, 'w': 62, '3': 63, 'e': 64, 'r': 65, '5': 66, 't': 67, '6': 68, 'y': 69, '7': 70, 'u': 71,
                  'i': 72, '9': 73, 'o': 74, '0': 75, 'p': 76
                } : {}}
                onNoteOn={(midi) => {
                  if (keyboardType === 'virtual') {
                    setActiveNotes(prev => new Map(prev).set(midi, 0.7));
                  }
                }}
                onNoteOff={(midi) => {
                  if (keyboardType === 'virtual') {
                    setActiveNotes(prev => { const next = new Map(prev); next.delete(midi); return next; });
                  }
                }}
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
        volume={volume}
        setVolume={(val: number) => {
          setVolumeState(val);
          setVolume(val);
        }}
      />
    </div>
  );
}
