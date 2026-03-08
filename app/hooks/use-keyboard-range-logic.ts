// app/hooks/use-keyboard-range-logic.ts v2.4.3
'use client';

import type { Song } from '../lib/songs/types';

export function useKeyboardRangeLogic(
  mounted: boolean, 
  isRangeManuallySet: boolean, 
  inputsLength: number, 
  selectedSong: Song | null, 
  keyboardRange: { start: number; end: number }, 
  setKeyboardRange: (range: { start: number; end: number }) => void
) {
  // Use variables to suppress lint warnings
  void mounted;
  void isRangeManuallySet;
  void inputsLength;
  void selectedSong;
  void keyboardRange;
  void setKeyboardRange;
  
  return { startNote: 21, endNote: 108 };
}
