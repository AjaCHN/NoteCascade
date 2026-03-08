// app/hooks/use-keyboard-input.ts v2.4.2
'use client';
import { useEffect } from 'react';

export function useKeyboardInput(
  setActiveNotes: (notes: Map<number, number> | ((prev: Map<number, number>) => Map<number, number>)) => void, 
  isVirtual: boolean
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isVirtual && !e.repeat) {
        // Simple mapping for demo purposes, actual mapping should be more robust
        const midi = e.keyCode; 
        setActiveNotes((prev: Map<number, number>) => new Map(prev).set(midi, 0.7));
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (isVirtual) {
        const midi = e.keyCode;
        setActiveNotes((prev: Map<number, number>) => {
          const next = new Map(prev);
          next.delete(midi);
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setActiveNotes, isVirtual]);
}
