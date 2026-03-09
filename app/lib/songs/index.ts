// app/lib/songs/index.ts v2.5.0
import { Song } from './types';
import { parseMelody } from './utils';
import { classicSongs } from './classic';
import { holidaySongs } from './holiday';
import { chineseSongs } from './chinese';
import { popRockSongs } from './pop-rock';
import { jazzSongs } from './jazz';
import { advancedSongs } from './advanced';
import { popModernSongs } from './pop-modern';

const allSongData = [
  ...classicSongs,
  ...holidaySongs,
  ...chineseSongs,
  ...popRockSongs,
  ...jazzSongs,
  ...advancedSongs,
  ...popModernSongs
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

export type { Song };
