// app/components/GameModals.tsx v2.3.3
'use client';

import { SettingsModal } from './SettingsModal';
import { LibraryModal } from './LibraryModal';
import { ResultModal } from './ResultModal';
import { AuthModal } from './AuthModal';

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
}: any) {
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
      {showResult && lastScore && selectedSong && (
        <ResultModal 
          show={showResult} 
          onClose={() => setShowResult(false)} 
          onRetry={() => {
            setShowResult(false);
            resetSong();
            togglePlay();
          }}
          score={lastScore}
          song={selectedSong}
        />
      )}
    </>
  );
}
