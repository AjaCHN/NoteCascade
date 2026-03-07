// app/hooks/use-keyboard-input.ts v2.3.2
'use client';
import { useEffect } from 'react';

export function useKeyboardInput(setActiveNotes: any, isVirtual: boolean) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isVirtual) {
        setActiveNotes((prev: Set<number>) => new Set(prev).add(e.keyCode));
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (isVirtual) {
        setActiveNotes((prev: Set<number>) => {
          const next = new Set(prev);
          next.delete(e.keyCode);
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
