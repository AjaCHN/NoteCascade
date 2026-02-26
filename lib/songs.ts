import { Midi } from '@tonejs/midi';
import { Frequency } from 'tone';

export interface NoteEvent {
  midi: number;
  time: number;
  duration: number;
  velocity: number;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  style: string;
  difficulty: number;
  notes: NoteEvent[];
  duration: number;
  unlockCondition?: {
    type: 'achievement' | 'score';
    value: string | number;
    description?: string;
  };
}

function generateMelody(notesStr: string, bpm: number = 120): { notes: NoteEvent[]; duration: number } {
  const beatDuration = 60 / bpm;
  const notes: NoteEvent[] = [];
  let currentTime = 0;
  for (const token of notesStr.split(' ')) {
    if (!token) continue;
    const [noteName, beatsStr] = token.split(':');
    const beats = parseFloat(beatsStr);
    const duration = beats * beatDuration;
    if (noteName !== 'R') {
      try {
        const midi = Frequency(noteName).toMidi();
        notes.push({
          midi,
          time: currentTime,
          duration: duration * 0.9,
          velocity: 0.8,
        });
      } catch (e) {
        console.warn(`Could not parse note: ${noteName}`, e);
      }
    }
    currentTime += duration;
  }
  return { notes, duration: currentTime };
}

export const builtInSongs: Song[] = [
  {
    id: 'twinkle',
    title: 'Twinkle Twinkle Little Star',
    artist: 'Traditional',
    style: 'Traditional',
    difficulty: 1,
    ...generateMelody('C4:1 C4:1 G4:1 G4:1 A4:1 A4:1 G4:2 F4:1 F4:1 E4:1 E4:1 D4:1 D4:1 C4:2 G4:1 G4:1 F4:1 F4:1 E4:1 E4:1 D4:2 G4:1 G4:1 F4:1 F4:1 E4:1 E4:1 D4:2 C4:1 C4:1 G4:1 G4:1 A4:1 A4:1 G4:2 F4:1 F4:1 E4:1 E4:1 D4:1 D4:1 C4:2', 100),
  },
  {
    id: 'happy_birthday',
    title: 'Happy Birthday',
    artist: 'Traditional',
    style: 'Traditional',
    difficulty: 1,
    ...generateMelody('G3:0.75 G3:0.25 A3:1 G3:1 C4:1 B3:2 G3:0.75 G3:0.25 A3:1 G3:1 D4:1 C4:2 G3:0.75 G3:0.25 G4:1 E4:1 C4:1 B3:1 A3:2 F4:0.75 F4:0.25 E4:1 C4:1 D4:1 C4:2', 90),
  },
  {
    id: 'jingle_bells',
    title: 'Jingle Bells',
    artist: 'Traditional',
    style: 'Traditional',
    difficulty: 1,
    ...generateMelody('E4:1 E4:1 E4:2 E4:1 E4:1 E4:2 E4:1 G4:1 C4:1.5 D4:0.5 E4:4 F4:1 F4:1 F4:1.5 F4:0.5 F4:1 E4:1 E4:1 E4:0.5 E4:0.5 E4:1 D4:1 D4:1 E4:1 D4:2 G4:2', 120),
  },
  {
    id: 'ode_to_joy',
    title: 'Ode to Joy',
    artist: 'Beethoven',
    style: 'Classical',
    difficulty: 2,
    unlockCondition: {
      type: 'score',
      value: 5000,
    },
    ...generateMelody('E4:1 E4:1 F4:1 G4:1 G4:1 F4:1 E4:1 D4:1 C4:1 C4:1 D4:1 E4:1 E4:1.5 D4:0.5 D4:2 E4:1 E4:1 F4:1 G4:1 G4:1 F4:1 E4:1 D4:1 C4:1 C4:1 D4:1 E4:1 D4:1.5 C4:0.5 C4:2', 120),
  },
  {
    id: 'minuet_g',
    title: 'Minuet in G',
    artist: 'J.S. Bach',
    style: 'Classical',
    difficulty: 2,
    ...generateMelody('D4:1 G3:0.5 A3:0.5 B3:0.5 C4:0.5 D4:1 G3:1 G3:1 E4:1 C4:0.5 D4:0.5 E4:0.5 F#4:0.5 G4:1 G3:1 G3:1 C4:1 D4:0.5 C4:0.5 B3:0.5 A3:0.5 B3:1 C4:0.5 B3:0.5 A3:0.5 G3:0.5 F#3:1 G3:0.5 A3:0.5 B3:0.5 G3:0.5 A3:2', 110),
  },
  {
    id: 'canon_d',
    title: 'Canon in D',
    artist: 'Pachelbel',
    style: 'Classical',
    difficulty: 3,
    unlockCondition: {
      type: 'achievement',
      value: 'first_song',
      description: 'Unlock "First Steps" achievement',
    },
    ...generateMelody('F#4:2 E4:2 D4:2 C#4:2 B3:2 A3:2 B3:2 C#4:2 F#4:1 F#4:1 E4:1 E4:1 D4:1 D4:1 C#4:1 C#4:1 B3:1 B3:1 A3:1 A3:1 B3:1 B3:1 C#4:1 C#4:1', 80),
  },
  {
    id: 'fur_elise',
    title: 'Für Elise',
    artist: 'Beethoven',
    style: 'Classical',
    difficulty: 4,
    unlockCondition: {
      type: 'achievement',
      value: 'perfect_10',
      description: 'Unlock "Perfect 10" achievement',
    },
    ...generateMelody('E5:0.5 D#5:0.5 E5:0.5 D#5:0.5 E5:0.5 B4:0.5 D5:0.5 C5:0.5 A4:2 R:0.5 C4:0.5 E4:0.5 A4:0.5 B4:2 R:0.5 E4:0.5 G#4:0.5 B4:0.5 C5:2 R:0.5 E4:0.5 E5:0.5 D#5:0.5 E5:0.5 D#5:0.5 E5:0.5 B4:0.5 D5:0.5 C5:0.5 A4:2', 140),
  },
  {
    id: 'blues_riff',
    title: 'Simple Blues Riff',
    artist: 'Unknown',
    style: 'Jazz',
    difficulty: 3,
    ...generateMelody('C4:0.5 E4:0.5 G4:0.5 A4:0.5 A#4:0.5 A4:0.5 G4:0.5 E4:0.5 F4:0.5 A4:0.5 C5:0.5 D5:0.5 D#5:0.5 D5:0.5 C5:0.5 A4:0.5 C4:0.5 E4:0.5 G4:0.5 A4:0.5 A#4:0.5 A4:0.5 G4:0.5 E4:0.5 G4:0.5 B4:0.5 D5:0.5 E5:0.5 F4:0.5 A4:0.5 C5:0.5 D5:0.5 C4:0.5 E4:0.5 G4:0.5 A4:0.5 C4:2', 140),
  },
  {
    id: 'jazz_walk',
    title: 'Jazz Walk',
    artist: 'The Cats',
    style: 'Jazz',
    difficulty: 4,
    unlockCondition: {
      type: 'achievement',
      value: 'play_3_styles',
      description: 'Unlock "Versatile" achievement',
    },
    ...generateMelody('C4:1 D#4:1 F4:1 F#4:1 G4:1 A#4:1 C5:1 A#4:1 G4:1 F#4:1 F4:1 D#4:1 C4:1 A#3:1 G3:1 F3:1 C4:0.66 E4:0.66 G4:0.66 A#4:2', 160),
  },
  {
    id: 'neon_lights',
    title: 'Neon Lights',
    artist: 'Synthwave Bot',
    style: 'Pop',
    difficulty: 2,
    ...generateMelody('C4:0.5 C4:0.5 G4:0.5 G4:0.5 A#4:1 G4:1 F4:0.5 F4:0.5 D#4:0.5 D#4:0.5 C4:2 C4:0.5 D#4:0.5 F4:0.5 G4:0.5 A#4:1 C5:1 A#4:0.5 G4:0.5 F4:0.5 D#4:0.5 C4:2', 110),
  },
  {
    id: 'prelude_em',
    title: 'Prelude in E Minor',
    artist: 'Chopin',
    style: 'Classical',
    difficulty: 4,
    unlockCondition: {
      type: 'achievement',
      value: 'practice_1h',
      description: 'Unlock "Dedicated" achievement',
    },
    ...generateMelody('B4:2 B4:1 C5:1 B4:1 C5:1 B4:1 C5:1 B4:2 A#4:2 A4:2 A4:1 B4:1 A4:1 B4:1 A4:1 B4:1 A4:2 G#4:2 G4:2 G4:1 A4:1 G4:1 A4:1 G4:1 A4:1 G4:2 F#4:2 F4:2 E4:4', 70),
  }
];

/**
 * Parses a MIDI file and converts it into a Song object.
 */
export async function parseMidiFile(file: File): Promise<Song> {
  const arrayBuffer = await file.arrayBuffer();
  const midi = new Midi(arrayBuffer);
  
  const notes: NoteEvent[] = [];
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
    id: `custom_${Date.now()}`,
    title: file.name.replace(/\.[^/.]+$/, ""),
    artist: 'Custom Upload',
    style: 'Unknown',
    difficulty: 3,
    notes,
    duration: midi.duration,
  };
}
