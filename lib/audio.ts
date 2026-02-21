import * as Tone from 'tone';

let synth: Tone.PolySynth | null = null;

export async function initAudio() {
  await Tone.start();
  if (!synth) {
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 1 },
    }).toDestination();
  }
}

export function playNote(midiNote: number, velocity: number = 0.8) {
  if (!synth) return;
  const freq = Tone.Frequency(midiNote, 'midi').toFrequency();
  synth.triggerAttack(freq, Tone.now(), velocity);
}

export function releaseNote(midiNote: number) {
  if (!synth) return;
  const freq = Tone.Frequency(midiNote, 'midi').toFrequency();
  synth.triggerRelease(freq, Tone.now());
}
