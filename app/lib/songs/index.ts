// app/lib/songs/index.ts v2.4.3
import { Song } from './types';
import { parseMelody } from './utils';
import { classicSongs } from './classic';
import { holidaySongs } from './holiday';
import { chineseSongs } from './chinese';
import { popRockSongs } from './pop-rock';
import { Midi } from '@tonejs/midi';

const allSongData = [
  ...classicSongs,
  ...holidaySongs,
  ...chineseSongs,
  ...popRockSongs
];

export const generatedSongs: Song[] = allSongData.map(data => {
  const { notes, duration } = parseMelody(data.melody, data.bpm);
  return {
    id: data.id,
    title: data.title,
    artist: data.artist,
    difficulty: data.difficulty,
    style: data.style,
    midiUrl: '',
    duration,
    notes
  };
});

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

export const builtInSongs = [...songs, ...generatedSongs];

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

export type { Song };
