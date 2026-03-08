// app/components/Keyboard.tsx v2.4.1
'use client';

import React, { useMemo } from 'react';
import { motion } from 'motion/react';

interface KeyboardProps {
  activeNotes: Map<number, number>;
  startNote: number;
  endNote: number;
  showNoteNames: boolean;
  showKeymap: boolean;
  keyMap: Record<string, number>;
  onNoteOn: (midi: number) => void;
  onNoteOff: (midi: number) => void;
}

export function Keyboard({
  activeNotes,
  startNote,
  endNote,
  showNoteNames,
  showKeymap,
  keyMap,
  onNoteOn,
  onNoteOff
}: KeyboardProps) {
  const keys = useMemo(() => {
    const result = [];
    for (let i = startNote; i <= endNote; i++) {
      result.push(i);
    }
    return result;
  }, [startNote, endNote]);

  const isBlackKey = (midi: number) => [1, 3, 6, 8, 10].includes(midi % 12);
  const getNoteName = (midi: number) => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return notes[midi % 12];
  };

  const getKeyLabel = (midi: number) => {
    if (!showKeymap) return null;
    const key = Object.entries(keyMap).find(([_key, m]) => m === midi)?.[0];
    return key ? key.toUpperCase() : null;
  };

  // Calculate white key width based on total white keys
  const whiteKeyCount = keys.filter(midi => !isBlackKey(midi)).length;
  const whiteKeyWidth = `${100 / whiteKeyCount}%`;

  return (
    <div className="w-full h-full flex relative select-none touch-none bg-zinc-900/50 backdrop-blur-sm">
      {keys.map((midi) => {
        const isBlack = isBlackKey(midi);
        if (isBlack) return null; // Render black keys separately or absolutely positioned

        const isActive = activeNotes.has(midi);
        const keyLabel = getKeyLabel(midi);

        return (
          <div
            key={midi}
            className="relative h-full border-r border-zinc-300/20 last:border-r-0 bg-white rounded-b-sm active:bg-zinc-100 transition-colors duration-75"
            style={{ width: whiteKeyWidth }}
            onMouseDown={() => onNoteOn(midi)}
            onMouseUp={() => onNoteOff(midi)}
            onMouseLeave={() => isActive && onNoteOff(midi)}
            onTouchStart={(e) => { e.preventDefault(); onNoteOn(midi); }}
            onTouchEnd={(e) => { e.preventDefault(); onNoteOff(midi); }}
          >
            {isActive && (
              <motion.div
                layoutId={`active-white-${midi}`}
                className="absolute inset-0 bg-indigo-500/50 rounded-b-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.05 }}
              />
            )}
            
            <div className="absolute bottom-2 left-0 right-0 flex flex-col items-center justify-end pointer-events-none">
              {showNoteNames && (
                <span className={`text-[10px] font-bold ${isActive ? 'text-white' : 'text-zinc-400'}`}>
                  {getNoteName(midi)}
                </span>
              )}
              {keyLabel && (
                <span className={`text-[8px] font-mono mt-0.5 ${isActive ? 'text-white/80' : 'text-zinc-300'}`}>
                  {keyLabel}
                </span>
              )}
            </div>
          </div>
        );
      })}

      {/* Render Black Keys */}
      {keys.map((midi) => {
        const isBlack = isBlackKey(midi);
        if (!isBlack) return null;

        const isActive = activeNotes.has(midi);
        
        // Calculate position
        // Find previous white key index
        const prevWhiteKeys = keys.filter(k => k < midi && !isBlackKey(k)).length;
        const leftPos = `calc(${prevWhiteKeys} * ${whiteKeyWidth} - (${whiteKeyWidth} * 0.35))`;
        const width = `calc(${whiteKeyWidth} * 0.7)`;

        const keyLabel = getKeyLabel(midi);

        return (
          <div
            key={midi}
            className="absolute top-0 h-[60%] z-10 bg-zinc-900 rounded-b-sm border border-zinc-800 shadow-md"
            style={{ left: leftPos, width: width }}
            onMouseDown={() => onNoteOn(midi)}
            onMouseUp={() => onNoteOff(midi)}
            onMouseLeave={() => isActive && onNoteOff(midi)}
            onTouchStart={(e) => { e.preventDefault(); onNoteOn(midi); }}
            onTouchEnd={(e) => { e.preventDefault(); onNoteOff(midi); }}
          >
            {isActive && (
              <motion.div
                layoutId={`active-black-${midi}`}
                className="absolute inset-0 bg-indigo-400 rounded-b-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.05 }}
              />
            )}
            
             <div className="absolute bottom-2 left-0 right-0 flex flex-col items-center justify-end pointer-events-none">
              {keyLabel && (
                <span className={`text-[8px] font-mono ${isActive ? 'text-white' : 'text-zinc-500'}`}>
                  {keyLabel}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
