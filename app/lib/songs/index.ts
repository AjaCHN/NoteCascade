// app/lib/songs/index.ts v1.4.2
import type { Song } from '../songs';
import { parseMelody } from './utils';
import { classicSongs } from './classic';
import { holidaySongs } from './holiday';
import { chineseSongs } from './chinese';
import { popRockSongs } from './pop-rock';

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
