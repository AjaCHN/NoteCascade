'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface KeyboardProps {
  activeNotes: Map<number, number>;
  startNote?: number;
  endNote?: number;
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * A visually appealing MIDI keyboard component with real-time feedback.
 */
export function Keyboard({ activeNotes, startNote = 48, endNote = 84 }: KeyboardProps) {
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
                  backgroundColor: isActive ? '#e2e8f0' : '#ffffff',
                  boxShadow: isActive ? 'inset 0 0 15px rgba(99, 102, 241, 0.3)' : 'none',
                }}
                className="relative z-10 flex flex-1 h-full flex-col justify-end rounded-b-xl border border-slate-200 pb-4 text-center transition-colors cursor-pointer"
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  {key.noteName}
                </span>
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      exit={{ scaleY: 0 }}
                      className="absolute inset-x-0 bottom-0 h-1 bg-indigo-500 rounded-b-xl origin-bottom"
                    />
                  )}
                </AnimatePresence>

                {blackKey && (
                  <motion.div
                    animate={{
                      backgroundColor: activeNotes.has(blackKey.midi) ? '#6366f1' : '#0f172a',
                      height: activeNotes.has(blackKey.midi) ? '58%' : '62%',
                      boxShadow: activeNotes.has(blackKey.midi) ? '0 0 20px rgba(99, 102, 241, 0.6)' : 'none',
                    }}
                    className="absolute right-0 top-0 w-1/2 rounded-b-lg border border-slate-900 cursor-pointer transition-colors z-20 transform -translate-x-1/2"
                  >
                    <AnimatePresence>
                      {activeNotes.has(blackKey.midi) && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-b-lg"
                        />
                      )}
                    </AnimatePresence>
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
