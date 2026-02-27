'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { startNote as startAudioNote, stopNote as stopAudioNote } from '../lib/audio';

interface KeyboardProps {
  activeNotes: Map<number, number>;
  startNote: number;
  endNote: number;
  showNoteNames: boolean;
  showKeymap?: boolean;
  keyMap?: Record<string, number>;
  onNoteOn?: (midi: number) => void;
  onNoteOff?: (midi: number) => void;
}

export function Keyboard({
  activeNotes,
  startNote,
  endNote,
  showNoteNames,
  showKeymap,
  keyMap,
  onNoteOn,
  onNoteOff,
}: KeyboardProps) {
  const [localActiveNotes, setLocalActiveNotes] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const activePointers = useRef<Map<number, number>>(new Map()); // pointerId -> midi

  const isBlackKey = (midi: number) => {
    const note = midi % 12;
    return [1, 3, 6, 8, 10].includes(note);
  };

  const getNoteName = (midi: number) => {
    const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midi / 12) - 1;
    const name = names[midi % 12];
    return `${name}${octave}`;
  };

  // Calculate layout
  const keys = Array.from({ length: endNote - startNote + 1 }, (_, i) => startNote + i);
  const whiteKeys = keys.filter(midi => !isBlackKey(midi));
  const whiteKeyWidth = 100 / whiteKeys.length;

  const handleKeyPress = useCallback((midi: number) => {
    startAudioNote(midi);
    setLocalActiveNotes(prev => new Set(prev).add(midi));
    onNoteOn?.(midi);
  }, [onNoteOn]);

  const handleKeyRelease = useCallback((midi: number) => {
    stopAudioNote(midi);
    setLocalActiveNotes(prev => {
      const next = new Set(prev);
      next.delete(midi);
      return next;
    });
    onNoteOff?.(midi);
  }, [onNoteOff]);

  const handlePointerDown = (e: React.PointerEvent) => {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const midiStr = el?.getAttribute('data-midi');
    if (midiStr) {
      const midi = parseInt(midiStr, 10);
      activePointers.current.set(e.pointerId, midi);
      handleKeyPress(midi);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activePointers.current.has(e.pointerId)) return;
    
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const midiStr = el?.getAttribute('data-midi');
    const currentMidi = activePointers.current.get(e.pointerId);
    
    if (midiStr) {
      const newMidi = parseInt(midiStr, 10);
      if (currentMidi !== newMidi) {
        if (currentMidi !== undefined) handleKeyRelease(currentMidi);
        handleKeyPress(newMidi);
        activePointers.current.set(e.pointerId, newMidi);
      }
    } else {
      if (currentMidi !== undefined) {
        handleKeyRelease(currentMidi);
        activePointers.current.delete(e.pointerId);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const currentMidi = activePointers.current.get(e.pointerId);
    if (currentMidi !== undefined) {
      handleKeyRelease(currentMidi);
      activePointers.current.delete(e.pointerId);
    }
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      activePointers.current.forEach((midi) => handleKeyRelease(midi));
      activePointers.current.clear();
    };
  }, [handleKeyRelease]);

  let whiteKeyIndex = 0;

  return (
    <div 
      ref={containerRef}
      className="relative flex h-32 w-full bg-black border-t border-white/10 select-none touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {keys.map((midi) => {
        const isBlack = isBlackKey(midi);
        const isActive = activeNotes.has(midi) || localActiveNotes.has(midi);
        const velocity = activeNotes.get(midi) || (localActiveNotes.has(midi) ? 0.7 : 0);
        
        let left = 0;
        if (!isBlack) {
          left = whiteKeyIndex * whiteKeyWidth;
          whiteKeyIndex++;
        } else {
          // Black key is positioned relative to the previous white key
          left = (whiteKeyIndex - 1) * whiteKeyWidth + (whiteKeyWidth * 0.65);
        }

        // Find mapped key if any
        let mappedKey = '';
        if (showKeymap && keyMap) {
          const entry = Object.entries(keyMap).find(([_, m]) => m === midi);
          if (entry) {
            mappedKey = entry[0].toUpperCase();
          }
        }

        return (
          <div
            key={midi}
            data-midi={midi}
            className={`absolute cursor-pointer rounded-b-md transition-colors duration-75 ${
              isBlack 
                ? 'bg-black border border-white/20 shadow-sm' 
                : 'bg-white border-r border-black/20 shadow-sm'
            }`}
            style={{
              left: `${left}%`,
              width: `${isBlack ? whiteKeyWidth * 0.7 : whiteKeyWidth}%`,
              height: isBlack ? '60%' : '100%',
              zIndex: isBlack ? 10 : 5,
            }}
          >
            {isActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: Math.max(0.3, velocity * 0.8) }}
                className={`absolute inset-0 rounded-b-md ${isBlack ? 'bg-indigo-500/60' : 'bg-indigo-500/40'}`}
                style={{ pointerEvents: 'none' }}
              />
            )}
            {showNoteNames && !isBlack && (
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-slate-800 font-bold opacity-60 pointer-events-none">
                {getNoteName(midi)}
              </span>
            )}
            {showKeymap && mappedKey && (
              <span className={`absolute ${isBlack ? 'bottom-2 text-white/70' : 'bottom-6 text-slate-500'} left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold pointer-events-none`}>
                {mappedKey}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
