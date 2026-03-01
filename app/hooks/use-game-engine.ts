'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Song } from '../lib/songs';

export interface Feedback {
  id: number;
  text: string;
  type: 'perfect' | 'good' | 'miss' | 'wrong';
  x: number;
  y: number;
}

export const PERFECT_THRESHOLD = 0.1;
export const GOOD_THRESHOLD = 0.25;
export const HIT_LINE_Y = 20;

export function useGameEngine(
  song: Song,
  currentTime: number,
  activeNotes: Map<number, number>,
  isPlaying: boolean,
  keyboardRange: { start: number; end: number },
  t: Record<string, string>,
  dimensions: { width: number; height: number },
  keyGeometries: Map<number, { x: number, width: number, isBlack: boolean }>,
  onScoreUpdate: (score: { perfect: number; good: number; miss: number; wrong: number; currentScore: number }) => void
) {
  const [score, setScore] = useState({ perfect: 0, good: 0, miss: 0, wrong: 0, currentScore: 0 });
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const processedNotes = useRef<Set<number>>(new Set());
  const lastActiveNotes = useRef<Set<number>>(new Set());
  const recentHits = useRef<{ timeDiff: number; timestamp: number; type: Feedback['type'] }[]>([]);
  const feedbackIdCounter = useRef(0);
  const hitEffects = useRef<{ x: number; y: number; type: Feedback['type']; timestamp: number }[]>([]);

  const addFeedback = useCallback((text: string, type: Feedback['type'], midi: number) => {
    const geo = keyGeometries.get(midi);
    if (!geo) return;
    const x = geo.x + geo.width / 2;
    const id = ++feedbackIdCounter.current;
    setFeedbacks((prev) => [...prev, { id, text, type, x, y: dimensions.height * 0.4 }]);
    hitEffects.current.push({ x, y: dimensions.height - HIT_LINE_Y, type, timestamp: Date.now() });
    setTimeout(() => {
      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
    }, 1000);
  }, [dimensions.height, keyGeometries]);

  useEffect(() => {
    if (!isPlaying) return;

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
          let text = t.good.toUpperCase();

          if (absTimeDiff < PERFECT_THRESHOLD) {
            type = 'perfect';
            points = 100;
            text = t.perfect.toUpperCase();
          } else if (timeDiff < 0) {
            text = t.early;
          } else {
            text = t.late;
          }

          const velocityDiff = velocity - match.velocity;
          if (Math.abs(velocityDiff) > 0.3) {
            text += velocityDiff > 0 ? `\n${t.tooHard}` : `\n${t.tooSoft}`;
            points = Math.floor(points * 0.8);
          }

          recentHits.current.push({ timeDiff, timestamp: Date.now(), type });

          setScore(prev => ({
            ...prev,
            perfect: prev.perfect + (type === 'perfect' ? 1 : 0),
            good: prev.good + (type === 'perfect' ? 0 : 1),
            currentScore: prev.currentScore + points
          }));

          addFeedback(text, type, midi);
        } else {
          if (midi >= keyboardRange.start && midi <= keyboardRange.end) {
            setScore(prev => ({ ...prev, wrong: prev.wrong + 1, currentScore: Math.max(0, prev.currentScore - 10) }));
            addFeedback(t.wrong.toUpperCase(), 'wrong', midi);
          }
        }
      }
    });

    song.notes?.forEach((n, idx) => {
      if (!processedNotes.current.has(idx) && n.time < currentTime - GOOD_THRESHOLD) {
        processedNotes.current.add(idx);
        setScore(prev => ({ ...prev, miss: prev.miss + 1 }));
        addFeedback(t.miss.toUpperCase(), 'miss', n.midi);
      }
    });

    lastActiveNotes.current = new Set(activeNotes.keys());
  }, [currentTime, activeNotes, song, isPlaying, addFeedback, t, keyboardRange.start, keyboardRange.end]);

  useEffect(() => {
    onScoreUpdate(score);
  }, [score, onScoreUpdate]);

  useEffect(() => {
    if (currentTime === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setScore({ perfect: 0, good: 0, miss: 0, wrong: 0, currentScore: 0 });
      processedNotes.current = new Set();
      recentHits.current = [];
    }
  }, [currentTime, song]);

  return {
    score,
    feedbacks,
    recentHits,
    hitEffects
  };
}
