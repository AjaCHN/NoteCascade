// app/components/AppContent.tsx v2.5.1
'use client';

import { AppHeader } from './AppHeader';
import { BackgroundEffects } from './BackgroundEffects';
import { GameContainer } from './GameContainer';
import { KeyboardContainer } from './KeyboardContainer';
import { GameModals } from './GameModals';

import { Song } from '../lib/songs/types';
import { PlayMode } from '../lib/store';
import { Translation } from '../lib/translations';
import { MidiDevice, MidiMessage } from '../hooks/use-midi';
import { VelocityCurve } from '../lib/midi-utils';

interface MidiProps {
  activeNotes: Map<number, number>;
  setActiveNotes: React.Dispatch<React.SetStateAction<Map<number, number>>>;
  lastMessage: MidiMessage | null;
  isSupported: boolean;
  inputs: MidiDevice[];
  selectedInputId: string | null;
  setSelectedInputId: (id: string | null) => void;
  midiChannel: number | 'all';
  setMidiChannel: (channel: number | 'all') => void;
  velocityCurve: VelocityCurve;
  setVelocityCurve: (curve: VelocityCurve) => void;
  transpose: number;
  setTranspose: (transpose: number) => void;
  connectMidi: () => void;
  isConnecting: boolean;
}

interface AppContentProps {
  theme: string;
  viewMode: 'waterfall' | 'sheet' | 'numbered' | 'theory';
  setViewMode: (mode: 'waterfall' | 'sheet' | 'numbered' | 'theory') => void;
  selectedInputId: string | null;
  inputs: MidiDevice[];
  setShowSettings: (show: boolean) => void;
  showSettings: boolean;
  setShowLibrary: (show: boolean) => void;
  showLibrary: boolean;
  connectMidi: () => void;
  isConnecting: boolean;
  isFullScreen: boolean;
  toggleFullScreen: () => void;
  canvasContainerRef: React.RefObject<HTMLDivElement | null>;
  selectedSong: Song | null;
  currentTime: number;
  activeNotes: Map<number, number>;
  isPlaying: boolean;
  setLastScore: (score: { perfect: number; good: number; miss: number; wrong: number; currentScore: number } | null) => void;
  keyboardRange: { start: number; end: number };
  showNoteNames: boolean;
  containerSize: { width: number; height: number };
  playMode: PlayMode;
  countdown: number | null;
  hasPressedKey: boolean;
  t: Translation;
  resetSong: () => void;
  togglePlay: () => void;
  handleNextSong: () => void;
  showKeymap: boolean;
  keyboardType: '88' | '61' | '49' | '32' | 'virtual';
  setActiveNotes: React.Dispatch<React.SetStateAction<Map<number, number>>>;
  showResult: boolean;
  setShowResult: (show: boolean) => void;
  lastScore: { perfect: number; good: number; miss: number; wrong: number; currentScore: number } | null;
  setSelectedSong: (song: Song | null) => void;
  setPlayMode: (mode: PlayMode) => void;
  setHasPressedKey: (pressed: boolean) => void;
  setCountdown: (countdown: number | null) => void;
  midiProps: MidiProps;
  volume: number;
  setVolume: (val: number) => void;
}

export function AppContent({
  theme,
  viewMode,
  setViewMode,
  selectedInputId,
  inputs,
  setShowSettings,
  showSettings,
  setShowLibrary,
  showLibrary,
  connectMidi,
  isConnecting,
  isFullScreen,
  toggleFullScreen,
  canvasContainerRef,
  selectedSong,
  currentTime,
  activeNotes,
  isPlaying,
  setLastScore,
  keyboardRange,
  showNoteNames,
  containerSize,
  playMode,
  countdown,
  hasPressedKey,
  t,
  resetSong,
  togglePlay,
  handleNextSong,
  showKeymap,
  keyboardType,
  setActiveNotes,
  showResult,
  setShowResult,
  lastScore,
  setSelectedSong,
  setPlayMode,
  setHasPressedKey,
  setCountdown,
  midiProps,
  volume,
  setVolume,
}: AppContentProps) {
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
        <GameContainer
          canvasContainerRef={canvasContainerRef}
          viewMode={viewMode}
          selectedSong={selectedSong}
          currentTime={currentTime}
          activeNotes={activeNotes}
          isPlaying={isPlaying}
          setLastScore={setLastScore}
          keyboardRange={keyboardRange}
          showNoteNames={showNoteNames}
          theme={theme}
          containerSize={containerSize}
          playMode={playMode}
          countdown={countdown}
          hasPressedKey={hasPressedKey}
          t={t}
          resetSong={resetSong}
          togglePlay={togglePlay}
          handleNextSong={handleNextSong}
        />
        <KeyboardContainer
          activeNotes={activeNotes}
          keyboardRange={keyboardRange}
          showNoteNames={showNoteNames}
          showKeymap={showKeymap}
          keyboardType={keyboardType}
          setActiveNotes={setActiveNotes}
        />
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
        setVolume={setVolume}
      />
    </div>
  );
}
