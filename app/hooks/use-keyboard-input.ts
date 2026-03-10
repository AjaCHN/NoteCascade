// app/hooks/use-keyboard-input.ts v1.3.5
import { useEffect } from 'react';
import { startNote, stopNote, initAudio, setSustainPedal } from '../lib/audio';

export function useKeyboardInput(
  setActiveNotes: React.Dispatch<React.SetStateAction<Map<number, number>>>
) {
  useEffect(() => {
    const KEYBOARD_MAP: Record<string, number> = {
      'z': 48, 's': 49, 'x': 50, 'd': 51, 'c': 52, 'v': 53, 'g': 54, 'b': 55, 'h': 56, 'n': 57, 'j': 58, 'm': 59, // C3 - B3
      'q': 60, '2': 61, 'w': 62, '3': 63, 'e': 64, 'r': 65, '5': 66, 't': 67, '6': 68, 'y': 69, '7': 70, 'u': 71, // C4 - B4
      'i': 72, '9': 73, 'o': 74, '0': 75, 'p': 76 // C5 - E5
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      
      if (e.code === 'Space') {
        e.preventDefault();
        setSustainPedal(true);
        return;
      }

      const key = e.key.toLowerCase();
      const midi = KEYBOARD_MAP[key];
      if (midi) {
        startNote(midi, 0.8);
        setActiveNotes(prev => new Map(prev).set(midi, 0.8));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSustainPedal(false);
        return;
      }

      const key = e.key.toLowerCase();
      const midi = KEYBOARD_MAP[key];
      if (midi) {
        stopNote(midi);
        setActiveNotes(prev => {
          const next = new Map(prev);
          next.delete(midi);
          return next;
        });
      }
    };

    const handleFirstInteraction = () => {
      initAudio();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setActiveNotes]);
}
