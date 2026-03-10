// app/components/Keyboard.tsx v2.0.0
'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { startNote as startAudioNote, stopNote as stopAudioNote } from '../lib/audio';
import { Key } from './keyboard/Key';

interface KeyboardProps {
  activeNotes: Map<number, number>;
  startNote: number;
  endNote: number;
  showNoteNames: boolean;
  showKeymap?: boolean;
  keyMap?: Record<string, number>;
  onNoteOn?: (midi: number) => void;
  onNoteOff?: (midi: number) => void;
  isMidiConnected: boolean;
}

const isBlackKey = (midi: number) => [1, 3, 6, 8, 10].includes(midi % 12);
const getNoteName = (midi: number) => {
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return `${names[midi % 12]}${Math.floor(midi / 12) - 1}`;
};

export function Keyboard({
  activeNotes, startNote, endNote, showNoteNames, showKeymap, keyMap,
  onNoteOn, onNoteOff, isMidiConnected,
}: KeyboardProps) {
  const [localActiveNotes, setLocalActiveNotes] = useState<Set<number>>(new Set());
  const activePointers = useRef<Map<number, number>>(new Map());

  const handleKeyPress = useCallback((midi: number) => {
    if (!isMidiConnected) startAudioNote(midi);
    setLocalActiveNotes(prev => new Set(prev).add(midi));
    onNoteOn?.(midi);
  }, [onNoteOn, isMidiConnected]);

  const handleKeyRelease = useCallback((midi: number) => {
    setTimeout(() => {
      if (!isMidiConnected) stopAudioNote(midi);
      setLocalActiveNotes(prev => { const n = new Set(prev); n.delete(midi); return n; });
      onNoteOff?.(midi);
    }, 100);
  }, [onNoteOff, isMidiConnected]);

  const handlePointer = (e: React.PointerEvent, type: 'down' | 'move' | 'up') => {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const midi = el?.getAttribute('data-midi') ? parseInt(el.getAttribute('data-midi')!, 10) : undefined;
    const currentMidi = activePointers.current.get(e.pointerId);

    if (type === 'down' && midi !== undefined) {
      activePointers.current.set(e.pointerId, midi);
      handleKeyPress(midi);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } else if (type === 'move' && activePointers.current.has(e.pointerId)) {
      if (midi !== undefined && currentMidi !== midi) {
        if (currentMidi !== undefined) handleKeyRelease(currentMidi);
        handleKeyPress(midi);
        activePointers.current.set(e.pointerId, midi);
      } else if (midi === undefined && currentMidi !== undefined) {
        handleKeyRelease(currentMidi);
        activePointers.current.delete(e.pointerId);
      }
    } else if (type === 'up' && currentMidi !== undefined) {
      handleKeyRelease(currentMidi);
      activePointers.current.delete(e.pointerId);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  useEffect(() => {
    const pointers = activePointers.current;
    return () => { pointers.forEach(m => handleKeyRelease(m)); pointers.clear(); };
  }, [handleKeyRelease]);

  const keys = Array.from({ length: endNote - startNote + 1 }, (_, i) => startNote + i);
  const whiteKeyCount = keys.filter(m => !isBlackKey(m)).length;
  const whiteKeyWidth = 100 / whiteKeyCount;
  let whiteKeyIndex = 0;

  return (
    <div 
      className="relative flex h-full w-full bg-black select-none touch-none"
      onPointerDown={e => handlePointer(e, 'down')}
      onPointerMove={e => handlePointer(e, 'move')}
      onPointerUp={e => handlePointer(e, 'up')}
      onPointerCancel={e => handlePointer(e, 'up')}
    >
      {keys.map(midi => {
        const isBlack = isBlackKey(midi);
        const isActive = activeNotes.has(midi) || localActiveNotes.has(midi);
        const velocity = activeNotes.get(midi) || (localActiveNotes.has(midi) ? 0.7 : 0);
        const left = isBlack ? (whiteKeyIndex - 1) * whiteKeyWidth + (whiteKeyWidth * 0.65) : whiteKeyIndex++ * whiteKeyWidth;
        const mappedKey = showKeymap && keyMap ? Object.entries(keyMap).find(([, m]) => m === midi)?.[0].toUpperCase() || '' : '';

        return (
          <Key
            key={midi} midi={midi} isBlack={isBlack} isActive={isActive} velocity={velocity}
            left={left} width={isBlack ? whiteKeyWidth * 0.7 : whiteKeyWidth}
            showNoteNames={showNoteNames} noteName={getNoteName(midi)} mappedKey={mappedKey}
          />
        );
      })}
    </div>
  );
}
