'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Song, NoteEvent } from '@/lib/songs';
import { useAppStore } from '@/lib/store';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Star, Trophy, AlertCircle } from 'lucide-react';

interface GameViewProps {
  song: Song;
  activeNotes: Set<number>;
  onEnd: () => void;
}

interface Feedback {
  id: number;
  text: string;
  type: 'perfect' | 'good' | 'miss' | 'wrong';
  x: number;
  y: number;
}

const FALL_SPEED = 200; // pixels per second
const HIT_ZONE_Y = 500;
const NOTE_WIDTH = 40;
const KEYBOARD_START = 48;
const KEYBOARD_END = 84;

export function GameView({ song, activeNotes, onEnd }: GameViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [combo, setCombo] = useState(0);
  const [stats, setStats] = useState({
    perfect: 0,
    good: 0,
    miss: 0,
    wrong: 0,
    score: 0,
  });

  const [processedCount, setProcessedCount] = useState(0);
  const processedNotes = useRef<Set<number>>(new Set());
  const requestRef = useRef<number>(null);
  const lastTimeRef = useRef<number>(null);

  const addFeedback = (text: string, type: Feedback['type'], midi: number) => {
    const x = (midi - KEYBOARD_START) * NOTE_WIDTH + NOTE_WIDTH / 2;
    const id = Date.now();
    setFeedbacks((prev) => [...prev, { id, text, type, x, y: HIT_ZONE_Y - 50 }]);
    setTimeout(() => {
      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
    }, 1000);
  };

  const handleSongEnd = useCallback(() => {
    const totalNotes = song.notes.length;
    const accuracy = ((stats.perfect + stats.good) / totalNotes) * 100;
    
    useAppStore.getState().addScore({
      songId: song.id,
      score: stats.score,
      maxScore: totalNotes * 100,
      accuracy,
      perfect: stats.perfect,
      good: stats.good,
      miss: stats.miss,
      wrong: stats.wrong,
      date: Date.now(),
    });

    if (accuracy > 90) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
      useAppStore.getState().unlockAchievement('score_90');
    }
    
    useAppStore.getState().unlockAchievement('first_song');
    if (combo >= 10) useAppStore.getState().unlockAchievement('perfect_10');

    setTimeout(onEnd, 3000);
  }, [song, stats, combo, onEnd]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = KEYBOARD_START; i <= KEYBOARD_END; i++) {
      const x = (i - KEYBOARD_START) * NOTE_WIDTH;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Draw hit zone line
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, HIT_ZONE_Y);
    ctx.lineTo(canvas.width, HIT_ZONE_Y);
    ctx.stroke();

    // Draw notes
    song.notes.forEach((note, index) => {
      const noteY = HIT_ZONE_Y - (note.time - currentTime) * FALL_SPEED;
      const noteHeight = note.duration * FALL_SPEED;

      if (noteY + noteHeight < 0 || noteY > canvas.height + 200) return;

      const x = (note.midi - KEYBOARD_START) * NOTE_WIDTH;
      
      const isProcessed = processedNotes.current.has(index);
      
      ctx.fillStyle = isProcessed ? '#475569' : '#818cf8';
      ctx.shadowBlur = isProcessed ? 0 : 10;
      ctx.shadowColor = '#6366f1';
      
      // Rounded rect for notes
      const radius = 5;
      ctx.beginPath();
      ctx.moveTo(x + 2, noteY - noteHeight);
      ctx.lineTo(x + NOTE_WIDTH - 2 - radius, noteY - noteHeight);
      ctx.quadraticCurveTo(x + NOTE_WIDTH - 2, noteY - noteHeight, x + NOTE_WIDTH - 2, noteY - noteHeight + radius);
      ctx.lineTo(x + NOTE_WIDTH - 2, noteY - radius);
      ctx.quadraticCurveTo(x + NOTE_WIDTH - 2, noteY, x + NOTE_WIDTH - 2 - radius, noteY);
      ctx.lineTo(x + 2 + radius, noteY);
      ctx.quadraticCurveTo(x + 2, noteY, x + 2, noteY - radius);
      ctx.lineTo(x + 2, noteY - noteHeight + radius);
      ctx.quadraticCurveTo(x + 2, noteY - noteHeight, x + 2 + radius, noteY - noteHeight);
      ctx.fill();
      
      ctx.shadowBlur = 0;
    });
  }, [currentTime, song]);

  const update = useCallback((time: number) => {
    const loop = (t: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = t;
        requestRef.current = requestAnimationFrame(loop);
        return;
      }

      const deltaTime = (t - lastTimeRef.current) / 1000;
      lastTimeRef.current = t;

      setCurrentTime((prev) => {
        const next = prev + deltaTime;
        
        // Scoring logic
        song.notes.forEach((note, index) => {
          if (processedNotes.current.has(index)) return;

          const timeDiff = Math.abs(next - note.time);
          
          // Check if note was missed
          if (next > note.time + 0.2) {
            processedNotes.current.add(index);
            setStats(s => ({ ...s, miss: s.miss + 1 }));
            setCombo(0);
            addFeedback('MISS', 'miss', note.midi);
            return;
          }

          // Check if user is pressing the right note at the right time
          if (activeNotes.has(note.midi) && timeDiff < 0.15) {
            processedNotes.current.add(index);
            let type: Feedback['type'] = 'good';
            let points = 50;
            let text = 'GOOD';

            if (timeDiff < 0.05) {
              type = 'perfect';
              points = 100;
              text = 'PERFECT';
              setStats(s => ({ ...s, perfect: s.perfect + 1, score: s.score + points }));
            } else {
              setStats(s => ({ ...s, good: s.good + 1, score: s.score + points }));
            }

            setCombo(c => c + 1);
            addFeedback(text, type, note.midi);
          }
        });

        if (next >= song.duration + 2) {
          setIsPlaying(false);
          handleSongEnd();
        }

        return next;
      });

      draw();
      requestRef.current = requestAnimationFrame(loop);
    };
    
    requestRef.current = requestAnimationFrame(loop);
  }, [song, activeNotes, draw, handleSongEnd]);

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(update);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, update]);

  const start = () => {
    setIsPlaying(true);
    lastTimeRef.current = performance.now();
  };

  return (
    <div className="relative flex flex-col items-center bg-slate-950 p-4 rounded-t-xl overflow-hidden">
      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-md p-3 rounded-lg border border-white/10">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-mono">Score</div>
          <div className="text-2xl font-bold text-white font-mono">{stats.score.toLocaleString()}</div>
        </div>
        
        <div className="flex flex-col items-center">
          <AnimatePresence mode="wait">
            {combo > 1 && (
              <motion.div
                key={combo}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="text-4xl font-black text-indigo-400 italic drop-shadow-[0_0_10px_rgba(129,140,248,0.5)]"
              >
                {combo}x COMBO
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-black/40 backdrop-blur-md p-3 rounded-lg border border-white/10 text-right">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-mono">Accuracy</div>
          <div className="text-2xl font-bold text-white font-mono">
            {song.notes.length > 0 
              ? Math.round(((stats.perfect + stats.good) / Math.max(1, processedCount)) * 100)
              : 0}%
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
              className={`absolute -translate-x-1/2 font-black text-xl italic ${
                f.type === 'perfect' ? 'text-yellow-400' : 
                f.type === 'good' ? 'text-emerald-400' : 
                f.type === 'miss' ? 'text-rose-500' : 'text-orange-500'
              }`}
            >
              {f.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <canvas
        ref={canvasRef}
        width={(KEYBOARD_END - KEYBOARD_START + 1) * NOTE_WIDTH}
        height={600}
        className="bg-slate-900/50 rounded-lg shadow-2xl border border-slate-800"
      />

      {!isPlaying && processedCount === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-40">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={start}
            className="px-12 py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-2xl font-bold shadow-xl shadow-indigo-500/20 flex items-center gap-3"
          >
            <Star className="fill-current" />
            START PRACTICE
          </motion.button>
        </div>
      )}

      {processedCount === song.notes.length && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-50">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center p-8 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl max-w-md w-full"
          >
            <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Practice Complete!</h2>
            <div className="grid grid-cols-2 gap-4 my-6">
              <div className="p-3 bg-slate-800 rounded-xl">
                <div className="text-xs text-slate-400 uppercase">Perfect</div>
                <div className="text-xl font-bold text-yellow-400">{stats.perfect}</div>
              </div>
              <div className="p-3 bg-slate-800 rounded-xl">
                <div className="text-xs text-slate-400 uppercase">Good</div>
                <div className="text-xl font-bold text-emerald-400">{stats.good}</div>
              </div>
              <div className="p-3 bg-slate-800 rounded-xl">
                <div className="text-xs text-slate-400 uppercase">Miss</div>
                <div className="text-xl font-bold text-rose-400">{stats.miss}</div>
              </div>
              <div className="p-3 bg-slate-800 rounded-xl">
                <div className="text-xs text-slate-400 uppercase">Accuracy</div>
                <div className="text-xl font-bold text-white">
                  {Math.round(((stats.perfect + stats.good) / song.notes.length) * 100)}%
                </div>
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-6">Saving your progress...</p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
