// app/hooks/use-practice-logic.ts v1.0.0
'use client';

import * as Tone from 'tone';
import { Song } from '../lib/songs';

export function usePracticeLogic(
  playMode: string,
  selectedSong: Song,
  activeNotes: Map<number, number>
) {
  const handlePracticePause = (time: number): number => {
    if (playMode !== 'practice') return time;

    const notesToHit = selectedSong.notes?.filter(n => 
      n.time >= time - 0.05 && 
      n.time <= time + 0.05
    ) || [];
    
    const allHit = notesToHit.every(n => activeNotes.has(n.midi));
    
    if (notesToHit.length > 0 && !allHit) {
      if (Tone.Transport.state === 'started') {
        Tone.Transport.pause();
      }
      const firstUnhit = notesToHit.find(n => !activeNotes.has(n.midi));
      if (firstUnhit) {
        const newTime = firstUnhit.time;
        if (Math.abs(Tone.Transport.seconds - newTime) > 0.001) {
          Tone.Transport.seconds = newTime;
        }
        return newTime;
      }
    } else {
      if (Tone.Transport.state === 'paused') {
        Tone.Transport.start();
      }
    }
    return time;
  };

  return { handlePracticePause };
}
