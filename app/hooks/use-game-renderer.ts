// app/hooks/use-game-renderer.ts v1.5.2
'use client';

import { useEffect, useRef } from 'react';
import { Song } from '../lib/songs';
import { Feedback, HIT_LINE_Y, GOOD_THRESHOLD, PERFECT_THRESHOLD } from './use-game-engine';

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
    const ctx = canvas.getContext('2d', { alpha: false }); // Performance hint: no alpha for background
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const { width, height } = dimensions;
      const hitLineY = height - HIT_LINE_Y;

      // Background - use opaque colors where possible
      let bgColor = '#020617';
      if (theme === 'light') bgColor = '#f8fafc';
      else if (theme === 'cyber') bgColor = '#050505';
      else if (theme === 'classic') bgColor = '#2d1b0d';
      
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      // Draw grid lines - subtle, no need for complex paths
      ctx.strokeStyle = theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      const gridSpacing = 0.5 * FALL_SPEED;
      ctx.beginPath();
      for (let y = hitLineY; y > 0; y -= gridSpacing) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Draw hit line with glow
      const mainColor = theme === 'cyber' ? '#00ff00' : theme === 'classic' ? '#d97706' : '#6366f1';
      
      // Use a simpler glow for performance
      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, hitLineY);
      ctx.lineTo(width, hitLineY);
      ctx.stroke();

      // Draw key markers on the baseline
      const markerColor = theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
      const blackMarkerColor = theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)';
      
      for (let midi = keyboardRange.start; midi <= keyboardRange.end; midi++) {
        const geo = keyGeometries.get(midi);
        if (geo) {
          ctx.fillStyle = geo.isBlack ? blackMarkerColor : markerColor;
          ctx.fillRect(geo.x, hitLineY, geo.isBlack ? geo.width : 1, HIT_LINE_Y);
        }
      }

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
        ctx.lineWidth = 2; // Thinner for performance
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Update active note start times
      activeNotes.forEach((_, midi) => {
        if (!activeNoteStartTimes.current.has(midi)) {
          activeNoteStartTimes.current.set(midi, now);
        }
      });
      for (const midi of activeNoteStartTimes.current.keys()) {
        if (!activeNotes.has(midi)) {
          activeNoteStartTimes.current.delete(midi);
        }
      }

      // Draw active note columns
      const glowColor = theme === 'cyber' ? '0, 255, 0' : theme === 'classic' ? '217, 119, 6' : '99, 102, 241';
      activeNotes.forEach((velocity, midi) => {
        if (midi >= keyboardRange.start && midi <= keyboardRange.end) {
          const geo = keyGeometries.get(midi);
          if (!geo) return;
          const x = geo.x;
          const currentKeyWidth = geo.width;
          const startTime = activeNoteStartTimes.current.get(midi) || now;
          const duration = now - startTime;
          
          const growHeight = Math.min(height - 50, 100 + duration * 0.8);
          const baseOpacity = 0.1 + (velocity * 0.4);
          
          // Use solid color with alpha instead of gradient for performance
          ctx.fillStyle = `rgba(${glowColor}, ${baseOpacity})`;
          ctx.fillRect(x + 1, hitLineY - growHeight, currentKeyWidth - 2, growHeight);
          
          ctx.fillStyle = theme === 'light' ? `rgba(0, 0, 0, ${0.8 * velocity})` : `rgba(255, 255, 255, ${0.8 * velocity})`;
          ctx.fillRect(x + 2, hitLineY - 2, currentKeyWidth - 4, 4);
        }
      });

      // Draw timing bar
      const barWidth = Math.min(400, width * 0.6);
      const barHeight = 12;
      const barX = (width - barWidth) / 2;
      const barY = 40;

      ctx.fillStyle = theme === 'light' ? 'rgba(241, 245, 249, 0.9)' : 'rgba(15, 23, 42, 0.8)';
      ctx.beginPath();
      ctx.roundRect(barX, barY, barWidth, barHeight, 6);
      ctx.fill();
      
      ctx.strokeStyle = theme === 'light' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = theme === 'light' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(barX + barWidth / 2 - 1.5, barY - 6, 3, barHeight + 12);

      const perfectZoneWidth = barWidth * (PERFECT_THRESHOLD / GOOD_THRESHOLD);
      ctx.fillStyle = 'rgba(52, 211, 153, 0.15)';
      ctx.fillRect(barX + barWidth / 2 - perfectZoneWidth / 2, barY + 1, perfectZoneWidth, barHeight - 2);

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
        ctx.roundRect(hitX - 3, barY - 2, 6, barHeight + 4, 3);
        ctx.fill();
      });

      ctx.fillStyle = theme === 'light' ? 'rgba(100, 116, 139, 0.9)' : 'rgba(148, 163, 184, 0.9)';
      ctx.font = 'bold 11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(t.early.toUpperCase(), barX, barY + 28);
      ctx.fillText(t.late.toUpperCase(), barX + barWidth, barY + 28);
      
      ctx.fillStyle = 'rgba(52, 211, 153, 0.9)';
      ctx.fillText(t.perfect.toUpperCase(), barX + barWidth / 2, barY + 28);

      // Draw falling notes
      if (song.notes) {
        const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const noteNameColor = 'rgba(255, 255, 255, 0.8)';
        ctx.font = 'bold 10px Inter';
        ctx.textAlign = 'center';

        for (let i = 0; i < song.notes.length; i++) {
          const note = song.notes[i];
          const geo = keyGeometries.get(note.midi);
          if (!geo) continue;
          
          const noteX = geo.x;
          const currentKeyWidth = geo.width;
          const noteY = hitLineY - (note.time - currentTime) * FALL_SPEED;
          const noteHeight = note.duration * FALL_SPEED;

          if (noteY + noteHeight > 0 && noteY < height) {
            const hue = (note.midi * 137.5) % 360;
            
            // Use solid color for performance
            ctx.fillStyle = `hsla(${hue}, 80%, 50%, 0.9)`;
            ctx.beginPath();
            ctx.roundRect(noteX + 2, noteY - noteHeight, currentKeyWidth - 4, noteHeight, 6);
            ctx.fill();
            
            // Subtle highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.fillRect(noteX + 4, noteY - noteHeight + 2, currentKeyWidth - 8, 3);

            // Baseline touch effect - simplified
            if (noteY >= hitLineY && noteY - noteHeight <= hitLineY) {
              const contactOpacity = 0.4 + Math.sin(now / 50) * 0.2;
              ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${contactOpacity})`;
              ctx.fillRect(noteX - 1, hitLineY - 2, currentKeyWidth + 2, 4);
            }

            if (showNoteNames && noteHeight > 24) {
              const octave = Math.floor(note.midi / 12) - 1;
              const noteName = `${names[note.midi % 12]}${octave}`;
              ctx.fillStyle = noteNameColor;
              ctx.fillText(noteName, noteX + currentKeyWidth / 2, noteY - noteHeight / 2 + 4);
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [song, currentTime, dimensions, activeNotes, t, keyboardRange, showNoteNames, theme, keyGeometries, recentHits, hitEffects, canvasRef]);
}
