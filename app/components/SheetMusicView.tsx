'use client';

import React, { useEffect, useRef } from 'react';
import Vex from 'vexflow';
import { Song } from '../lib/songs';
import { useTheme } from '../lib/store';

interface SheetMusicViewProps {
  song: Song;
  width: number;
  height: number;
}

export function SheetMusicView({ song, width, height }: SheetMusicViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  useEffect(() => {
    if (!containerRef.current || !song.notes) return;

    // Clear previous rendering
    containerRef.current.innerHTML = '';

    const { Factory } = Vex.Flow;
    const vf = new Factory({
      renderer: { elementId: containerRef.current, width, height: Math.max(height, 500) }
    });

    const score = vf.EasyScore();
    const system = vf.System();

    // Group notes into measures (simplified logic)
    // Assuming 4/4 time signature for simplicity
    const notes = song.notes;
    const notesPerMeasure = 4; // approximate
    
    // Convert internal notes to VexFlow notes
    // This is a complex mapping. For now, let's just render a sample or the first few bars.
    // Real implementation requires robust quantization and measure splitting.
    
    // Simplified: Just render the first few notes to prove integration
    const vfNotes = notes.slice(0, 16).map(n => {
      const noteName = getNoteName(n.midi);
      // Default to quarter notes for visualization
      return `${noteName}/q`;
    }).join(', ');

    if (vfNotes) {
        try {
            system.addStave({
                voices: [
                    score.voice(score.notes(vfNotes, { stem: 'up' }))
                ]
            }).addClef('treble').addTimeSignature('4/4');
            
            vf.draw();
        } catch (e) {
            console.error("VexFlow rendering error:", e);
            containerRef.current.innerHTML = '<div class="p-4 text-center opacity-50">Sheet music rendering is experimental.</div>';
        }
    }

    // Style adjustments for theme
    const svg = containerRef.current.querySelector('svg');
    if (svg) {
      svg.style.width = '100%';
      svg.style.height = '100%';
      if (theme === 'dark' || theme === 'cyber') {
        svg.style.filter = 'invert(1) hue-rotate(180deg)';
      }
    }

  }, [song, width, height, theme]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full overflow-y-auto bg-white dark:bg-slate-900 transition-colors duration-300"
    />
  );
}

function getNoteName(midi: number): string {
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const note = names[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${note}${octave}`;
}
