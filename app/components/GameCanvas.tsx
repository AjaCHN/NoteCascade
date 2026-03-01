// app/components/GameCanvas.tsx v1.3.5
'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Song } from '../lib/songs';
import { useLocale } from '../lib/store';
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
  keyboardRange: { start: number; end: number };
  showNoteNames: boolean;
  theme: string;
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
  keyboardRange,
  showNoteNames,
  theme
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const locale = useLocale();
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

  const { score, feedbacks, recentHits, hitEffects } = useGameEngine(
    song,
    currentTime,
    activeNotes,
    isPlaying,
    keyboardRange,
    t,
    dimensions,
    keyGeometries,
    onScoreUpdate
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
    hitEffects
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
      <GameStatsOverlay song={song} score={score} theme={theme} t={t} />

      <div className="absolute inset-0 pointer-events-none z-30">
        <AnimatePresence>
          {feedbacks.map((f) => (
            <motion.div
              key={f.id}
              initial={{ y: f.y, x: f.x, opacity: 0, scale: 0.5 }}
              animate={{ y: f.y - 100, opacity: 1, scale: 1.2 }}
              exit={{ opacity: 0 }}
              className={`absolute -translate-x-1/2 text-center font-black text-xl italic drop-shadow-lg ${
                f.type === 'perfect' ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 
                f.type === 'good' ? 'text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]' : 
                f.type === 'miss' ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]' : 'text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]'
              }`}
            >
              {f.text.split('\n').map((line, i) => (
                <div key={i} className={i > 0 ? 'text-sm opacity-80' : ''}>{line}</div>
              ))}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
