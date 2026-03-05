// app/lib/songs.ts v1.7.2
import { Midi } from '@tonejs/midi';
import { generatedSongs } from './songs/index';
import type { Note, UnlockCondition, Song } from './songs/types';

export type { Note, UnlockCondition, Song };

export const builtInSongs: Song[] = generatedSongs;

export async function parseMidiFile(file: File): Promise<Song> {
  const arrayBuffer = await file.arrayBuffer();
  const midi = new Midi(arrayBuffer);
  
  const notes: Note[] = [];
  midi.tracks.forEach(track => {
    track.notes.forEach(note => {
      notes.push({
        midi: note.midi,
        time: note.time,
        duration: note.duration,
        velocity: note.velocity,
      });
    });
  });

  // Sort notes by time
  notes.sort((a, b) => a.time - b.time);

  return {
    id: file.name.replace(/\.[^/.]+$/, ""),
    title: midi.name || file.name,
    artist: 'Unknown',
    difficulty: 3,
    midiUrl: '',
    style: 'Custom',
    duration: midi.duration,
    notes: notes,
  };
}
