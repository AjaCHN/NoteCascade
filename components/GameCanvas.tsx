'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Song } from '../lib/songs';
import { useLocale } from '../lib/store';
import { translations } from '../lib/i18n';

interface GameCanvasProps {
  song: Song;
  currentTime: number;
  activeNotes: Map<number, number>;
  onScoreUpdate: (score: { perfect: number; good: number; miss: number; wrong: number; currentScore: number }) => void;
  isPlaying: boolean;
}

interface Feedback {
  id: number;
  text: string;
  type: 'perfect' | 'good' | 'miss' | 'wrong';
  x: number;
  y: number;
}

const FALL_SPEED = 200;
const PERFECT_THRESHOLD = 0.1;
const GOOD_THRESHOLD = 0.25;
const START_NOTE = 48;
const END_NOTE = 84;
const HIT_LINE_Y = 20;
const NOTE_HIT_Y_OFFSET = 150;
const ACTIVE_NOTE_GLOW_HEIGHT = 130;

export function GameCanvas({ song, currentTime, activeNotes, onScoreUpdate, isPlaying }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState({ perfect: 0, good: 0, miss: 0, wrong: 0, currentScore: 0 });
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const processedNotes = useRef<Set<number>>(new Set());
  const lastActiveNotes = useRef<Set<number>>(new Set());

  const locale = useLocale();
  const t = translations[locale] || translations.en;

  const addFeedback = (text: string, type: Feedback['type'], midi: number) => {
    const keyWidth = dimensions.width / (END_NOTE - START_NOTE + 1);
    const x = (midi - START_NOTE) * keyWidth + keyWidth / 2;
    const id = Date.now() + Math.random();
    setFeedbacks((prev) => [...prev, { id, text, type, x, y: dimensions.height - HIT_LINE_Y - 50 }]);
    setTimeout(() => {
      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
    }, 1000);
  };

  // Handle responsive canvas sizing
  useEffect(() => {
    if (!containerRef.current) return;
    
    let timeoutId: NodeJS.Timeout;

    const observer = new ResizeObserver((entries) => {
      // Debounce the resize to prevent the "ResizeObserver loop completed with undelivered notifications" error
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

  useEffect(() => {
    if (!isPlaying) return;

    activeNotes.forEach((velocity, midi) => {
      if (!lastActiveNotes.current.has(midi)) {
        const match = song.notes.find((n, idx) => 
          !processedNotes.current.has(idx) && 
          n.midi === midi && 
          Math.abs(n.time - currentTime) < GOOD_THRESHOLD
        );

        if (match) {
          const timeDiff = currentTime - match.time; // positive if late, negative if early
          const absTimeDiff = Math.abs(timeDiff);
          const idx = song.notes.indexOf(match);
          processedNotes.current.add(idx);

          let type: Feedback['type'] = 'good';
          let points = 50;
          let text = 'GOOD';

          if (absTimeDiff < PERFECT_THRESHOLD) {
            type = 'perfect';
            points = 100;
            text = 'PERFECT';
          } else if (timeDiff < 0) {
            text = 'EARLY';
          } else {
            text = 'LATE';
          }

          const velocityDiff = velocity - match.velocity;
          if (Math.abs(velocityDiff) > 0.3) {
            text += velocityDiff > 0 ? '\nTOO HARD' : '\nTOO SOFT';
            points = Math.floor(points * 0.8);
          }

          setScore(prev => {
            const newScore = {
              ...prev,
              perfect: prev.perfect + (type === 'perfect' ? 1 : 0),
              good: prev.good + (type === 'perfect' ? 0 : 1),
              currentScore: prev.currentScore + points
            };
            onScoreUpdate(newScore);
            return newScore;
          });

          addFeedback(text, type, midi);
        } else {
          // Only penalize if it's within the playable range
          if (midi >= START_NOTE && midi <= END_NOTE) {
            setScore(prev => {
              const newScore = { ...prev, wrong: prev.wrong + 1, currentScore: Math.max(0, prev.currentScore - 10) };
              onScoreUpdate(newScore);
              return newScore;
            });
            addFeedback('WRONG', 'wrong', midi);
          }
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
        addFeedback('MISS', 'miss', n.midi);
      }
    });

    lastActiveNotes.current = new Set(activeNotes.keys());
  }, [currentTime, activeNotes, song, isPlaying, onScoreUpdate]);

  useEffect(() => {
    if (currentTime === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
      const { width, height } = dimensions;
      ctx.clearRect(0, 0, width, height);

      // Draw grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      const gridSpacing = 0.5 * FALL_SPEED;
      for (let y = height - HIT_LINE_Y; y > 0; y -= gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw hit line
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, height - HIT_LINE_Y);
      ctx.lineTo(width, height - HIT_LINE_Y);
      ctx.stroke();

      const startNote = START_NOTE;
      const endNote = END_NOTE;
      const totalNotes = endNote - startNote + 1;
      const keyWidth = width / totalNotes;

      // Draw active note highlights on the "hit line"
      activeNotes.forEach(midi => {
        if (midi >= startNote && midi <= endNote) {
          const x = (midi - startNote) * keyWidth;
          const gradient = ctx.createLinearGradient(0, height - HIT_LINE_Y, 0, height - NOTE_HIT_Y_OFFSET);
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
          gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
          ctx.fillStyle = gradient;
          ctx.fillRect(x + 1, height - NOTE_HIT_Y_OFFSET, keyWidth - 2, ACTIVE_NOTE_GLOW_HEIGHT);
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fillRect(x + 2, height - HIT_LINE_Y - 2, keyWidth - 4, 4);
        }
      });

      // Draw falling notes
      song.notes.forEach((note, idx) => {
        const noteX = (note.midi - startNote) * keyWidth;
        const noteY = height - HIT_LINE_Y - (note.time - currentTime) * FALL_SPEED;
        const noteHeight = note.duration * FALL_SPEED;

        if (noteY + noteHeight > 0 && noteY < height) {
          const isProcessed = processedNotes.current.has(idx);
          const hue = (note.midi * 137.5) % 360;
          
          if (isProcessed) {
            ctx.fillStyle = 'rgba(156, 163, 175, 0.2)';
          } else {
            const gradient = ctx.createLinearGradient(noteX, noteY - noteHeight, noteX, noteY);
            gradient.addColorStop(0, `hsla(${hue}, 70%, 60%, 0.8)`);
            gradient.addColorStop(1, `hsla(${hue}, 70%, 40%, 0.9)`);
            ctx.fillStyle = gradient;
          }

          ctx.beginPath();
          ctx.roundRect(noteX + 2, noteY - noteHeight, keyWidth - 4, noteHeight, 6);
          ctx.fill();
          
          if (!isProcessed) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [song, currentTime, dimensions, activeNotes]);

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-slate-950">
      <canvas ref={canvasRef} className="h-full w-full" />
      <div id="game-stats-overlay" className="pointer-events-none absolute inset-0 flex flex-col p-8">
        <div className="flex justify-between items-start w-full">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col"
          >
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-1">Current Score</div>
            <div className="text-6xl font-black text-white tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              {score.currentScore.toLocaleString()}
            </div>
          </motion.div>

          <div className="flex flex-col gap-3">
            {[
              { label: t.perfect, value: score.perfect, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
              { label: t.good, value: score.good, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
              { label: t.miss, value: score.miss, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
              { label: t.wrong, value: score.wrong, color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' },
            ].map((stat) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center justify-between gap-4 px-4 py-2 rounded-xl border ${stat.bg} ${stat.border} backdrop-blur-md min-w-[140px]`}
              >
                <span className={`text-[10px] uppercase tracking-wider font-bold ${stat.color}`}>{stat.label}</span>
                <span className="text-xl font-black text-white tabular-nums">{stat.value}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Feedbacks */}
      <div className="absolute inset-0 pointer-events-none z-30">
        <AnimatePresence>
          {feedbacks.map((f) => (
            <motion.div
              key={f.id}
              initial={{ y: f.y, x: f.x, opacity: 0, scale: 0.5 }}
              animate={{ y: f.y - 100, opacity: 1, scale: 1.2 }}
              exit={{ opacity: 0 }}
              className={`absolute -translate-x-1/2 text-center font-black text-xl italic drop-shadow-lg ${
                f.type === 'perfect' ? 'text-yellow-400' : 
                f.type === 'good' ? 'text-emerald-400' : 
                f.type === 'miss' ? 'text-rose-500' : 'text-orange-500'
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
