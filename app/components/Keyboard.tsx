'use client';

import React from 'react';
import { motion } from 'motion/react';

interface KeyboardProps {
  activeNotes: Map<number, number>;
  startNote: number;
  endNote: number;
  showNoteNames: boolean;
}

export function Keyboard({
  activeNotes,
  startNote,
  endNote,
  showNoteNames,
}: KeyboardProps) {
  const totalKeys = endNote - startNote + 1;
  const keyWidth = 100 / totalKeys; // Percentage width

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
    <div className="relative flex h-32 w-full bg-black border-t border-white/10">
      {keys.map((midi) => {
        const isActive = activeNotes.has(midi);
        const velocity = activeNotes.get(midi) || 0;
        const isBlack = isBlackKey(midi);

        return (
          <div
            key={midi}
            className={`absolute h-full ${isBlack ? 'w-[0.8%]' : 'w-[1.2%]'} ${isBlack ? 'bg-black border-white/10' : 'bg-white border-black/10'} border-r`}
            style={{
              left: `${(midi - startNote) * keyWidth}%`,
              zIndex: isBlack ? 10 : 5,
              width: `${keyWidth}%`,
            }}
          >
            {isActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: velocity * 0.8 }}
                className={`absolute inset-0 bg-indigo-500/50`}
              />
            )}
            {showNoteNames && !isBlack && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] text-black font-bold opacity-70">
                {getNoteName(midi)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
