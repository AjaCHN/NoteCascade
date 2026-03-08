// app/components/KeyboardContainer.tsx v2.5.0
'use client';

import React from 'react';
import { Keyboard } from './Keyboard';

interface KeyboardContainerProps {
  activeNotes: Map<number, number>;
  keyboardRange: { start: number; end: number };
  showNoteNames: boolean;
  showKeymap: boolean;
  keyboardType: '88' | '61' | '49' | '32' | 'virtual';
  setActiveNotes: React.Dispatch<React.SetStateAction<Map<number, number>>>;
}

export function KeyboardContainer({
  activeNotes, keyboardRange, showNoteNames, showKeymap, keyboardType, setActiveNotes
}: KeyboardContainerProps) {
  return (
    <div 
      id="keyboard-wrapper" 
      className={`shrink-0 relative z-20 h-24 md:h-32 border-t theme-border ${
        keyboardType !== 'virtual' ? 'pointer-events-none opacity-80' : ''
      }`}
    >
      <Keyboard 
        activeNotes={activeNotes} 
        startNote={keyboardRange.start} 
        endNote={keyboardRange.end} 
        showNoteNames={showNoteNames}
        showKeymap={showKeymap && keyboardType === 'virtual'}
        keyMap={keyboardType === 'virtual' ? {
          'z': 48, 's': 49, 'x': 50, 'd': 51, 'c': 52, 'v': 53, 'g': 54, 'b': 55, 'h': 56, 'n': 57, 'j': 58, 'm': 59,
          'q': 60, '2': 61, 'w': 62, '3': 63, 'e': 64, 'r': 65, '5': 66, 't': 67, '6': 68, 'y': 69, '7': 70, 'u': 71,
          'i': 72, '9': 73, 'o': 74, '0': 75, 'p': 76
        } : {}}
        onNoteOn={(midi) => {
          if (keyboardType === 'virtual') {
            setActiveNotes(prev => new Map(prev).set(midi, 0.7));
          }
        }}
        onNoteOff={(midi) => {
          if (keyboardType === 'virtual') {
            setActiveNotes(prev => { const next = new Map(prev); next.delete(midi); return next; });
          }
        }}
      />
    </div>
  );
}
