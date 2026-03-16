// app/hooks/use-game-engine.ts v2.3.1
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Song } from '../lib/songs';

export interface Feedback {
  id: number;
  text: string;
  type: 'perfect' | 'good' | 'early' | 'late' | 'miss' | 'wrong';
  x: number;
  y: number;
}

export const PERFECT_THRESHOLD = 0.1;
export const GOOD_THRESHOLD = 0.25;
export const HIT_LINE_Y = 0;

export function useGameEngine(
  song: Song,
  currentTime: number,
  activeNotes: Map<number, number>,
  isPlaying: boolean,
  keyboardRange: { start: number; end: number },
  dimensions: { width: number; height: number },
  keyGeometries: Map<number, { x: number, width: number, isBlack: boolean }>,
  onScoreUpdate: (score: { perfect: number; good: number; miss: number; wrong: number; currentScore: number }) => void,
  playMode: string,
  showResult: boolean = false
) {
  const [score, setScore] = useState({ perfect: 0, good: 0, miss: 0, wrong: 0, currentScore: 0 });
  const processedNotes = useRef<Set<number>>(new Set());
  const lastActiveNotes = useRef<Set<number>>(new Set());
  const recentHits = useRef<{ timeDiff: number; timestamp: number; type: Feedback['type'] }[]>([]);
  const hitEffects = useRef<{ x: number; y: number; type: Feedback['type']; timestamp: number }[]>([]);
  const activeNoteStatus = useRef<Map<number, Feedback['type']>>(new Map());

  const addFeedback = useCallback((type: Feedback['type'], midi: number) => {
    if (playMode === 'free-play') return; // No feedback in free play
    const geo = keyGeometries.get(midi);
    if (!geo) return;
    const x = geo.x + geo.width / 2;
    hitEffects.current.push({ x, y: dimensions.height - HIT_LINE_Y, type, timestamp: Date.now() });
  }, [dimensions.height, keyGeometries, playMode]);

  useEffect(() => {
    if (!isPlaying || showResult) return;
    if (playMode === 'free-play') {
      lastActiveNotes.current = new Set(activeNotes.keys());
      return;
    }

    activeNotes.forEach((velocity, midi) => {
      if (!lastActiveNotes.current.has(midi)) {
        const match = song.notes?.find((n, idx) => 
          !processedNotes.current.has(idx) && 
          n.midi === midi && 
          Math.abs(n.time - currentTime) < GOOD_THRESHOLD
        );

        if (match && song.notes) {
          const timeDiff = currentTime - match.time;
          const absTimeDiff = Math.abs(timeDiff);
          const idx = song.notes.indexOf(match);
          processedNotes.current.add(idx);

          let type: Feedback['type'] = 'good';
          let points = 50;

          if (absTimeDiff < PERFECT_THRESHOLD) {
            type = 'perfect';
            points = 100;
          } else if (timeDiff < 0) {
            type = 'early';
          } else {
            type = 'late';
          }

          const velocityDiff = velocity - match.velocity;
          if (Math.abs(velocityDiff) > 0.3) {
            points = Math.floor(points * 0.8);
          }

          recentHits.current.push({ timeDiff, timestamp: Date.now(), type });

          setScore(prev => ({
            ...prev,
            perfect: prev.perfect + (type === 'perfect' ? 1 : 0),
            good: prev.good + ((type === 'early' || type === 'late') ? 1 : 0),
            currentScore: prev.currentScore + points
          }));

          addFeedback(type, midi);
          activeNoteStatus.current.set(midi, type);
        } else {
          if (midi >= keyboardRange.start && midi <= keyboardRange.end) {
            setScore(prev => ({ ...prev, wrong: prev.wrong + 1, currentScore: Math.max(0, prev.currentScore - 10) }));
            addFeedback('wrong', midi);
            activeNoteStatus.current.set(midi, 'wrong');
          }
        }
      }
    });

    for (const midi of lastActiveNotes.current) {
      if (!activeNotes.has(midi)) {
        activeNoteStatus.current.delete(midi);
      }
    }

    song.notes?.forEach((n, idx) => {
      if (!processedNotes.current.has(idx) && n.time < currentTime - GOOD_THRESHOLD) {
        processedNotes.current.add(idx);
        setScore(prev => ({ ...prev, miss: prev.miss + 1 }));
        addFeedback('miss', n.midi);
      }
    });

    lastActiveNotes.current = new Set(activeNotes.keys());
  }, [currentTime, activeNotes, song, isPlaying, showResult, addFeedback, keyboardRange.start, keyboardRange.end, playMode]);

  useEffect(() => {
    onScoreUpdate(score);
  }, [score, onScoreUpdate]);

  useEffect(() => {
    if (currentTime === 0) {
      setScore({ perfect: 0, good: 0, miss: 0, wrong: 0, currentScore: 0 });
      processedNotes.current = new Set();
      recentHits.current = [];
    }
  }, [currentTime, song]);

  return {
    score,
    recentHits,
    hitEffects,
    activeNoteStatus
  };
}
