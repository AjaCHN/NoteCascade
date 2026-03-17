// app/lib/songs/index.ts v2.3.1
import type { Song } from '../songs';
import { parseMelody } from './utils';
import { classicSongs } from './classic';
import { holidaySongs } from './holiday';
import { chineseSongs } from './chinese';
import { popRockSongs } from './pop-rock';
import { childrenSongs } from './children';

const allSongData = [
  ...classicSongs,
  ...holidaySongs,
  ...chineseSongs,
  ...popRockSongs,
  ...childrenSongs
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
