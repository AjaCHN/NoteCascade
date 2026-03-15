// app/components/GameCanvas.tsx v2.3.1
'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Song } from '../lib/songs';
import { useLocale, usePlayMode } from '../lib/store';
import { translations } from '../lib/translations';
import { GameStatsOverlay } from './GameStatsOverlay';
import { useGameEngine } from '../hooks/use-game-engine';
import { useGameRenderer } from '../hooks/use-game-renderer';

interface GameCanvasProps {
  song: Song;
  currentTime: number;
  activeNotes: Map<number, number>;
  onScoreUpdate: (score: { perfect: number; good: number; miss: number; wrong: number; currentScore: number }) => void;
  isPlaying: boolean;
  showResult?: boolean;
  keyboardRange: { start: number; end: number };
  showNoteNames: boolean;
  theme: string;
  controls?: {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    onReset: () => void;
    onRetry: () => void;
    onTogglePlay: () => void;
    onNextSong: () => void;
  };
}

function isBlackKey(midi: number): boolean {
  const noteClass = midi % 12;
  return [1, 3, 6, 8, 10].includes(noteClass);
}

export function GameCanvas({ 
  song, 
  currentTime, 
  activeNotes, 
  onScoreUpdate, 
  isPlaying,
  showResult = false,
  keyboardRange,
  showNoteNames,
  theme,
  controls
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const locale = useLocale();
  const playMode = usePlayMode();
  const t = translations[locale] || translations.en;

  const keyGeometries = useMemo(() => {
    const geometries = new Map<number, { x: number, width: number, isBlack: boolean }>();
    let whiteKeysCount = 0;
    for (let i = keyboardRange.start; i <= keyboardRange.end; i++) {
      if (!isBlackKey(i)) whiteKeysCount++;
    }
    
    const whiteKeyWidth = dimensions.width / whiteKeysCount;
    let whiteKeyIndex = 0;
    
    for (let midi = keyboardRange.start; midi <= keyboardRange.end; midi++) {
      const isBlack = isBlackKey(midi);
      let x = 0;
      let width = 0;
      
      if (!isBlack) {
        x = whiteKeyIndex * whiteKeyWidth;
        width = whiteKeyWidth;
        whiteKeyIndex++;
      } else {
        x = (whiteKeyIndex - 1) * whiteKeyWidth + (whiteKeyWidth * 0.65);
        width = whiteKeyWidth * 0.7;
      }
      
      geometries.set(midi, { x, width, isBlack });
    }
    return geometries;
  }, [keyboardRange.start, keyboardRange.end, dimensions.width]);

  const { score, recentHits, hitEffects, activeNoteStatus } = useGameEngine(
    song,
    currentTime,
    activeNotes,
    isPlaying,
    keyboardRange,
    dimensions,
    keyGeometries,
    onScoreUpdate,
    playMode,
    showResult
  );

  useGameRenderer(
    canvasRef,
    song,
    currentTime,
    dimensions,
    activeNotes,
    keyboardRange,
    keyGeometries,
    theme,
    t,
    showNoteNames,
    recentHits,
    hitEffects,
    activeNoteStatus,
    playMode
  );

  useEffect(() => {
    if (!containerRef.current) return;
    let timeoutId: NodeJS.Timeout;

    const observer = new ResizeObserver((entries) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          setDimensions({ width, height });
          if (canvasRef.current) {
            canvasRef.current.width = width;
            canvasRef.current.height = height;
          }
        }
      }, 50);
    });

    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative h-full w-full overflow-hidden ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-950'}`}>
      <canvas ref={canvasRef} className="h-full w-full" />
      {playMode !== 'free-play' && (
        <GameStatsOverlay 
          song={song} 
          score={score} 
          t={t} 
          recentHits={recentHits.current}
          controls={controls}
        />
      )}
    </div>
  );
}
