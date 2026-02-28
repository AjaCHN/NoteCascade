'use client';

import { useEffect, useRef } from 'react';
import { Song } from '../lib/songs';
import { Feedback, HIT_LINE_Y, GOOD_THRESHOLD } from './use-game-engine';

const FALL_SPEED = 200;

export function useGameRenderer(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  song: Song,
  currentTime: number,
  dimensions: { width: number; height: number },
  activeNotes: Map<number, number>,
  keyboardRange: { start: number; end: number },
  keyGeometries: Map<number, { x: number, width: number, isBlack: boolean }>,
  theme: string,
  t: Record<string, string>,
  showNoteNames: boolean,
  recentHits: React.MutableRefObject<{ timeDiff: number; timestamp: number; type: Feedback['type'] }[]>,
  hitEffects: React.MutableRefObject<{ x: number; y: number; type: Feedback['type']; timestamp: number }[]>
) {
  const activeNoteStartTimes = useRef<Map<number, number>>(new Map());

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

      // Draw hit effects
      const now = Date.now();
      hitEffects.current = hitEffects.current.filter(effect => now - effect.timestamp < 500);
      hitEffects.current.forEach(effect => {
        const age = now - effect.timestamp;
        const progress = age / 500;
        const opacity = 1 - progress;
        const radius = 10 + progress * 40;
        
        let color = '255, 255, 255';
        if (effect.type === 'perfect') color = '52, 211, 153';
        else if (effect.type === 'good') color = '96, 165, 250';
        else if (effect.type === 'miss') color = '251, 191, 36';
        else if (effect.type === 'wrong') color = '244, 63, 94';

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

      // Draw active note columns
      activeNotes.forEach((velocity, midi) => {
        if (midi >= keyboardRange.start && midi <= keyboardRange.end) {
          const geo = keyGeometries.get(midi);
          if (!geo) return;
          const x = geo.x;
          const currentKeyWidth = geo.width;
          const startTime = activeNoteStartTimes.current.get(midi) || Date.now();
          const duration = Date.now() - startTime;
          
          const growHeight = Math.min(height - 50, 100 + duration * 0.8);
          const gradient = ctx.createLinearGradient(0, height - HIT_LINE_Y, 0, height - HIT_LINE_Y - growHeight);
          const glowColor = theme === 'cyber' ? '0, 255, 0' : theme === 'classic' ? '217, 119, 6' : '99, 102, 241';
          const baseOpacity = 0.2 + (velocity * 0.6);
          
          gradient.addColorStop(0, `rgba(${glowColor}, ${baseOpacity})`);
          gradient.addColorStop(1, `rgba(${glowColor}, 0)`);
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x + 1, height - HIT_LINE_Y - growHeight, currentKeyWidth - 2, growHeight);
          
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
          
          ctx.fillStyle = theme === 'light' ? `rgba(0, 0, 0, ${0.8 * velocity})` : `rgba(255, 255, 255, ${0.8 * velocity})`;
          ctx.fillRect(x + 2, height - HIT_LINE_Y - 2, currentKeyWidth - 4, 4);
        }
      });

      // Draw timing bar
      const barWidth = 300;
      const barHeight = 8;
      const barX = (width - barWidth) / 2;
      const barY = height - 100;

      ctx.fillStyle = theme === 'light' ? 'rgba(241, 245, 249, 0.8)' : 'rgba(15, 23, 42, 0.6)';
      ctx.beginPath();
      ctx.roundRect(barX, barY, barWidth, barHeight, 4);
      ctx.fill();
      ctx.strokeStyle = theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)';
      ctx.stroke();

      ctx.fillStyle = theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(barX + barWidth / 2 - 1, barY - 4, 2, barHeight + 8);

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

      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.font = 'bold 9px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(t.early.toUpperCase(), barX, barY + 24);
      ctx.fillText(t.late.toUpperCase(), barX + barWidth, barY + 24);
      ctx.fillText(t.perfect.toUpperCase(), barX + barWidth / 2, barY + 24);

      // Draw falling notes
      song.notes?.forEach((note) => {
        const geo = keyGeometries.get(note.midi);
        if (!geo) return;
        
        const noteX = geo.x;
        const currentKeyWidth = geo.width;
        const noteY = height - HIT_LINE_Y - (note.time - currentTime) * FALL_SPEED;
        const noteHeight = note.duration * FALL_SPEED;

        if (noteY + noteHeight > 0 && noteY < height) {
          const hue = (note.midi * 137.5) % 360;
          const gradient = ctx.createLinearGradient(noteX, noteY - noteHeight, noteX, noteY);
          gradient.addColorStop(0, `hsla(${hue}, 80%, 60%, 0.8)`);
          gradient.addColorStop(1, `hsla(${hue}, 80%, 40%, 0.9)`);
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(noteX + 2, noteY - noteHeight, currentKeyWidth - 4, noteHeight, 6);
          ctx.fill();
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.fillRect(noteX + 4, noteY - noteHeight + 2, currentKeyWidth - 8, 4);

          if (showNoteNames && noteHeight > 20) {
            const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            const octave = Math.floor(note.midi / 12) - 1;
            const noteName = `${names[note.midi % 12]}${octave}`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = 'bold 10px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(noteName, noteX + currentKeyWidth / 2, noteY - noteHeight / 2 + 4);
          }

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [song, currentTime, dimensions, activeNotes, t, keyboardRange, showNoteNames, theme, keyGeometries, recentHits, hitEffects, canvasRef]);
}
