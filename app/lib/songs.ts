import { Midi } from '@tonejs/midi';

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

export const builtInSongs: Song[] = [
  {
    id: 'twinkle',
    title: 'Twinkle Twinkle Little Star',
    artist: 'Traditional',
    difficulty: 1,
    midiUrl: '/midi/twinkle.mid',
    style: 'Classic',
  },
  {
    id: 'ode_to_joy',
    title: 'Ode to Joy',
    artist: 'Beethoven',
    difficulty: 2,
    midiUrl: '/midi/ode_to_joy.mid',
    style: 'Classic',
  },
  {
    id: 'fur_elise',
    title: 'Fur Elise',
    artist: 'Beethoven',
    difficulty: 3,
    midiUrl: '/midi/fur_elise.mid',
    style: 'Classic',
  },
  {
    id: 'canon_in_d',
    title: 'Canon in D',
    artist: 'Pachelbel',
    difficulty: 4,
    midiUrl: '/midi/canon.mid',
    style: 'Classic',
  },
];

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
