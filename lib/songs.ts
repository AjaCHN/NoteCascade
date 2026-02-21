import { Midi } from '@tonejs/midi';

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
}

const noteToMidi: Record<string, number> = {
  'C3': 48, 'D3': 50, 'E3': 52, 'F3': 53, 'G3': 55, 'A3': 57, 'B3': 59,
  'C4': 60, 'D4': 62, 'E4': 64, 'F4': 65, 'G4': 67, 'A4': 69, 'B4': 71,
  'C5': 72, 'D5': 74, 'E5': 76, 'F5': 77, 'G5': 79, 'A5': 81, 'B5': 83,
};

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
      notes.push({
        midi: noteToMidi[noteName] || 60,
        time: currentTime,
        duration: duration * 0.9,
        velocity: 0.8,
      });
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
    style: 'Classical',
    difficulty: 1,
    ...generateMelody('C4:1 C4:1 G4:1 G4:1 A4:1 A4:1 G4:2 F4:1 F4:1 E4:1 E4:1 D4:1 D4:1 C4:2 G4:1 G4:1 F4:1 F4:1 E4:1 E4:1 D4:2 G4:1 G4:1 F4:1 F4:1 E4:1 E4:1 D4:2 C4:1 C4:1 G4:1 G4:1 A4:1 A4:1 G4:2 F4:1 F4:1 E4:1 E4:1 D4:1 D4:1 C4:2', 120),
  },
  {
    id: 'ode_to_joy',
    title: 'Ode to Joy',
    artist: 'Beethoven',
    style: 'Classical',
    difficulty: 2,
    ...generateMelody('E4:1 E4:1 F4:1 G4:1 G4:1 F4:1 E4:1 D4:1 C4:1 C4:1 D4:1 E4:1 E4:1.5 D4:0.5 D4:2 E4:1 E4:1 F4:1 G4:1 G4:1 F4:1 E4:1 D4:1 C4:1 C4:1 D4:1 E4:1 D4:1.5 C4:0.5 C4:2', 120),
  },
  {
    id: 'blues_riff',
    title: 'Simple Blues Riff',
    artist: 'Unknown',
    style: 'Jazz',
    difficulty: 3,
    ...generateMelody('C4:0.5 E4:0.5 G4:0.5 A4:0.5 A#4:0.5 A4:0.5 G4:0.5 E4:0.5 F4:0.5 A4:0.5 C5:0.5 D5:0.5 D#5:0.5 D5:0.5 C5:0.5 A4:0.5 C4:0.5 E4:0.5 G4:0.5 A4:0.5 A#4:0.5 A4:0.5 G4:0.5 E4:0.5 G4:0.5 B4:0.5 D5:0.5 E5:0.5 F4:0.5 A4:0.5 C5:0.5 D5:0.5 C4:0.5 E4:0.5 G4:0.5 A4:0.5 C4:2', 140),
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
