// app/components/GameCanvas.tsx v2.4.1
'use client';

import React, { useRef, useMemo } from 'react';
import type { Song } from '../lib/songs/types';
import { useGameRenderer } from '../hooks/use-game-renderer';
import { useGameEngine } from '../hooks/use-game-engine';
import { useTranslation } from '../lib/translations';
import { useLocale, PlayMode } from '../lib/store';

interface GameCanvasProps {
  song: Song;
  currentTime: number;
  activeNotes: Map<number, number>;
  isPlaying: boolean;
  onScoreUpdate: (score: { perfect: number; good: number; miss: number; wrong: number; currentScore: number }) => void;
  keyboardRange: { start: number; end: number };
  showNoteNames: boolean;
  theme: string;
  dimensions: { width: number; height: number };
  playMode: PlayMode;
}

export function GameCanvas({
  song,
  currentTime,
  activeNotes,
  isPlaying,
  onScoreUpdate,
  keyboardRange,
  showNoteNames,
  theme,
  dimensions,
  playMode
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const locale = useLocale();
  const { t } = useTranslation(locale);

  // Calculate key geometries
  const keyGeometries = useMemo(() => {
    const map = new Map<number, { x: number, width: number, isBlack: boolean }>();
    const whiteKeys = [];
    for (let i = keyboardRange.start; i <= keyboardRange.end; i++) {
      if (![1, 3, 6, 8, 10].includes(i % 12)) {
        whiteKeys.push(i);
      }
    }
    const whiteKeyWidth = dimensions.width / whiteKeys.length;

    let whiteKeyIndex = 0;
    for (let i = keyboardRange.start; i <= keyboardRange.end; i++) {
      const isBlack = [1, 3, 6, 8, 10].includes(i % 12);
      if (isBlack) {
        const prevWhiteKey = i - 1;
        const prevWhiteIndex = whiteKeys.indexOf(prevWhiteKey);
        // If the black key is the first key (e.g. A#0 when start is A0), handle it
        // But usually start is white key.
        // Simplified logic:
        const x = (prevWhiteIndex !== -1 ? (prevWhiteIndex + 1) * whiteKeyWidth : 0) - (whiteKeyWidth * 0.35);
        map.set(i, { x, width: whiteKeyWidth * 0.7, isBlack: true });
      } else {
        map.set(i, { x: whiteKeyIndex * whiteKeyWidth, width: whiteKeyWidth, isBlack: false });
        whiteKeyIndex++;
      }
    }
    return map;
  }, [keyboardRange, dimensions.width]);

  const { recentHits, hitEffects } = useGameEngine(
    song,
    currentTime,
    activeNotes,
    isPlaying,
    keyboardRange,
    t,
    dimensions,
    keyGeometries,
    onScoreUpdate,
    playMode
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
    playMode
  );

  return (
    <canvas 
      ref={canvasRef} 
      width={dimensions.width} 
      height={dimensions.height}
      className="w-full h-full block touch-none"
    />
  );
}
