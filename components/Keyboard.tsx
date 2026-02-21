import React, { useMemo } from 'react';

interface KeyboardProps {
  activeNotes: Set<number>;
  startNote?: number;
  endNote?: number;
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

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
    <div className="relative flex h-32 w-full justify-center overflow-hidden rounded-b-xl border-t-4 border-gray-800 bg-gray-900 select-none">
      {keys.map((key) => {
        const isActive = activeNotes.has(key.midi);
        if (key.isBlack) {
          return (
            <div
              key={key.midi}
              className={`z-10 -ml-3 -mr-3 h-20 w-6 rounded-b-md border border-black ${
                isActive ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]' : 'bg-black'
              }`}
            />
          );
        } else {
          return (
            <div
              key={key.midi}
              className={`z-0 flex h-full w-10 flex-col justify-end rounded-b-md border border-gray-300 pb-2 text-center text-xs font-medium ${
                isActive ? 'bg-indigo-200 shadow-[inset_0_0_10px_rgba(99,102,241,0.5)]' : 'bg-white'
              }`}
            >
              <span className="text-gray-400">{key.noteName}</span>
            </div>
          );
        }
      })}
    </div>
  );
}
