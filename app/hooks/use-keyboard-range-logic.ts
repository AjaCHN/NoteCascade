// app/hooks/use-keyboard-range-logic.ts v1.0.0
'use client';

import { useEffect } from 'react';
import { Song } from '../lib/songs/types';

interface KeyboardRange {
  start: number;
  end: number;
}

export function useKeyboardRangeLogic(
  mounted: boolean,
  isRangeManuallySet: boolean,
  inputsLength: number,
  selectedSong: Song | null,
  keyboardRange: KeyboardRange,
  setKeyboardRange: (start: number, end: number) => void
) {
  useEffect(() => {
    if (!mounted || isRangeManuallySet) return;

    const hasMidi = inputsLength > 0;
    
    if (hasMidi) {
      if (keyboardRange.start !== 21 || keyboardRange.end !== 108) {
         setKeyboardRange(21, 108);
      }
      return;
    }

    if (selectedSong && selectedSong.notes && selectedSong.notes.length > 0) {
      const midis = selectedSong.notes.map(n => n.midi);
      const minMidi = Math.min(...midis);
      const maxMidi = Math.max(...midis);
      
      let start = Math.max(21, minMidi - 2);
      let end = Math.min(108, maxMidi + 2);
      
      while ([1, 3, 6, 8, 10].includes(start % 12) && start > 21) {
        start--;
      }
      while ([1, 3, 6, 8, 10].includes(end % 12) && end < 108) {
        end++;
      }
      
      const finalStart = start;
      let finalEnd = Math.max(start + 24, end);

      while ([1, 3, 6, 8, 10].includes(finalEnd % 12) && finalEnd < 108) {
        finalEnd++;
      }
      
      if (finalStart !== keyboardRange.start || finalEnd !== keyboardRange.end) {
        setKeyboardRange(finalStart, finalEnd);
      }
    } else {
      if (keyboardRange.start !== 48 || keyboardRange.end !== 72) {
        setKeyboardRange(48, 72);
      }
    }
  }, [inputsLength, selectedSong, setKeyboardRange, mounted, keyboardRange.start, keyboardRange.end, isRangeManuallySet]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768 && !isRangeManuallySet) {
      setTimeout(() => {
        setKeyboardRange(48, 72);
      }, 0);
    }
  }, [setKeyboardRange, isRangeManuallySet]);
}
