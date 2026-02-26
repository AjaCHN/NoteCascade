'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface KeyboardProps {
  activeNotes: Map<number, number>;
  startNote?: number;
  endNote?: number;
  showNoteNames?: boolean;
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * A visually appealing MIDI keyboard component with real-time feedback.
 */
export function Keyboard({ activeNotes, startNote = 48, endNote = 84, showNoteNames = true }: KeyboardProps) {
  const keys = useMemo(() => {
    const result = [];
    for (let i = startNote; i <= endNote; i++) {
      const noteName = NOTE_NAMES[i % 12];
      const isBlack = noteName.includes('#');
      result.push({ midi: i, isBlack, noteName });
    }
    return result;
  }, [startNote, endNote]);

  return (
    <div id="piano-keyboard" className="relative flex h-28 md:h-40 w-full justify-center overflow-hidden rounded-b-2xl border-t-4 md:border-t-8 border-slate-900 bg-slate-950 select-none shadow-2xl">
      <div className="flex relative w-full max-w-7xl px-4">
        {keys.map((key) => {
          const isActive = activeNotes.has(key.midi);
          
          if (key.isBlack) {
            return null; // Black keys are rendered relative to white keys
          } else {
            const blackKey = keys.find(k => k.midi === key.midi + 1 && k.isBlack);
            return (
              <motion.div
                key={key.midi}
                animate={{
                  backgroundColor: isActive ? '#f8fafc' : '#ffffff',
                  boxShadow: isActive 
                    ? 'inset 0 -10px 20px rgba(99, 102, 241, 0.2), 0 0 15px rgba(99, 102, 241, 0.1)' 
                    : 'inset 0 -5px 0 rgba(0,0,0,0.05)',
                  y: isActive ? 2 : 0
                }}
                className="relative z-10 flex flex-1 h-full flex-col justify-end rounded-b-xl border-x border-b border-slate-200 pb-4 text-center transition-all cursor-pointer"
              >
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter mb-1">
                  {showNoteNames ? key.noteName : ''}
                </span>
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-x-2 bottom-2 h-1 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]"
                    />
                  )}
                </AnimatePresence>

                {blackKey && (
                  <motion.div
                    animate={{
                      backgroundColor: activeNotes.has(blackKey.midi) ? '#6366f1' : '#1e293b',
                      height: activeNotes.has(blackKey.midi) ? '56%' : '60%',
                      boxShadow: activeNotes.has(blackKey.midi) 
                        ? '0 10px 20px rgba(99, 102, 241, 0.4), inset 0 -4px 0 rgba(0,0,0,0.2)' 
                        : '0 4px 6px rgba(0,0,0,0.3), inset 0 -4px 0 rgba(0,0,0,0.4)',
                      y: activeNotes.has(blackKey.midi) ? 2 : 0
                    }}
                    className="absolute right-0 top-0 w-3/5 rounded-b-lg border border-slate-950 cursor-pointer transition-all z-20 transform -translate-x-1/2"
                  >
                    <div className="absolute inset-x-1 top-1 h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-sm" />
                  </motion.div>
                )}
              </motion.div>
            );
          }
        })}
      </div>
    </div>
  );
}
