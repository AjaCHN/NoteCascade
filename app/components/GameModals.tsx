// app/components/GameModals.tsx v2.0.1
'use client';

import { AnimatePresence } from 'motion/react';
import { ResultModal } from './ResultModal';
import { SettingsModal } from './SettingsModal';
import { LibraryModal } from './LibraryModal';
import { Song } from '../lib/songs/types';
import { ScoreRecord, PlayMode } from '../lib/store/types';
import { MidiDevice, MidiMessage } from '../hooks/use-midi';
import { VelocityCurve } from '../lib/midi-utils';

interface GameModalsProps {
  showResult: boolean;
  setShowResult: (show: boolean) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  showLibrary: boolean;
  setShowLibrary: (show: boolean) => void;
  lastScore: ScoreRecord;
  selectedSong: Song;
  resetSong: () => void;
  togglePlay: () => void;
  setSelectedSong: (song: Song) => void;
  setPlayMode: (mode: PlayMode) => void;
  setHasPressedKey: (hasPressed: boolean) => void;
  setCountdown: (countdown: number) => void;
  midiProps: {
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
    connectMidi: (isMounted?: () => boolean) => Promise<boolean>;
    isConnecting: boolean;
  };
}

export function GameModals({
  showResult,
  setShowResult,
  showSettings,
  setShowSettings,
  showLibrary,
  setShowLibrary,
  lastScore,
  selectedSong,
  resetSong,
  togglePlay,
  setSelectedSong,
  setPlayMode,
  setHasPressedKey,
  setCountdown,
  midiProps
}: GameModalsProps) {
  return (
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
          midiProps={midiProps}
        />
      )}

      {showLibrary && (
        <LibraryModal
          key="library-modal"
          show={showLibrary}
          onClose={() => setShowLibrary(false)}
          onPlayPractice={(song) => {
            setSelectedSong(song);
            resetSong();
            setPlayMode('practice');
            setHasPressedKey(false);
          }}
          onPlayDemo={(song) => {
            setSelectedSong(song);
            resetSong();
            setPlayMode('demo');
            setCountdown(5);
          }}
          selectedSongId={selectedSong.id}
        />
      )}
    </AnimatePresence>
  );
}
