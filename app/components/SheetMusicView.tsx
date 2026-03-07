// app/components/SheetMusicView.tsx v2.0.0
'use client';

import React, { useEffect, useRef } from 'react';
import { Factory } from 'vexflow';
import type { Song } from '../lib/songs/types';
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
    const containerId = 'vexflow-container';
    // Create a wrapper for scrolling
    const wrapper = document.createElement('div');
    wrapper.id = containerId;
    containerRef.current.appendChild(wrapper);

    // Calculate dimensions
    // Estimate width based on number of measures.
    // Assuming 4/4 time, approx 4 beats per measure.
    // This is a very rough estimation.
    const notesCount = song.notes.length;
    const estimatedMeasures = Math.ceil(notesCount / 4); 
    const staveWidth = 250;
    const totalWidth = Math.max(width, estimatedMeasures * staveWidth);
    
    const vf = new Factory({
      renderer: { elementId: containerId, width: totalWidth, height: Math.max(height, 400) }
    });

    const score = vf.EasyScore();
    const system = vf.System();

    // Simplified rendering: Just dump notes into a single long stave for now
    // Real implementation requires complex measure splitting logic
    
    // Group notes into chunks of 4 (roughly a measure)
    const chunkSize = 4;
    const notes = song.notes.sort((a, b) => a.time - b.time);
    
    // Render measures
    for (let i = 0; i < notes.length; i += chunkSize) {
      const chunk = notes.slice(i, i + chunkSize);
      const vfNotes = chunk.map(n => {
        const noteName = getNoteName(n.midi);
        return `${noteName}/q`; // Force quarter notes for simplicity
      }).join(', ');

      if (vfNotes) {
        try {
            const stave = system.addStave({
                voices: [
                    score.voice(score.notes(vfNotes, { stem: 'up' }))
                ]
            });
            
            if (i === 0) {
                stave.addClef('treble').addTimeSignature('4/4');
            }
        } catch (e) {
            console.error("VexFlow rendering error:", e);
        }
      }
    }
    
    try {
        vf.draw();
    } catch (e) {
        console.warn("VexFlow draw error", e);
    }

    // Style adjustments for theme
    const svg = wrapper.querySelector('svg');
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
      className="w-full h-full overflow-auto bg-white dark:bg-slate-900 transition-colors duration-300 flex items-center justify-center"
    >
      {/* VexFlow content will be injected here */}
      {!song.notes && <div className="text-slate-500">No notes to display</div>}
    </div>
  );
}

function getNoteName(midi: number): string {
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const note = names[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${note}${octave}`;
}
