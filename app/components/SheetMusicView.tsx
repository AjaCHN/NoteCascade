// app/components/SheetMusicView.tsx v2.5.2
'use client';
import React, { useEffect, useRef } from 'react';
import abcjs from 'abcjs';
import type { Song } from '../lib/songs/types';
import { convertToAbc } from '../lib/songs/abc';

interface SheetMusicViewProps {
  song: Song;
  currentTime: number;
  width: number;
  height: number;
}

export function SheetMusicView({ song, currentTime, width, height }: SheetMusicViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const noteTimingsRef = useRef<{ time: number, duration: number, element: Element }[]>([]);

  useEffect(() => {
    if (containerRef.current) {
      const abcString = convertToAbc(song);
      abcjs.renderAbc(containerRef.current, abcString, {
        responsive: 'resize',
        add_classes: true,
        staffwidth: Math.max(width - 40, 600),
        wrap: { minSpacing: 1.8, maxSpacing: 2.7, preferredMeasuresPerLine: 4 },
      });

      // Extract timings to sync with currentTime
      const svgNotes = containerRef.current.querySelectorAll('.abcjs-note');
      
      if (song.notes && svgNotes.length > 0) {
        const sortedNotes = [...song.notes].sort((a, b) => a.time - b.time);
        const timings: { time: number, duration: number, element: Element }[] = [];
        
        let svgIndex = 0;
        for (let i = 0; i < sortedNotes.length; i++) {
          if (svgIndex < svgNotes.length) {
            timings.push({
              time: sortedNotes[i].time,
              duration: sortedNotes[i].duration,
              element: svgNotes[svgIndex]
            });
            if (i === sortedNotes.length - 1 || sortedNotes[i+1].time > sortedNotes[i].time + 0.05) {
              svgIndex++;
            }
          }
        }
        noteTimingsRef.current = timings;
      } else {
        noteTimingsRef.current = [];
      }
    }
  }, [song, width]);

  useEffect(() => {
    const noteTimings = noteTimingsRef.current;
    if (noteTimings.length === 0) return;

    noteTimings.forEach(timing => {
      const isActive = currentTime >= timing.time && currentTime <= timing.time + timing.duration;
      if (isActive) {
        timing.element.classList.add('fill-indigo-500');
        timing.element.setAttribute('fill', '#6366f1'); // Tailwind indigo-500
      } else {
        timing.element.classList.remove('fill-indigo-500');
        timing.element.removeAttribute('fill');
      }
    });
    
    const activeTiming = noteTimings.find(t => currentTime >= t.time && currentTime <= t.time + t.duration);
    if (activeTiming && scrollRef.current) {
      const rect = activeTiming.element.getBoundingClientRect();
      const containerRect = scrollRef.current.getBoundingClientRect();
      
      if (rect.top < containerRect.top || rect.bottom > containerRect.bottom) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollTop + (rect.top - containerRect.top) - height / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [currentTime, height]);

  return (
    <div 
      ref={scrollRef}
      className="w-full h-full overflow-y-auto bg-white dark:bg-slate-100 rounded-xl p-4 shadow-inner"
      style={{ height: `${height}px` }}
    >
      <div ref={containerRef} className="w-full text-black" />
    </div>
  );
}
