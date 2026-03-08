// app/components/GameContainer.tsx v2.5.0
'use client';

import React from 'react';
import { GameViews } from './GameViews';
import { GameOverlays } from './GameOverlays';
import { FloatingControls } from './FloatingControls';
import { Song } from '../lib/songs/types';
import { Translation } from '../lib/translations';
import { PlayMode } from '../lib/store';

interface GameContainerProps {
  canvasContainerRef: React.RefObject<HTMLDivElement | null>;
  viewMode: 'waterfall' | 'sheet' | 'numbered' | 'theory';
  selectedSong: Song | null;
  currentTime: number;
  activeNotes: Map<number, number>;
  isPlaying: boolean;
  setLastScore: (score: { perfect: number; good: number; miss: number; wrong: number; currentScore: number } | null) => void;
  keyboardRange: { start: number; end: number };
  showNoteNames: boolean;
  theme: string;
  containerSize: { width: number; height: number };
  playMode: PlayMode;
  countdown: number | null;
  hasPressedKey: boolean;
  t: Translation;
  resetSong: () => void;
  togglePlay: () => void;
  handleNextSong: () => void;
}

export function GameContainer({
  canvasContainerRef, viewMode, selectedSong, currentTime, activeNotes, isPlaying,
  setLastScore, keyboardRange, showNoteNames, theme, containerSize, playMode,
  countdown, hasPressedKey, t, resetSong, togglePlay, handleNextSong
}: GameContainerProps) {
  return (
    <section id="game-section" className="relative flex flex-1 flex-col overflow-hidden bg-transparent overflow-x-auto custom-scrollbar">
      <div className="flex-1 flex flex-col min-h-0 relative">
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
      </div>
    </section>
  );
}
