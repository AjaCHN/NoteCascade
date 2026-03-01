// app/lib/songs.ts v1.3.5
import { Midi } from '@tonejs/midi';
import { generatedSongs } from './song-data';

export interface Note {
  midi: number;
  time: number;
  duration: number;
  velocity: number;
}

export interface UnlockCondition {
  type: 'achievement' | 'score' | 'level';
  value: string | number;
  description: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  difficulty: number;
  midiUrl: string;
  style?: string;
  duration?: number;
  notes?: Note[];
  unlockCondition?: UnlockCondition;
}

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
