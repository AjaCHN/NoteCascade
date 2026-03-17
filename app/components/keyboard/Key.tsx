// app/components/keyboard/Key.tsx v2.3.1
import React from 'react';
import { motion } from 'motion/react';

interface KeyProps {
  midi: number;
  isBlack: boolean;
  isActive: boolean;
  velocity: number;
  left: number;
  width: number;
  showNoteNames: boolean;
  noteName: string;
  mappedKey: string;
}

export function Key({
  midi, isBlack, isActive, velocity, left, width,
  showNoteNames, noteName, mappedKey
}: KeyProps) {
  return (
    <div
      data-midi={midi}
      className={`absolute cursor-pointer rounded-b-md transition-colors duration-75 ${
        isBlack ? 'bg-black border border-white/20 shadow-sm' : 'bg-white border-r border-black/20 shadow-sm'
      }`}
      style={{
        left: `${left}%`,
        width: `${width}%`,
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
          {noteName}
        </span>
      )}
      {mappedKey && (
        <span className={`absolute ${isBlack ? 'bottom-2 text-white/70' : 'bottom-6 text-slate-500'} left-1/2 -translate-x-1/2 text-xs sm:text-sm font-mono font-black pointer-events-none`}>
          {mappedKey}
        </span>
      )}
    </div>
  );
}
