// app/lib/songs/abc.ts v1.1.0
import type { Song, Note } from './types';

function midiToAbcPitch(midi: number): string {
  const noteNames = ['C', '^C', 'D', '^D', 'E', 'F', '^F', 'G', '^G', 'A', '^A', 'B'];
  const name = noteNames[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  
  if (octave === 4) return name; // C4 -> C
  if (octave === 5) return name.toLowerCase(); // C5 -> c
  if (octave === 6) return name.toLowerCase() + "'"; // C6 -> c'
  if (octave === 7) return name.toLowerCase() + "''"; // C7 -> c''
  if (octave === 3) return name + ","; // C3 -> C,
  if (octave === 2) return name + ",,"; // C2 -> C,,
  if (octave === 1) return name + ",,,"; // C1 -> C,,,
  
  return name;
}

export function convertToAbc(song: Song): string {
  if (!song.notes || song.notes.length === 0) return '';
  
  // Assume 4/4 time signature, 120 bpm if not specified
  const bpm = 120; // Default, ideally we'd have this in Song type
  const beatDuration = 60 / bpm;
  
  let abc = `X: 1\n`;
  abc += `T: ${song.title}\n`;
  abc += `C: ${song.artist || 'Unknown'}\n`;
  abc += `M: 4/4\n`;
  abc += `L: 1/4\n`;
  abc += `Q: 1/4=${bpm}\n`;
  abc += `K: C\n`;
  
  // Sort notes by time
  const sortedNotes = [...song.notes].sort((a, b) => a.time - b.time);
  
  // Group notes by time to form chords
  const chords: { time: number, notes: Note[] }[] = [];
  for (const note of sortedNotes) {
    const lastChord = chords[chords.length - 1];
    if (lastChord && Math.abs(lastChord.time - note.time) < 0.05) {
      lastChord.notes.push(note);
    } else {
      chords.push({ time: note.time, notes: [note] });
    }
  }
  
  let currentTime = 0;
  let measureBeats = 0;
  let abcNotes = '';
  
  for (let i = 0; i < chords.length; i++) {
    const chord = chords[i];
    
    // Check for rest
    if (chord.time > currentTime + 0.05) {
      const restDurationSecs = chord.time - currentTime;
      const restBeats = restDurationSecs / beatDuration;
      const restLength = Math.max(0.25, Math.round(restBeats * 4) / 4); // Quantize to 16th notes
      
      if (restLength > 0) {
        let rStr = 'z';
        if (restLength !== 1) {
          rStr += restLength.toString();
        }
        abcNotes += rStr + ' ';
        measureBeats += restLength;
        
        while (measureBeats >= 4) {
          abcNotes += '| ';
          measureBeats -= 4;
        }
      }
    }
    
    // Note duration (use the longest note in the chord)
    const maxDuration = Math.max(...chord.notes.map(n => n.duration));
    const noteBeats = maxDuration / beatDuration;
    const noteLength = Math.max(0.25, Math.round(noteBeats * 4) / 4); // Quantize to 16th notes
    
    let nStr = '';
    if (chord.notes.length > 1) {
      nStr += '[';
      for (const note of chord.notes) {
        nStr += midiToAbcPitch(note.midi);
      }
      nStr += ']';
    } else {
      nStr += midiToAbcPitch(chord.notes[0].midi);
    }
    
    if (noteLength !== 1) {
      nStr += noteLength.toString();
    }
    
    abcNotes += nStr + ' ';
    measureBeats += noteLength;
    
    while (measureBeats >= 4) {
      abcNotes += '| ';
      measureBeats -= 4;
    }
    
    currentTime = chord.time + maxDuration;
  }
  
  abc += abcNotes + '|]';
  return abc;
}
