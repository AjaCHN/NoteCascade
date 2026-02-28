'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Song } from '../lib/songs';
import { useLocale } from '../lib/store';
import { translations } from '../lib/translations';
import { GameStatsOverlay } from './GameStatsOverlay';

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

  const keyGeometries = React.useMemo(() => {
    const geometries = new Map<number, { x: number, width: number, isBlack: boolean }>();
    let whiteKeysCount = 0;
    for (let i = START_NOTE; i <= END_NOTE; i++) {
      if (!isBlackKey(i)) whiteKeysCount++;
    }
    
    const whiteKeyWidth = dimensions.width / whiteKeysCount;
    let whiteKeyIndex = 0;
    
    for (let midi = START_NOTE; midi <= END_NOTE; midi++) {
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
  }, [START_NOTE, END_NOTE, dimensions.width]);

  const feedbackIdCounter = useRef(0);

  const addFeedback = useCallback((text: string, type: Feedback['type'], midi: number) => {
    const geo = keyGeometries.get(midi);
    if (!geo) return;
    const x = geo.x + geo.width / 2;
    const id = ++feedbackIdCounter.current;
    setFeedbacks((prev) => [...prev, { id, text, type, x, y: dimensions.height - HIT_LINE_Y - 50 }]);
    hitEffects.current.push({ x, y: dimensions.height - HIT_LINE_Y, type, timestamp: Date.now() });
    setTimeout(() => {
      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
    }, 1000);
  }, [dimensions.height, keyGeometries]);

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
        const match = song.notes?.find((n, idx) => 
          !processedNotes.current.has(idx) && 
          n.midi === midi && 
          Math.abs(n.time - currentTime) < GOOD_THRESHOLD
        );

        if (match && song.notes) {
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
            text = t.early;
          } else {
            text = t.late;
          }

          const velocityDiff = velocity - match.velocity;
          if (Math.abs(velocityDiff) > 0.3) {
            text += velocityDiff > 0 ? `\n${t.tooHard}` : `\n${t.tooSoft}`;
            points = Math.floor(points * 0.8);
          }

          // Add to recent hits for timing bar
          recentHits.current.push({ timeDiff, timestamp: Date.now(), type });

          setScore(prev => ({
            ...prev,
            perfect: prev.perfect + (type === 'perfect' ? 1 : 0),
            good: prev.good + (type === 'perfect' ? 0 : 1),
            currentScore: prev.currentScore + points
          }));

          addFeedback(text, type, midi);
        } else {
          // Only penalize if it's within the playable range
          if (midi >= START_NOTE && midi <= END_NOTE) {
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
  }, [currentTime, activeNotes, song, isPlaying, addFeedback, t, START_NOTE, END_NOTE]);

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

  const activeNoteStartTimes = useRef<Map<number, number>>(new Map());
  const hitEffects = useRef<{ x: number; y: number; type: Feedback['type']; timestamp: number }[]>([]);

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

      // Draw hit effects
      const now = Date.now();
      hitEffects.current = hitEffects.current.filter(effect => now - effect.timestamp < 500);
      hitEffects.current.forEach(effect => {
        const age = now - effect.timestamp;
        const progress = age / 500;
        const opacity = 1 - progress;
        const radius = 10 + progress * 40;
        
        let color = '255, 255, 255';
        if (effect.type === 'perfect') color = '52, 211, 153'; // emerald-400
        else if (effect.type === 'good') color = '96, 165, 250'; // blue-400
        else if (effect.type === 'miss') color = '251, 191, 36'; // amber-400
        else if (effect.type === 'wrong') color = '244, 63, 94'; // rose-400

        ctx.strokeStyle = `rgba(${color}, ${opacity})`;
        ctx.lineWidth = 4 * (1 - progress);
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        if (effect.type === 'perfect' || effect.type === 'good') {
           ctx.fillStyle = `rgba(${color}, ${opacity * 0.5})`;
           ctx.beginPath();
           ctx.arc(effect.x, effect.y, radius * 0.5, 0, Math.PI * 2);
           ctx.fill();
        }
      });

      // Update active note start times
      activeNotes.forEach((_, midi) => {
        if (!activeNoteStartTimes.current.has(midi)) {
          activeNoteStartTimes.current.set(midi, Date.now());
        }
      });
      for (const midi of activeNoteStartTimes.current.keys()) {
        if (!activeNotes.has(midi)) {
          activeNoteStartTimes.current.delete(midi);
        }
      }

      // Draw active note columns (visual feedback)
      activeNotes.forEach((velocity, midi) => {
        if (midi >= startNote && midi <= endNote) {
          const geo = keyGeometries.get(midi);
          if (!geo) return;
          const x = geo.x;
          const currentKeyWidth = geo.width;
          const startTime = activeNoteStartTimes.current.get(midi) || Date.now();
          const duration = Date.now() - startTime;
          
          // Column grows upwards based on duration
          const growHeight = Math.min(height - 50, 100 + duration * 0.8);
          
          const gradient = ctx.createLinearGradient(0, height - HIT_LINE_Y, 0, height - HIT_LINE_Y - growHeight);
          const glowColor = theme === 'cyber' ? '0, 255, 0' : theme === 'classic' ? '217, 119, 6' : '99, 102, 241';
          
          // Opacity based on velocity
          const baseOpacity = 0.2 + (velocity * 0.6);
          
          gradient.addColorStop(0, `rgba(${glowColor}, ${baseOpacity})`);
          gradient.addColorStop(1, `rgba(${glowColor}, 0)`);
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x + 1, height - HIT_LINE_Y - growHeight, currentKeyWidth - 2, growHeight);
          
          // Particles at the top of the column
          if (velocity > 0.4) {
             ctx.fillStyle = theme === 'light' ? `rgba(0, 0, 0, ${velocity * 0.5})` : `rgba(255, 255, 255, ${velocity * 0.8})`;
             const particleCount = Math.floor(velocity * 5);
             for(let i=0; i < particleCount; i++) {
                 const px = x + Math.random() * currentKeyWidth;
                 const py = height - HIT_LINE_Y - growHeight + Math.random() * 30;
                 const size = Math.random() * 2 + 1;
                 ctx.globalAlpha = Math.random();
                 ctx.fillRect(px, py, size, size);
                 ctx.globalAlpha = 1.0;
             }
          }
          
          // Hit bar highlight
          ctx.fillStyle = theme === 'light' ? `rgba(0, 0, 0, ${0.8 * velocity})` : `rgba(255, 255, 255, ${0.8 * velocity})`;
          ctx.fillRect(x + 2, height - HIT_LINE_Y - 2, currentKeyWidth - 4, 4);
        }
      });

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
      ctx.fillText(t.early.toUpperCase(), barX, barY + 24);
      ctx.fillText(t.late.toUpperCase(), barX + barWidth, barY + 24);
      ctx.fillText(t.perfect.toUpperCase(), barX + barWidth / 2, barY + 24);

      // ... (rest of drawing code)

      // Draw falling notes
      song.notes?.forEach((note, idx) => {
        const geo = keyGeometries.get(note.midi);
        if (!geo) return;
        
        const noteX = geo.x;
        const currentKeyWidth = geo.width;
        const noteY = height - HIT_LINE_Y - (note.time - currentTime) * FALL_SPEED;
        const noteHeight = note.duration * FALL_SPEED;

        if (noteY + noteHeight > 0 && noteY < height) {
          const isProcessed = processedNotes.current.has(idx);
          const hue = (note.midi * 137.5) % 360;
          
          if (isProcessed) {
            ctx.fillStyle = 'rgba(156, 163, 175, 0.1)';
            ctx.beginPath();
            ctx.roundRect(noteX + 2, noteY - noteHeight, currentKeyWidth - 4, noteHeight, 6);
            ctx.fill();
          } else {
            const gradient = ctx.createLinearGradient(noteX, noteY - noteHeight, noteX, noteY);
            gradient.addColorStop(0, `hsla(${hue}, 80%, 60%, 0.8)`);
            gradient.addColorStop(1, `hsla(${hue}, 80%, 40%, 0.9)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(noteX + 2, noteY - noteHeight, currentKeyWidth - 4, noteHeight, 6);
            ctx.fill();
            
            // Highlight top edge
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(noteX + 4, noteY - noteHeight + 2, currentKeyWidth - 8, 4);

            if (showNoteNames && noteHeight > 20) {
              const noteName = getNoteName(note.midi);
              ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
              ctx.font = 'bold 10px Inter';
              ctx.textAlign = 'center';
              ctx.fillText(noteName, noteX + currentKeyWidth / 2, noteY - noteHeight / 2 + 4);
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
  }, [song, currentTime, dimensions, activeNotes, t, START_NOTE, END_NOTE, showNoteNames, theme, keyGeometries]);

  return (
    <div ref={containerRef} className={`relative h-full w-full overflow-hidden ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-950'}`}>
      <canvas ref={canvasRef} className="h-full w-full" />
      <GameStatsOverlay song={song} score={score} theme={theme} t={t} />

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

function getNoteName(midi: number): string {
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  const name = names[midi % 12];
  return `${name}${octave}`;
}

function isBlackKey(midi: number): boolean {
  const noteClass = midi % 12;
  return [1, 3, 6, 8, 10].includes(noteClass);
}
