'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Song } from '../libs/songs';
import { useLocale } from '../libs/store';
import { translations } from '../i18n';

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
const HIT_LINE_Y = 20;
const NOTE_HIT_Y_OFFSET = 150;
const ACTIVE_NOTE_GLOW_HEIGHT = 130;

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
  const [score, setScore] = useState({ perfect: 0, good: 0, miss: 0, wrong: 0, currentScore: 0 });
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const processedNotes = useRef<Set<number>>(new Set());
  const lastActiveNotes = useRef<Set<number>>(new Set());
  const recentHits = useRef<{ timeDiff: number; timestamp: number; type: Feedback['type'] }[]>([]);

  const locale = useLocale();
  const t = translations[locale] || translations.en;

  const START_NOTE = keyboardRange.start;
  const END_NOTE = keyboardRange.end;

  const addFeedback = useCallback((text: string, type: Feedback['type'], midi: number) => {
    const keyWidth = dimensions.width / (END_NOTE - START_NOTE + 1);
    const x = (midi - START_NOTE) * keyWidth + keyWidth / 2;
    const id = Date.now() + Math.random();
    setFeedbacks((prev) => [...prev, { id, text, type, x, y: dimensions.height - HIT_LINE_Y - 50 }]);
    setTimeout(() => {
      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
    }, 1000);
  }, [dimensions, START_NOTE, END_NOTE]);

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
          let text = t.good.toUpperCase();

          if (absTimeDiff < PERFECT_THRESHOLD) {
            type = 'perfect';
            points = 100;
            text = t.perfect.toUpperCase();
          } else if (timeDiff < 0) {
            text = t.early || 'EARLY';
          } else {
            text = t.late || 'LATE';
          }

          const velocityDiff = velocity - match.velocity;
          if (Math.abs(velocityDiff) > 0.3) {
            text += velocityDiff > 0 ? `\n${t.tooHard || 'TOO HARD'}` : `\n${t.tooSoft || 'TOO SOFT'}`;
            points = Math.floor(points * 0.8);
          }

          // Add to recent hits for timing bar
          recentHits.current.push({ timeDiff, timestamp: Date.now(), type });

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
            addFeedback(t.wrong.toUpperCase(), 'wrong', midi);
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
        addFeedback(t.miss.toUpperCase(), 'miss', n.midi);
      }
    });

    lastActiveNotes.current = new Set(activeNotes.keys());
  }, [currentTime, activeNotes, song, isPlaying, onScoreUpdate, addFeedback, t]);

  useEffect(() => {
    if (currentTime === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setScore({ perfect: 0, good: 0, miss: 0, wrong: 0, currentScore: 0 });
      processedNotes.current = new Set();
      recentHits.current = [];
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

      // Background
      if (theme === 'light') ctx.fillStyle = '#f8fafc';
      else if (theme === 'cyber') ctx.fillStyle = '#050505';
      else if (theme === 'classic') ctx.fillStyle = '#2d1b0d';
      else ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // Draw grid lines
      ctx.strokeStyle = theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      const gridSpacing = 0.5 * FALL_SPEED;
      for (let y = height - HIT_LINE_Y; y > 0; y -= gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw hit line with glow
      const accentColor = theme === 'cyber' ? 'rgba(0, 255, 0, 0.3)' : theme === 'classic' ? 'rgba(217, 119, 6, 0.3)' : 'rgba(99, 102, 241, 0.3)';
      const mainColor = theme === 'cyber' ? 'rgba(0, 255, 0, 1)' : theme === 'classic' ? 'rgba(217, 119, 6, 1)' : 'rgba(99, 102, 241, 1)';
      
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(0, height - HIT_LINE_Y);
      ctx.lineTo(width, height - HIT_LINE_Y);
      ctx.stroke();

      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, height - HIT_LINE_Y);
      ctx.lineTo(width, height - HIT_LINE_Y);
      ctx.stroke();

      const startNote = START_NOTE;
      const endNote = END_NOTE;
      const totalNotes = endNote - startNote + 1;
      const keyWidth = width / totalNotes;

      // Draw active note highlights on the "hit line"
      // ... (existing code)

      // Draw timing bar
      const barWidth = 300;
      const barHeight = 8;
      const barX = (width - barWidth) / 2;
      const barY = height - 100;

      // Background
      ctx.fillStyle = theme === 'light' ? 'rgba(241, 245, 249, 0.8)' : 'rgba(15, 23, 42, 0.6)';
      ctx.beginPath();
      ctx.roundRect(barX, barY, barWidth, barHeight, 4);
      ctx.fill();
      ctx.strokeStyle = theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)';
      ctx.stroke();

      // Center marker (Perfect)
      ctx.fillStyle = theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(barX + barWidth / 2 - 1, barY - 4, 2, barHeight + 8);

      // Draw recent hits
      const now = Date.now();
      recentHits.current = recentHits.current.filter(h => now - h.timestamp < 1500);
      
      recentHits.current.forEach(hit => {
        const age = now - hit.timestamp;
        const opacity = 1 - age / 1500;
        
        const normalizedDiff = Math.max(-1, Math.min(1, hit.timeDiff / GOOD_THRESHOLD));
        const hitX = barX + barWidth / 2 + (normalizedDiff * barWidth / 2);
        
        ctx.fillStyle = hit.type === 'perfect' 
          ? `rgba(52, 211, 153, ${opacity})` 
          : hit.type === 'good' 
            ? `rgba(96, 165, 250, ${opacity})` 
            : `rgba(251, 191, 36, ${opacity})`;

        ctx.beginPath();
        ctx.arc(hitX, barY + barHeight / 2, 4, 0, Math.PI * 2);
        ctx.fill();
        
        if (age < 500) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.5})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(hitX, barY + barHeight / 2, 4 + (age / 500) * 10, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Labels
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.font = 'bold 9px Inter';
      ctx.textAlign = 'center';
      ctx.fillText((t.early || 'EARLY').toUpperCase(), barX, barY + 24);
      ctx.fillText((t.late || 'LATE').toUpperCase(), barX + barWidth, barY + 24);
      ctx.fillText((t.perfect || 'PERFECT').toUpperCase(), barX + barWidth / 2, barY + 24);

      // ... (rest of drawing code)

      // Draw active note highlights on the "hit line"
      activeNotes.forEach((velocity, midi) => {
        if (midi >= startNote && midi <= endNote) {
          const x = (midi - startNote) * keyWidth;
          const gradient = ctx.createLinearGradient(0, height - HIT_LINE_Y, 0, height - NOTE_HIT_Y_OFFSET);
          const glowColor = theme === 'cyber' ? '0, 255, 0' : theme === 'classic' ? '217, 119, 6' : '99, 102, 241';
          gradient.addColorStop(0, `rgba(${glowColor}, ${0.4 * velocity})`);
          gradient.addColorStop(1, `rgba(${glowColor}, 0)`);
          ctx.fillStyle = gradient;
          ctx.fillRect(x + 1, height - NOTE_HIT_Y_OFFSET, keyWidth - 2, ACTIVE_NOTE_GLOW_HEIGHT);
          
          ctx.fillStyle = theme === 'light' ? `rgba(0, 0, 0, ${0.8 * velocity})` : `rgba(255, 255, 255, ${0.8 * velocity})`;
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
            ctx.fillStyle = 'rgba(156, 163, 175, 0.1)';
            ctx.beginPath();
            ctx.roundRect(noteX + 2, noteY - noteHeight, keyWidth - 4, noteHeight, 6);
            ctx.fill();
          } else {
            const gradient = ctx.createLinearGradient(noteX, noteY - noteHeight, noteX, noteY);
            gradient.addColorStop(0, `hsla(${hue}, 80%, 60%, 0.8)`);
            gradient.addColorStop(1, `hsla(${hue}, 80%, 40%, 0.9)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(noteX + 2, noteY - noteHeight, keyWidth - 4, noteHeight, 6);
            ctx.fill();
            
            // Highlight top edge
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(noteX + 4, noteY - noteHeight + 2, keyWidth - 8, 4);

            if (showNoteNames && noteHeight > 20) {
              const noteName = getNoteName(note.midi);
              ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
              ctx.font = 'bold 10px Inter';
              ctx.textAlign = 'center';
              ctx.fillText(noteName, noteX + keyWidth / 2, noteY - noteHeight / 2 + 4);
            }

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [song, currentTime, dimensions, activeNotes, t]);

  return (
    <div ref={containerRef} className={`relative h-full w-full overflow-hidden ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-950'}`}>
      <canvas ref={canvasRef} className="h-full w-full" />
      <div id="game-stats-overlay" className="pointer-events-none absolute inset-0 flex flex-col p-8 md:p-12">
        <div className="flex justify-between items-start w-full">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col"
          >
            <div className="text-[10px] uppercase tracking-[0.3em] theme-text-secondary font-black mb-2">{t.currentScore}</div>
            <div className="text-6xl md:text-8xl font-black theme-text-primary tabular-nums drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] tracking-tighter">
              {score.currentScore.toLocaleString()}
            </div>
          </motion.div>

          <div className="flex flex-col gap-3">
            {[
              { label: t.perfect, value: score.perfect, color: 'text-emerald-400', bg: theme === 'light' ? 'bg-emerald-400/10' : 'bg-emerald-400/5', border: theme === 'light' ? 'border-emerald-400/20' : 'border-emerald-400/10' },
              { label: t.good, value: score.good, color: 'text-blue-400', bg: theme === 'light' ? 'bg-blue-400/10' : 'bg-blue-400/5', border: theme === 'light' ? 'border-blue-400/20' : 'border-blue-400/10' },
              { label: t.miss, value: score.miss, color: 'text-amber-400', bg: theme === 'light' ? 'bg-amber-400/10' : 'bg-amber-400/5', border: theme === 'light' ? 'border-amber-400/20' : 'border-amber-400/10' },
              { label: t.wrong, value: score.wrong, color: 'text-rose-400', bg: theme === 'light' ? 'bg-rose-400/10' : 'bg-rose-400/5', border: theme === 'light' ? 'border-rose-400/20' : 'border-rose-400/10' },
            ].map((stat) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center justify-between gap-6 px-5 py-2.5 rounded-2xl border ${stat.bg} ${stat.border} backdrop-blur-xl min-w-[160px] shadow-lg`}
              >
                <span className={`text-[10px] uppercase tracking-widest font-black ${stat.color}`}>{stat.label}</span>
                <span className="text-2xl font-black theme-text-primary tabular-nums">{stat.value}</span>
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

function getNoteName(midi: number): string {
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  const name = names[midi % 12];
  return `${name}${octave}`;
}
