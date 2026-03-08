// app/components/GameModals.tsx v2.4.4
'use client';

import { useMemo } from 'react';
import { SettingsModal } from './SettingsModal';
import { LibraryModal } from './LibraryModal';
import { ResultModal } from './ResultModal';
import type { Song } from '../lib/songs/types';
import type { PlayMode } from '../lib/store';
import type { VelocityCurve } from '../lib/midi-utils';

interface GameModalsProps {
  showResult: boolean;
  setShowResult: (show: boolean) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  showLibrary: boolean;
  setShowLibrary: (show: boolean) => void;
  lastScore: { perfect: number; good: number; miss: number; wrong: number; currentScore: number } | null;
  selectedSong: Song | null;
  resetSong: () => void;
  togglePlay: () => void;
  setSelectedSong: (song: Song) => void;
  setPlayMode: (mode: PlayMode) => void;
  setHasPressedKey: (has: boolean) => void;
  setCountdown: (val: number | null) => void;
  midiProps: {
    activeNotes: Map<number, number>;
    setActiveNotes: (notes: Map<number, number> | ((prev: Map<number, number>) => Map<number, number>)) => void;
    lastMessage: { command: number; channel: number; note: number; velocity: number; timestamp: number } | null;
    isSupported: boolean;
    inputs: { id: string; name: string }[];
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
  };
  volume: number;
  setVolume: (val: number) => void;
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
  midiProps,
  volume,
  setVolume
}: GameModalsProps) {
  const scoreRecord = useMemo(() => {
    if (!lastScore || !selectedSong) return null;
    return {
      songId: selectedSong.id,
      score: lastScore.currentScore,
      perfect: lastScore.perfect,
      good: lastScore.good,
      miss: lastScore.miss,
      wrong: lastScore.wrong,
      maxScore: 0,
      accuracy: 0,
      maxCombo: 0,
      date: 0
    };
  }, [lastScore, selectedSong]);

  return (
    <>
      {showSettings && (
        <SettingsModal 
          show={showSettings} 
          onClose={() => setShowSettings(false)} 
          midiProps={midiProps}
          volume={volume}
          setVolume={setVolume}
        />
      )}
      {showLibrary && (
        <LibraryModal 
          show={showLibrary} 
          onClose={() => setShowLibrary(false)} 
          selectedSongId={selectedSong?.id || ''}
          onPlayPractice={(song) => {
            setSelectedSong(song);
            setPlayMode('practice');
            setHasPressedKey(false);
            setCountdown(null);
            setShowLibrary(false);
          }}
          onPlayDemo={(song) => {
            setSelectedSong(song);
            setPlayMode('demo');
            setHasPressedKey(false);
            setCountdown(null);
            setShowLibrary(false);
          }}
        />
      )}
      {showResult && scoreRecord && selectedSong && (
        <ResultModal 
          show={showResult} 
          onClose={() => setShowResult(false)} 
          onRetry={() => {
            setShowResult(false);
            resetSong();
            togglePlay();
          }}
          score={scoreRecord}
          song={selectedSong}
        />
      )}
    </>
  );
}
