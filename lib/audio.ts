import * as Tone from 'tone';

let synth: Tone.PolySynth | null = null;
let reverb: Tone.Reverb | null = null;

/**
 * Initializes the audio system with a professional-grade synthesizer and reverb.
 */
export async function initAudio() {
  await Tone.start();
  
  if (!synth) {
    reverb = new Tone.Reverb({
      decay: 2.5,
      preDelay: 0.01,
      wet: 0.3
    }).toDestination();

    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { 
        attack: 0.02, 
        decay: 0.1, 
        sustain: 0.3, 
        release: 1.2 
      },
    }).connect(reverb);
  }
}

/**
 * Plays a MIDI note with the specified velocity.
 */
export function playNote(midiNote: number, velocity: number = 0.8) {
  if (!synth) return;
  const freq = Tone.Frequency(midiNote, 'midi').toFrequency();
  synth.triggerAttack(freq, Tone.now(), velocity);
}

/**
 * Releases a MIDI note.
 */
export function releaseNote(midiNote: number) {
  if (!synth) return;
  const freq = Tone.Frequency(midiNote, 'midi').toFrequency();
  synth.triggerRelease(freq, Tone.now());
}

/**
 * Stops all currently playing notes.
 */
export function stopAllNotes() {
  if (!synth) return;
  synth.releaseAll();
}
