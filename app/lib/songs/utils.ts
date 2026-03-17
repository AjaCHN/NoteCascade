// app/lib/songs/utils.ts v1.4.2
import type { Note } from '../songs';

export function parseMelody(melody: string, bpm: number = 120): { notes: Note[], duration: number } {
  const notes: Note[] = [];
  let currentTime = 0;
  const beatDuration = 60 / bpm;

  const tokens = melody.split(/\s+/);
  for (const token of tokens) {
    if (!token) continue;
    const [noteStr, durationStr] = token.split(':');
    const durationBeats = durationStr ? parseFloat(durationStr) : 1;
    const durationSecs = durationBeats * beatDuration;

    if (noteStr !== 'R') {
      const noteName = noteStr.match(/[A-G]#?/)?.[0];
      const octave = parseInt(noteStr.match(/\d/)?.[0] || '4');
      if (noteName) {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const midi = noteNames.indexOf(noteName) + (octave + 1) * 12;
        notes.push({
          midi,
          time: currentTime,
          duration: durationSecs * 0.9, // slightly detached
          velocity: 0.8
        });
      }
    }
    currentTime += durationSecs;
  }
  return { notes, duration: currentTime + 1 }; // add 1s padding at the end
}
