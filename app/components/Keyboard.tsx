'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { startNote as startAudioNote, stopNote as stopAudioNote } from '../lib/audio';

interface KeyboardProps {
  activeNotes: Map<number, number>;
  startNote: number;
  endNote: number;
  showNoteNames: boolean;
  onNoteOn?: (midi: number) => void;
  onNoteOff?: (midi: number) => void;
}

export function Keyboard({
  activeNotes,
  startNote,
  endNote,
  showNoteNames,
  onNoteOn,
  onNoteOff,
}: KeyboardProps) {
  const [localActiveNotes, setLocalActiveNotes] = useState<Set<number>>(new Set());
  const totalKeys = endNote - startNote + 1;
  const keyWidth = 100 / totalKeys; // Percentage width

  const handlePointerDown = useCallback((midi: number, e?: React.PointerEvent) => {
    if (e) {
      // For touch devices, we might want to prevent default to avoid scrolling while playing
      // e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
    startAudioNote(midi);
    setLocalActiveNotes(prev => new Set(prev).add(midi));
    onNoteOn?.(midi);
  }, [onNoteOn]);

  const handlePointerUp = useCallback((midi: number, e?: React.PointerEvent) => {
    if (e) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
    stopAudioNote(midi);
    setLocalActiveNotes(prev => {
      const next = new Set(prev);
      next.delete(midi);
      return next;
    });
    onNoteOff?.(midi);
  }, [onNoteOff]);

  const handlePointerEnter = useCallback((midi: number, e: React.PointerEvent) => {
    if (e.buttons === 1) {
      handlePointerDown(midi);
    }
  }, [handlePointerDown]);

  const handlePointerLeave = useCallback((midi: number) => {
    let wasActive = false;
    setLocalActiveNotes(prev => {
      if (prev.has(midi)) {
        wasActive = true;
        const next = new Set(prev);
        next.delete(midi);
        return next;
      }
      return prev;
    });
    if (wasActive) {
      stopAudioNote(midi);
      onNoteOff?.(midi);
    }
  }, [onNoteOff]);

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

  const keys = Array.from({ length: totalKeys }, (_, i) => startNote + i);

  return (
    <div className="relative flex h-32 w-full bg-black border-t border-white/10 select-none touch-none">
      {keys.map((midi) => {
        const isActive = activeNotes.has(midi) || localActiveNotes.has(midi);
        const velocity = activeNotes.get(midi) || (localActiveNotes.has(midi) ? 0.7 : 0);
        const isBlack = isBlackKey(midi);

        return (
          <div
            key={midi}
            onPointerDown={(e) => handlePointerDown(midi, e)}
            onPointerUp={(e) => handlePointerUp(midi, e)}
            onPointerEnter={(e) => handlePointerEnter(midi, e)}
            onPointerLeave={() => handlePointerLeave(midi)}
            onPointerCancel={(e) => handlePointerUp(midi, e)}
            className={`absolute h-full cursor-pointer ${isBlack ? 'w-[0.8%]' : 'w-[1.2%]'} ${isBlack ? 'bg-black border-white/10' : 'bg-white border-black/10'} border-r`}
            style={{
              left: `${(midi - startNote) * keyWidth}%`,
              zIndex: isBlack ? 10 : 5,
              width: `${keyWidth}%`,
            }}
          >
            {isActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: Math.max(0.3, velocity * 0.8) }}
                className={`absolute inset-0 bg-indigo-500/50`}
              />
            )}
            {showNoteNames && !isBlack && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] text-black font-bold opacity-70 pointer-events-none">
                {getNoteName(midi)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
