import * as Tone from 'tone';

let synth: Tone.PolySynth | null = null;
let reverb: Tone.Reverb | null = null;

const REVERB_SETTINGS = {
  decay: 2.5,
  preDelay: 0.01,
  wet: 0.3
};

const SYNTH_SETTINGS: any = {
  oscillator: { type: 'triangle' } as Partial<Tone.OmniOscillatorOptions>,
  envelope: { 
    attack: 0.02, 
    decay: 0.1, 
    sustain: 0.3, 
    release: 1.2 
  },
};

/**
 * Initializes the audio system with a professional-grade synthesizer and reverb.
 */
export async function initAudio() {
  await Tone.start();
  
  if (!synth) {
    reverb = new Tone.Reverb(REVERB_SETTINGS).toDestination();

    synth = new Tone.PolySynth(Tone.Synth, SYNTH_SETTINGS).connect(reverb);
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
