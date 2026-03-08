// app/lib/songs/midi.ts v1.0.0
import { Midi } from '@tonejs/midi';
import type { Song } from './types';

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
