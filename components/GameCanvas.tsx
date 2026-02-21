'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Song } from '../lib/songs';

interface GameCanvasProps {
  song: Song;
  currentTime: number;
  activeNotes: Set<number>;
  onScoreUpdate: (score: { perfect: number; good: number; miss: number; wrong: number; currentScore: number }) => void;
  isPlaying: boolean;
}

const FALL_SPEED = 200;
const PERFECT_THRESHOLD = 0.1;
const GOOD_THRESHOLD = 0.25;

export function GameCanvas({ song, currentTime, activeNotes, onScoreUpdate, isPlaying }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState({ perfect: 0, good: 0, miss: 0, wrong: 0, currentScore: 0 });
  const processedNotes = useRef<Set<number>>(new Set());
  const lastActiveNotes = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!isPlaying) return;

    activeNotes.forEach(midi => {
      if (!lastActiveNotes.current.has(midi)) {
        const match = song.notes.find((n, idx) => 
          !processedNotes.current.has(idx) && 
          n.midi === midi && 
          Math.abs(n.time - currentTime) < GOOD_THRESHOLD
        );

        if (match) {
          const diff = Math.abs(match.time - currentTime);
          const idx = song.notes.indexOf(match);
          processedNotes.current.add(idx);

          setScore(prev => {
            const isPerfect = diff < PERFECT_THRESHOLD;
            const points = isPerfect ? 100 : 50;
            const newScore = {
              ...prev,
              perfect: prev.perfect + (isPerfect ? 1 : 0),
              good: prev.good + (isPerfect ? 0 : 1),
              currentScore: prev.currentScore + points
            };
            onScoreUpdate(newScore);
            return newScore;
          });
        } else {
          setScore(prev => {
            const newScore = { ...prev, wrong: prev.wrong + 1, currentScore: Math.max(0, prev.currentScore - 10) };
            onScoreUpdate(newScore);
            return newScore;
          });
        }
      }
    });

    song.notes.forEach((n, idx) => {
      if (!processedNotes.current.has(idx) && n.time < currentTime - GOOD_THRESHOLD) {
        processedNotes.current.add(idx);
        setScore(prev => {
          const newScore = { ...prev, miss: prev.miss + 1 };
          onScoreUpdate(newScore);
          return newScore;
        });
      }
    });

    lastActiveNotes.current = new Set(activeNotes);
  }, [currentTime, activeNotes, song, isPlaying, onScoreUpdate]);

  useEffect(() => {
    if (currentTime === 0) {
      setScore({ perfect: 0, good: 0, miss: 0, wrong: 0, currentScore: 0 });
      processedNotes.current = new Set();
    }
  }, [currentTime, song]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 10; i++) {
        const y = height - (i * 0.5 * FALL_SPEED);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, height - 20);
      ctx.lineTo(width, height - 20);
      ctx.stroke();

      const startNote = 48;
      const endNote = 84;
      const totalNotes = endNote - startNote + 1;
      const keyWidth = width / totalNotes;

      // Draw active note highlights on the "hit line"
      activeNotes.forEach(midi => {
        if (midi >= startNote && midi <= endNote) {
          const x = (midi - startNote) * keyWidth;
          const gradient = ctx.createLinearGradient(0, height - 20, 0, height - 100);
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.6)');
          gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
          ctx.fillStyle = gradient;
          ctx.fillRect(x + 1, height - 100, keyWidth - 2, 80);
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillRect(x + 2, height - 22, keyWidth - 4, 4);
        }
      });

      song.notes.forEach((note, idx) => {
        const noteX = (note.midi - startNote) * keyWidth;
        const noteY = height - 20 - (note.time - currentTime) * FALL_SPEED;
        const noteHeight = note.duration * FALL_SPEED;

        if (noteY + noteHeight > 0 && noteY < height) {
          const isProcessed = processedNotes.current.has(idx);
          ctx.fillStyle = isProcessed ? 'rgba(156, 163, 175, 0.3)' : `hsl(${(note.midi * 137.5) % 360}, 70%, 60%)`;
          ctx.beginPath();
          ctx.roundRect(noteX + 2, noteY - noteHeight, keyWidth - 4, noteHeight, 4);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [song, currentTime]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-950">
      <canvas ref={canvasRef} width={800} height={600} className="h-full w-full" />
      <div className="pointer-events-none absolute top-4 right-4 flex flex-col items-end space-y-2 font-mono text-white">
        <div className="text-4xl font-bold text-indigo-400">{score.currentScore}</div>
        <div className="flex space-x-4 text-sm opacity-80">
          <span className="text-emerald-400">P: {score.perfect}</span>
          <span className="text-blue-400">G: {score.good}</span>
          <span className="text-amber-400">M: {score.miss}</span>
          <span className="text-rose-400">W: {score.wrong}</span>
        </div>
      </div>
    </div>
  );
}
