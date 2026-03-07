// app/lib/songs.ts v2.4.2
import { Song } from './songs/types';
import { Midi } from '@tonejs/midi';

export type { Song };

export const songs: Song[] = [
  { 
    id: '1', 
    title: 'C Major Scale', 
    artist: 'Traditional', 
    difficulty: 1,
    midiUrl: '/midi/c-major-scale.mid'
  },
  { 
    id: '2', 
    title: 'Twinkle Twinkle', 
    artist: 'Traditional', 
    difficulty: 1,
    midiUrl: '/midi/twinkle-twinkle.mid'
  },
];

export const builtInSongs = songs;

export async function parseMidiFile(file: File): Promise<Song> {
  const arrayBuffer = await file.arrayBuffer();
  const midi = new Midi(arrayBuffer);
  
  // Extract notes from the first track that has notes
  const track = midi.tracks.find(t => t.notes.length > 0);
  if (!track) throw new Error('No notes found in MIDI file');

  const notes = track.notes.map(n => ({
    midi: n.midi,
    time: n.time,
    duration: n.duration,
    velocity: n.velocity
  }));

  return {
    id: `custom-${Date.now()}`,
    title: file.name.replace(/\.mid$/i, ''),
    artist: 'Unknown',
    difficulty: 1, // Default difficulty
    midiUrl: URL.createObjectURL(file),
    notes,
    duration: midi.duration
  };
}
