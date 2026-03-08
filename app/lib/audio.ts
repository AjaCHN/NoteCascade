// app/lib/audio.ts v2.4.3
import * as Tone from 'tone';

let synth: Tone.PolySynth | null = null;

export const initAudio = async () => {
  await Tone.start();
  if (!synth) {
    synth = new Tone.PolySynth(Tone.Synth).toDestination();
  }
};

export const setVolume = (val: number) => {
  Tone.getDestination().volume.value = Tone.gainToDb(val);
};

export const startNote = (note: number, velocity: number) => {
  if (synth) {
    const freq = Tone.Frequency(note, "midi").toFrequency();
    synth.triggerAttack(freq, Tone.now(), velocity);
  }
};

export const stopNote = (note: number) => {
  if (synth) {
    const freq = Tone.Frequency(note, "midi").toFrequency();
    synth.triggerRelease(freq, Tone.now());
  }
};

export const setPitchBend = (_value: number) => {
  // Implement pitch bend if needed
};

export const setModulation = (_value: number) => {
  // Implement modulation if needed
};

export const setExpression = (_value: number) => {
  // Implement expression if needed
};

export const setSustainPedal = (_value: boolean) => {
  // Implement sustain pedal if needed
};

export const resetAudioEffects = () => {
  // Reset audio effects if needed
};
