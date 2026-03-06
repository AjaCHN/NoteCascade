// app/hooks/use-game-renderer.ts v2.1.5
'use client';

import { useEffect, useRef } from 'react';
import { Translation } from '../lib/translations';
import type { Song } from '../lib/songs/types';
import { HIT_LINE_Y } from './use-game-engine';
import type { Feedback } from './use-game-engine';
import type { PlayMode } from '../lib/store';
import { drawGrid, drawHitLine, drawKeyMarkers, FALL_SPEED, roundRect } from '../lib/renderer-utils';

interface FreePlayNote {
  midi: number;
  startTime: number;
  endTime: number | null;
  velocity: number;
}

export function useGameRenderer(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  song: Song,
  currentTime: number,
  dimensions: { width: number; height: number },
  activeNotes: Map<number, number>,
  keyboardRange: { start: number; end: number },
  keyGeometries: Map<number, { x: number, width: number, isBlack: boolean }>,
  theme: string,
  t: Translation,
  showNoteNames: boolean,
  recentHits: { timeDiff: number; timestamp: number; type: Feedback['type'] }[],
  hitEffects: React.MutableRefObject<{ x: number; y: number; type: Feedback['type']; timestamp: number }[]>,
  playMode: PlayMode
) {
  const activeNoteStartTimes = useRef<Map<number, number>>(new Map());
  const freePlayNotes = useRef<FreePlayNote[]>([]);
  const recentHitsRef = useRef(recentHits);

  useEffect(() => {
    recentHitsRef.current = recentHits;
  }, [recentHits]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    const render = () => {
      const { width, height } = dimensions;
      const hitLineY = height - HIT_LINE_Y;
      const now = Date.now();

      const bgColor = theme === 'light' ? '#f8fafc' : theme === 'cyber' ? '#050505' : theme === 'classic' ? '#2d1b0d' : '#020617';
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      drawGrid(ctx, width, height, hitLineY, theme);
      drawHitLine(ctx, width, hitLineY, theme);
      drawKeyMarkers(ctx, hitLineY, HIT_LINE_Y, keyboardRange, keyGeometries, theme);

      // Draw hit effects
      hitEffects.current = hitEffects.current.filter(effect => now - effect.timestamp < 500);
      hitEffects.current.forEach(effect => {
        const age = now - effect.timestamp;
        const progress = age / 500;
        const opacity = 1 - progress;
        const radius = 10 + progress * 40;
        const color = effect.type === 'perfect' ? '52, 211, 153' : effect.type === 'good' ? '96, 165, 250' : effect.type === 'miss' ? '251, 191, 36' : '244, 63, 94';
        ctx.strokeStyle = `rgba(${color}, ${opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Update active note start times
      activeNotes.forEach((velocity, midi) => {
        if (!activeNoteStartTimes.current.has(midi)) {
          activeNoteStartTimes.current.set(midi, now);
          if (playMode === 'free') freePlayNotes.current.push({ midi, startTime: now, endTime: null, velocity });
        }
      });
      for (const midi of activeNoteStartTimes.current.keys()) {
        if (!activeNotes.has(midi)) {
          activeNoteStartTimes.current.delete(midi);
          if (playMode === 'free') {
            const note = freePlayNotes.current.find(n => n.midi === midi && n.endTime === null);
            if (note) note.endTime = now;
          }
        }
      }

      // Draw active note columns
      if (playMode !== 'free') {
        const glowColor = theme === 'cyber' ? '0, 255, 0' : theme === 'classic' ? '217, 119, 6' : '99, 102, 241';
        activeNotes.forEach((velocity, midi) => {
          if (midi >= keyboardRange.start && midi <= keyboardRange.end) {
            const geo = keyGeometries.get(midi);
            if (!geo) return;
            const startTime = activeNoteStartTimes.current.get(midi) || now;
            const growHeight = Math.min(height - 50, 100 + (now - startTime) * 0.8);
            ctx.fillStyle = `rgba(${glowColor}, ${0.1 + (velocity * 0.4)})`;
            ctx.fillRect(geo.x + 1, hitLineY - growHeight, geo.width - 2, growHeight);
            ctx.fillStyle = theme === 'light' ? `rgba(0, 0, 0, ${0.8 * velocity})` : `rgba(255, 255, 255, ${0.8 * velocity})`;
            ctx.fillRect(geo.x + 2, hitLineY - 2, geo.width - 4, 4);
          }
        });
      }

      // Draw free play notes
      if (playMode === 'free') {
        freePlayNotes.current = freePlayNotes.current.filter(note => {
          const endTime = note.endTime || now;
          return hitLineY - (now - endTime) * (FALL_SPEED / 1000) > -500;
        });
        freePlayNotes.current.forEach(note => {
          const geo = keyGeometries.get(note.midi);
          if (!geo) return;
          const endTime = note.endTime || now;
          const noteTopY = hitLineY - (now - note.startTime) * (FALL_SPEED / 1000);
          const noteBottomY = hitLineY - (now - endTime) * (FALL_SPEED / 1000);
          const noteHeight = noteBottomY - noteTopY;
          if (noteHeight > 0) {
            const hue = (note.midi * 137.5) % 360;
            const opacity = note.endTime ? Math.max(0, 0.8 * (1 - (now - note.endTime) / 2000)) : 0.8;
            ctx.fillStyle = `hsla(${hue}, 80%, 50%, ${opacity})`;
            ctx.beginPath();
            roundRect(ctx, geo.x + 2, noteTopY, geo.width - 4, noteHeight, 6);
            ctx.fill();
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.2})`;
            ctx.fillRect(geo.x + 4, noteTopY + 2, geo.width - 8, Math.min(noteHeight - 4, 3));
          }
        });
      }

      if (playMode !== 'free') {
        // drawTimingBar(ctx, width, theme, t, recentHitsRef.current, PERFECT_THRESHOLD, GOOD_THRESHOLD);
      }

      // Draw falling notes
      if (playMode !== 'free' && song.notes) {
        const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        ctx.font = 'bold 10px Inter';
        ctx.textAlign = 'center';
        for (let i = 0; i < song.notes.length; i++) {
          const note = song.notes[i];
          const geo = keyGeometries.get(note.midi);
          if (!geo) continue;
          const noteY = hitLineY - (note.time - currentTime) * FALL_SPEED;
          const noteHeight = note.duration * FALL_SPEED;
          if (noteY + noteHeight > 0) {
            const hue = (note.midi * 137.5) % 360;
            ctx.fillStyle = `hsla(${hue}, 80%, 50%, 0.9)`;
            ctx.beginPath();
            roundRect(ctx, geo.x + 2, noteY - noteHeight, geo.width - 4, noteHeight, 6);
            ctx.fill();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.fillRect(geo.x + 4, noteY - noteHeight + 2, geo.width - 8, 3);
            if (noteY >= hitLineY && noteY - noteHeight <= hitLineY) {
              ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${0.4 + Math.sin(now / 50) * 0.2})`;
              ctx.fillRect(geo.x - 1, hitLineY - 2, geo.width + 2, 4);
            }
            if (showNoteNames && noteHeight > 24) {
              const noteName = `${names[note.midi % 12]}${Math.floor(note.midi / 12) - 1}`;
              ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
              ctx.fillText(noteName, geo.x + geo.width / 2, noteY - noteHeight / 2 + 4);
            }
          }
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [song, currentTime, dimensions, activeNotes, t, keyboardRange, showNoteNames, theme, keyGeometries, recentHits, hitEffects, canvasRef, playMode]);
}

