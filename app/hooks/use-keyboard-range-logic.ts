// app/hooks/use-keyboard-range-logic.ts v2.3.1
import { useEffect } from 'react';
import { Song } from '../lib/songs';
import { useAppActions, useKeyboardRange } from '../lib/store';
import { MidiDevice } from './use-midi';

export function useKeyboardRangeLogic(
  mounted: boolean,
  isRangeManuallySet: boolean,
  inputs: MidiDevice[],
  selectedSong: Song,
  windowWidth: number
) {
  const { setKeyboardRange } = useAppActions();
  const keyboardRange = useKeyboardRange();

  useEffect(() => {
    if (!mounted || isRangeManuallySet) return;

    const hasMidi = inputs.length > 0;
    
    if (hasMidi) {
      if (keyboardRange.start !== 21 || keyboardRange.end !== 108) {
         setKeyboardRange(21, 108);
      }
      return;
    }

    if (windowWidth < 768) {
      if (keyboardRange.start !== 48 || keyboardRange.end !== 72) {
        setKeyboardRange(48, 72);
      }
      return;
    }

    // No MIDI connected: Adjust range to fit the song
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
  }, [inputs.length, selectedSong, mounted, isRangeManuallySet, windowWidth, keyboardRange.start, keyboardRange.end, setKeyboardRange]);
}
