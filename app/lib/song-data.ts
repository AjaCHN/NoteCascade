import type { Note, Song } from './songs';

function parseMelody(melody: string, bpm: number = 120): { notes: Note[], duration: number } {
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

const songData = [
  {
    id: 'twinkle',
    title: 'Twinkle Twinkle Little Star',
    artist: 'Traditional',
    difficulty: 1,
    style: 'Classic',
    bpm: 100,
    melody: 'C4:1 C4:1 G4:1 G4:1 A4:1 A4:1 G4:2 F4:1 F4:1 E4:1 E4:1 D4:1 D4:1 C4:2 G4:1 G4:1 F4:1 F4:1 E4:1 E4:1 D4:2 G4:1 G4:1 F4:1 F4:1 E4:1 E4:1 D4:2 C4:1 C4:1 G4:1 G4:1 A4:1 A4:1 G4:2 F4:1 F4:1 E4:1 E4:1 D4:1 D4:1 C4:2'
  },
  {
    id: 'mary_lamb',
    title: 'Mary Had a Little Lamb',
    artist: 'Traditional',
    difficulty: 1,
    style: 'Classic',
    bpm: 120,
    melody: 'E4:1 D4:1 C4:1 D4:1 E4:1 E4:1 E4:2 D4:1 D4:1 D4:2 E4:1 G4:1 G4:2 E4:1 D4:1 C4:1 D4:1 E4:1 E4:1 E4:1 E4:1 D4:1 D4:1 E4:1 D4:1 C4:4'
  },
  {
    id: 'ode_to_joy',
    title: 'Ode to Joy',
    artist: 'Beethoven',
    difficulty: 2,
    style: 'Classic',
    bpm: 120,
    melody: 'E4:1 E4:1 F4:1 G4:1 G4:1 F4:1 E4:1 D4:1 C4:1 C4:1 D4:1 E4:1 E4:1.5 D4:0.5 D4:2 E4:1 E4:1 F4:1 G4:1 G4:1 F4:1 E4:1 D4:1 C4:1 C4:1 D4:1 E4:1 D4:1.5 C4:0.5 C4:2'
  },
  {
    id: 'jingle_bells',
    title: 'Jingle Bells',
    artist: 'Traditional',
    difficulty: 2,
    style: 'Holiday',
    bpm: 140,
    melody: 'E4:1 E4:1 E4:2 E4:1 E4:1 E4:2 E4:1 G4:1 C4:1.5 D4:0.5 E4:4 F4:1 F4:1 F4:1.5 F4:0.5 F4:1 E4:1 E4:1 E4:0.5 E4:0.5 E4:1 D4:1 D4:1 E4:1 D4:2 G4:2 E4:1 E4:1 E4:2 E4:1 E4:1 E4:2 E4:1 G4:1 C4:1.5 D4:0.5 E4:4 F4:1 F4:1 F4:1.5 F4:0.5 F4:1 E4:1 E4:1 E4:0.5 E4:0.5 G4:1 G4:1 F4:1 D4:1 C4:4'
  },
  {
    id: 'happy_birthday',
    title: 'Happy Birthday',
    artist: 'Traditional',
    difficulty: 1,
    style: 'Classic',
    bpm: 100,
    melody: 'G4:0.5 G4:0.5 A4:1 G4:1 C5:1 B4:2 G4:0.5 G4:0.5 A4:1 G4:1 D5:1 C5:2 G4:0.5 G4:0.5 G5:1 E5:1 C5:1 B4:1 A4:1 F5:0.5 F5:0.5 E5:1 C5:1 D5:1 C5:2'
  },
  {
    id: 'row_boat',
    title: 'Row Your Boat',
    artist: 'Traditional',
    difficulty: 1,
    style: 'Classic',
    bpm: 100,
    melody: 'C4:1 C4:1 C4:0.75 D4:0.25 E4:1 E4:0.75 D4:0.25 E4:0.75 F4:0.25 G4:2 C5:0.33 C5:0.33 C5:0.33 G4:0.33 G4:0.33 G4:0.33 E4:0.33 E4:0.33 E4:0.33 C4:0.33 C4:0.33 C4:0.33 G4:0.75 F4:0.25 E4:0.75 D4:0.25 C4:2'
  },
  {
    id: 'london_bridge',
    title: 'London Bridge',
    artist: 'Traditional',
    difficulty: 1,
    style: 'Classic',
    bpm: 110,
    melody: 'G4:1.5 A4:0.5 G4:1 F4:1 E4:1 F4:1 G4:2 D4:1 E4:1 F4:2 E4:1 F4:1 G4:2 G4:1.5 A4:0.5 G4:1 F4:1 E4:1 F4:1 G4:2 D4:2 G4:2 E4:1 C4:3'
  },
  {
    id: 'brother_john',
    title: 'Brother John',
    artist: 'Traditional',
    difficulty: 1,
    style: 'Classic',
    bpm: 120,
    melody: 'C4:1 D4:1 E4:1 C4:1 C4:1 D4:1 E4:1 C4:1 E4:1 F4:1 G4:2 E4:1 F4:1 G4:2 G4:0.5 A4:0.5 G4:0.5 F4:0.5 E4:1 C4:1 G4:0.5 A4:0.5 G4:0.5 F4:0.5 E4:1 C4:1 C4:1 G3:1 C4:2 C4:1 G3:1 C4:2'
  },
  {
    id: 'old_macdonald',
    title: 'Old MacDonald',
    artist: 'Traditional',
    difficulty: 2,
    style: 'Classic',
    bpm: 120,
    melody: 'G4:1 G4:1 G4:1 D4:1 E4:1 E4:1 D4:2 B4:1 B4:1 A4:1 A4:1 G4:2 D4:1 G4:1 G4:1 G4:1 D4:1 E4:1 E4:1 D4:2 B4:1 B4:1 A4:1 A4:1 G4:2'
  },
  {
    id: 'amazing_grace',
    title: 'Amazing Grace',
    artist: 'Traditional',
    difficulty: 2,
    style: 'Classic',
    bpm: 90,
    melody: 'D4:1 G4:2 B4:0.5 G4:0.5 B4:2 A4:1 G4:2 E4:1 D4:2 D4:1 G4:2 B4:0.5 G4:0.5 B4:2 A4:1 D5:3'
  },
  {
    id: 'oh_susanna',
    title: 'Oh Susanna',
    artist: 'Foster',
    difficulty: 2,
    style: 'Classic',
    bpm: 110,
    melody: 'C4:0.5 D4:0.5 E4:1 G4:1 G4:1.5 A4:0.5 G4:1 E4:1 C4:1.5 D4:0.5 E4:1 E4:1 D4:1 C4:1 D4:2 C4:0.5 D4:0.5 E4:1 G4:1 G4:1.5 A4:0.5 G4:1 E4:1 C4:1.5 D4:0.5 E4:1 E4:1 D4:1 D4:1 C4:3'
  },
  {
    id: 'brahms_lullaby',
    title: 'Lullaby',
    artist: 'Brahms',
    difficulty: 2,
    style: 'Classic',
    bpm: 80,
    melody: 'E4:0.5 E4:0.5 G4:2 E4:0.5 E4:0.5 G4:2 E4:0.5 G4:0.5 C5:1 B4:1 A4:1 A4:1 G4:2 D4:0.5 E4:0.5 F4:1 D4:1 D4:0.5 E4:0.5 F4:2 D4:0.5 F4:0.5 B4:1 A4:1 G4:1 B4:1 C5:2'
  },
  {
    id: 'spring_vivaldi',
    title: 'Spring',
    artist: 'Vivaldi',
    difficulty: 3,
    style: 'Classic',
    bpm: 100,
    melody: 'C4:1 E4:1 G4:1 G4:1 G4:0.5 F4:0.5 E4:1 C4:1 G4:0.5 F4:0.5 E4:1 C4:1 G4:0.5 F4:0.5 E4:0.5 F4:0.5 G4:2'
  },
  {
    id: 'canon_in_d',
    title: 'Canon in D',
    artist: 'Pachelbel',
    difficulty: 3,
    style: 'Classic',
    bpm: 80,
    melody: 'F#4:2 E4:2 D4:2 C#4:2 B3:2 A3:2 B3:2 C#4:2 D4:2 C#4:2 B3:2 A3:2 G3:2 F#3:2 G3:2 E3:2'
  },
  {
    id: 'fur_elise',
    title: 'Fur Elise',
    artist: 'Beethoven',
    difficulty: 4,
    style: 'Classic',
    bpm: 120,
    melody: 'E5:0.5 D#5:0.5 E5:0.5 D#5:0.5 E5:0.5 B4:0.5 D5:0.5 C5:0.5 A4:1.5 R:0.5 C4:0.5 E4:0.5 A4:0.5 B4:1.5 R:0.5 E4:0.5 G#4:0.5 B4:0.5 C5:1.5 R:0.5 E4:0.5 E5:0.5 D#5:0.5 E5:0.5 D#5:0.5 E5:0.5 B4:0.5 D5:0.5 C5:0.5 A4:1.5 R:0.5 C4:0.5 E4:0.5 A4:0.5 B4:1.5 R:0.5 E4:0.5 C5:0.5 B4:0.5 A4:2'
  },
  {
    id: 'yankee_doodle',
    title: 'Yankee Doodle',
    artist: 'Traditional',
    difficulty: 2,
    style: 'Classic',
    bpm: 120,
    melody: 'C4:1 C4:1 D4:1 E4:1 C4:1 E4:1 D4:2 C4:1 C4:1 D4:1 E4:1 C4:1 B3:1 G3:2 C4:1 C4:1 D4:1 E4:1 F4:1 E4:1 D4:1 C4:1 B3:1 G3:1 A3:1 B3:1 C4:2 C4:2'
  },
  {
    id: 'minuet_g',
    title: 'Minuet in G',
    artist: 'Bach',
    difficulty: 3,
    style: 'Classic',
    bpm: 100,
    melody: 'D5:1 G4:0.5 A4:0.5 B4:0.5 C5:0.5 D5:1 G4:1 G4:1 E5:1 C5:0.5 D5:0.5 E5:0.5 F#5:0.5 G5:1 G4:1 G4:1 C5:1 D5:0.5 C5:0.5 B4:0.5 A4:0.5 B4:1 C5:0.5 B4:0.5 A4:0.5 G4:0.5 F#4:1 G4:0.5 A4:0.5 B4:0.5 G4:0.5 A4:2'
  },
  {
    id: 'turkish_march',
    title: 'Turkish March',
    artist: 'Mozart',
    difficulty: 4,
    style: 'Classic',
    bpm: 120,
    melody: 'B4:0.5 A4:0.5 G#4:0.5 A4:0.5 C5:1 C5:0.5 C5:0.5 D5:0.5 C5:0.5 B4:0.5 C5:0.5 E5:1 E5:0.5 E5:0.5 F5:0.5 E5:0.5 D#5:0.5 E5:0.5 B5:0.5 A5:0.5 G#5:0.5 A5:0.5 B5:0.5 A5:0.5 G#5:0.5 A5:0.5 C6:2'
  },
  {
    id: 'auld_lang_syne',
    title: 'Auld Lang Syne',
    artist: 'Traditional',
    difficulty: 2,
    style: 'Classic',
    bpm: 100,
    melody: 'C4:1 F4:1.5 F4:0.5 F4:1 A4:1 G4:1.5 F4:0.5 G4:1 A4:1 F4:1.5 F4:0.5 A4:1 C5:1 D5:3 D5:1 C5:1.5 A4:0.5 A4:1 F4:1 G4:1.5 F4:0.5 G4:1 A4:1 F4:1.5 D4:0.5 D4:1 C4:1 F4:3'
  },
  {
    id: 'silent_night',
    title: 'Silent Night',
    artist: 'Gruber',
    difficulty: 2,
    style: 'Holiday',
    bpm: 90,
    melody: 'G4:1.5 A4:0.5 G4:1 E4:3 G4:1.5 A4:0.5 G4:1 E4:3 D5:2 D5:1 B4:3 C5:2 C5:1 G4:3 A4:2 A4:1 C5:1.5 B4:0.5 A4:1 G4:1.5 A4:0.5 G4:1 E4:3'
  },
  {
    id: 'swan_lake',
    title: 'Swan Lake Theme',
    artist: 'Tchaikovsky',
    difficulty: 2,
    style: 'Classic',
    bpm: 100,
    melody: 'A4:1 B4:1 C5:1 D5:1 E5:2 A4:1 E5:1 F5:1 E5:1 D5:1 C5:1 B4:2 E4:2 A4:1 B4:1 C5:1 D5:1 E5:2 A4:1 E5:1 F5:1 E5:1 D5:1 C5:1 A4:4'
  },
  {
    id: 'blue_danube',
    title: 'The Blue Danube',
    artist: 'Strauss',
    difficulty: 2,
    style: 'Classic',
    bpm: 120,
    melody: 'C4:1 C4:1 E4:1 G4:1 G4:2 G4:2 E5:1 E5:1 C5:1 C5:1 G4:2 G4:2 C4:1 C4:1 E4:1 G4:1 G4:2 G4:2 F5:1 F5:1 D5:1 D5:1 B4:2 B4:2'
  },
  {
    id: 'greensleeves',
    title: 'Greensleeves',
    artist: 'Traditional',
    difficulty: 3,
    style: 'Classic',
    bpm: 90,
    melody: 'A4:1 C5:1 D5:1 E5:1.5 F5:0.5 E5:1 D5:2 B4:1 G4:1 A4:0.5 B4:1 C5:2 A4:1 A4:1 G#4:0.5 A4:1 B4:1 G#4:1 E4:2'
  },
  {
    id: 'scarborough_fair',
    title: 'Scarborough Fair',
    artist: 'Traditional',
    difficulty: 2,
    style: 'Classic',
    bpm: 90,
    melody: 'A4:2 A4:1 E5:2 E5:1 D5:1 C5:1 B4:1 A4:2 A4:1 E5:1 G5:1 A5:1 G5:1 F5:1 E5:1 D5:2 D5:1 E5:2 E5:1'
  },
  {
    id: 'korobeiniki',
    title: 'Korobeiniki',
    artist: 'Traditional',
    difficulty: 3,
    style: 'Classic',
    bpm: 140,
    melody: 'E5:1 B4:0.5 C5:0.5 D5:1 C5:0.5 B4:0.5 A4:1 A4:0.5 C5:0.5 E5:1 D5:0.5 C5:0.5 B4:1 B4:0.5 C5:0.5 D5:1 E5:1 C5:1 A4:1 A4:2'
  },
  {
    id: 'bella_ciao',
    title: 'Bella Ciao',
    artist: 'Traditional',
    difficulty: 3,
    style: 'Classic',
    bpm: 130,
    melody: 'E4:0.5 A4:0.5 B4:0.5 C5:0.5 A4:2 E4:0.5 A4:0.5 B4:0.5 C5:0.5 A4:2 E4:0.5 A4:0.5 B4:0.5 C5:0.5 B4:0.5 A4:0.5 C5:1.5 A4:0.5 E5:1 E5:1 E5:2'
  },
  {
    id: 'morning_mood',
    title: 'Morning Mood',
    artist: 'Grieg',
    difficulty: 2,
    style: 'Classic',
    bpm: 100,
    melody: 'G4:1 E4:1 D4:1 C4:1 D4:1 E4:1 G4:1 E4:1 D4:1 C4:1 D4:1 E4:1 G4:1 E4:1 G4:1 A4:1 E4:1 A4:1 G4:1 E4:1 D4:1 C4:2'
  },
  {
    id: 'mountain_king',
    title: 'In the Hall of the Mountain King',
    artist: 'Grieg',
    difficulty: 3,
    style: 'Classic',
    bpm: 110,
    melody: 'B3:0.5 C#4:0.5 D4:0.5 E4:0.5 F#4:0.5 D4:0.5 F#4:0.5 A4:1 F#4:0.5 F#4:1 F#4:0.5 F#4:1 F#4:0.5 A4:1 F#4:0.5'
  },
  {
    id: 'entertainer',
    title: 'The Entertainer',
    artist: 'Joplin',
    difficulty: 3,
    style: 'Ragtime',
    bpm: 140,
    melody: 'D5:0.5 E5:0.5 C5:0.5 A4:1 B4:0.5 G4:0.5 D4:0.5 E4:0.5 C4:2 D5:0.5 E5:0.5 C5:0.5 A4:1 B4:0.5 G4:0.5 D4:0.5 E4:0.5 C4:2'
  },
  {
    id: 'william_tell',
    title: 'William Tell Overture',
    artist: 'Rossini',
    difficulty: 3,
    style: 'Classic',
    bpm: 150,
    melody: 'E4:0.5 E4:0.5 E4:0.5 G4:1 E4:0.5 E4:0.5 E4:0.5 G4:1 E4:0.5 E4:0.5 E4:0.5 C5:1 B4:0.5 A4:0.5 G4:1'
  }
];

export const generatedSongs: Song[] = songData.map(data => {
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
