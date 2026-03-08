// app/components/AppRoot.tsx v2.5.1
'use client';

import { useState, useEffect, useRef } from 'react';
import { useMidi } from '../hooks/use-midi';
import { useKeyboardInput } from '../hooks/use-keyboard-input';
import { useAppActions, useLocale, useTheme, useKeyboardRange, useShowNoteNames, useShowKeymap, useIsRangeManuallySet, useAppStore, useKeyboardType } from '../lib/store';
import { builtInSongs } from '../lib/songs';
import { translations } from '../lib/translations';
import { useGameLogic } from '../hooks/use-game-logic';
import { usePlayMode } from '../lib/store';
import { useAppInitialization } from '../hooks/use-app-initialization';
import { useKeyboardRangeLogic } from '../hooks/use-keyboard-range-logic';
import { useUIState } from '../hooks/use-ui-state';
import { useCountdownAndPrompts } from '../hooks/use-countdown-and-prompts';
import { useWakeLock } from '../hooks/useWakeLock';
import { AppContent } from './AppContent';

export default function AppRoot() {
  const { 
    activeNotes, setActiveNotes, inputs, lastMessage, isSupported, isConnecting,
    selectedInputId, setSelectedInputId, midiChannel, setMidiChannel,
    velocityCurve, setVelocityCurve, transpose, setTranspose, connectMidi
  } = useMidi();
  const { setKeyboardRange, setPlayMode, setSongs } = useAppActions();
  const songs = useAppStore(state => state.songs);
  const keyboardType = useKeyboardType();
  
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
  const { mounted } = useAppInitialization();
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

  const midiProps = {
    activeNotes, setActiveNotes, lastMessage, isSupported, inputs, selectedInputId,
    setSelectedInputId, midiChannel, setMidiChannel, velocityCurve, setVelocityCurve,
    transpose, setTranspose, connectMidi, isConnecting
  };

  if (!mounted) {
    return <div className="flex h-dvh w-full items-center justify-center bg-slate-950 text-slate-500">Loading...</div>;
  }

  return (
    <AppContent
      theme={theme}
      viewMode={viewMode}
      setViewMode={setViewMode}
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
      canvasContainerRef={canvasContainerRef}
      selectedSong={selectedSong}
      currentTime={currentTime}
      activeNotes={activeNotes}
      isPlaying={isPlaying}
      setLastScore={setLastScore}
      keyboardRange={keyboardRange}
      showNoteNames={showNoteNames}
      containerSize={containerSize}
      playMode={playMode}
      countdown={countdown}
      hasPressedKey={hasPressedKey}
      t={t}
      resetSong={resetSong}
      togglePlay={togglePlay}
      handleNextSong={handleNextSong}
      showKeymap={showKeymap}
      keyboardType={keyboardType}
      setActiveNotes={setActiveNotes}
      showResult={showResult}
      setShowResult={setShowResult}
      lastScore={lastScore}
      setSelectedSong={setSelectedSong}
      setPlayMode={setPlayMode}
      setHasPressedKey={setHasPressedKey}
      setCountdown={setCountdown}
      midiProps={midiProps}
      volume={volume}
      setVolume={(val: number) => {
        setVolumeState(val);
      }}
    />
  );
}
