// app/components/NumberedNotationView.tsx v1.0.0
'use client';

import React, { useMemo, useEffect, useRef } from 'react';
import type { Song } from '../lib/songs/types';
import { useTheme } from '../lib/store';

interface NumberedNotationViewProps {
  song: Song;
  currentTime: number;
  height: number;
  isPlaying: boolean;
}

export function NumberedNotationView({ song, currentTime, height, isPlaying }: NumberedNotationViewProps) {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(true);

  // Convert MIDI notes to numbered notation (Jianpu)
  const notationData = useMemo(() => {
    if (!song.notes) return [];

    // Sort notes by time
    const sortedNotes = [...song.notes].sort((a, b) => a.time - b.time);
    
    // Group by measures (assuming 4/4, 120bpm for simplicity if not provided)
    // Or just a continuous stream for now
    return sortedNotes.map(note => {
      const midi = note.midi;
      const octave = Math.floor(midi / 12) - 1;
      const noteInOctave = midi % 12;
      
      // Map to 1-7
      // C=0, C#=1, D=2, D#=3, E=4, F=5, F#=6, G=7, G#=8, A=9, A#=10, B=11
      // 1    1#    2    2#    3    4    4#    5    5#    6    6#     7
      const map = ['1', '1#', '2', '2#', '3', '4', '4#', '5', '5#', '6', '6#', '7'];
      const num = map[noteInOctave];
      
      // Determine octave dots
      // Base octave is 4 (C4 = 60)
      const octaveDiff = octave - 4;
      
      return {
        ...note,
        num,
        octaveDiff,
        isSharp: num.includes('#'),
        baseNum: num.replace('#', '')
      };
    });
  }, [song.notes]);

  // Auto-scroll logic
  useEffect(() => {
    if (isPlaying && autoScrollRef.current && containerRef.current) {
      // Find the note closest to current time
      const activeNoteIndex = notationData.findIndex(n => n.time >= currentTime);
      if (activeNoteIndex !== -1) {
        const element = containerRef.current.children[activeNoteIndex] as HTMLElement;
        if (element) {
          containerRef.current.scrollTo({
            top: element.offsetTop - height / 2 + 50,
            behavior: 'smooth'
          });
        }
      }
    }
  }, [currentTime, isPlaying, notationData, height]);

  const bgColor = theme === 'light' ? 'bg-slate-50' : 'bg-slate-950';
  const textColor = theme === 'light' ? 'text-slate-800' : 'text-slate-200';
  const activeColor = 'text-indigo-500 font-bold scale-110';

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full overflow-y-auto ${bgColor} p-8 transition-colors duration-300`}
      onWheel={() => { autoScrollRef.current = false; }}
      onTouchMove={() => { autoScrollRef.current = false; }}
      onClick={() => { autoScrollRef.current = true; }}
    >
      <div className="max-w-3xl mx-auto">
        <h2 className={`text-2xl font-bold mb-6 text-center ${textColor}`}>{song.title}</h2>
        <div className="flex flex-wrap gap-4 justify-center content-start">
          {notationData.map((note, idx) => {
            const isActive = currentTime >= note.time && currentTime < note.time + note.duration;
            const isPast = currentTime > note.time + note.duration;
            
            return (
              <div 
                key={idx}
                className={`
                  relative flex flex-col items-center justify-center w-12 h-16 
                  transition-all duration-200
                  ${isActive ? activeColor : isPast ? 'opacity-50' : textColor}
                `}
              >
                {/* Top dots for higher octaves */}
                <div className="h-4 flex flex-col justify-end gap-0.5 mb-1">
                  {note.octaveDiff > 0 && Array.from({ length: note.octaveDiff }).map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-current" />
                  ))}
                </div>

                {/* The Number */}
                <div className="text-2xl font-serif relative">
                  {note.baseNum}
                  {note.isSharp && (
                    <span className="absolute -top-1 -right-3 text-xs">♯</span>
                  )}
                </div>

                {/* Bottom dots for lower octaves */}
                <div className="h-4 flex flex-col justify-start gap-0.5 mt-1">
                  {note.octaveDiff < 0 && Array.from({ length: Math.abs(note.octaveDiff) }).map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-current" />
                  ))}
                </div>
                
                {/* Rhythm underline (simplified) */}
                <div className="absolute bottom-0 w-full h-0.5 bg-current opacity-20" />
              </div>
            );
          })}
        </div>
        <div className="h-64" /> {/* Spacer for scrolling */}
      </div>
    </div>
  );
}
