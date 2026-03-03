// app/lib/audio/instruments.ts v1.0.0
import * as Tone from 'tone';
import { audioState } from './state';

export const initInstruments = async () => {
  if (!audioState.piano) {
    audioState.piano = new Tone.Sampler({
      urls: {
        A0: "A0.mp3", C1: "C1.mp3", "D#1": "Ds1.mp3", "F#1": "Fs1.mp3", A1: "A1.mp3",
        C2: "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3", A2: "A2.mp3", C3: "C3.mp3",
        "D#3": "Ds3.mp3", "F#3": "Fs3.mp3", A3: "A3.mp3", C4: "C4.mp3", "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3", A4: "A4.mp3", C5: "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3",
        A5: "A5.mp3", C6: "C6.mp3", "D#6": "Ds6.mp3", "F#6": "Fs6.mp3", A6: "A6.mp3",
        C7: "C7.mp3", "D#7": "Ds7.mp3", "F#7": "Fs7.mp3", A7: "A7.mp3", C8: "C8.mp3"
      },
      release: 1.5,
      baseUrl: "https://tonejs.github.io/audio/salamander/"
    }).connect(audioState.masterVolume!);
  }

  if (!audioState.synth) {
    audioState.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "fatsawtooth", count: 3, spread: 20 },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 1.2 }
    });
    audioState.synth.maxPolyphony = 32;
    audioState.synth.chain(new Tone.Filter(3000, "lowpass"), audioState.masterVolume!);
  }

  if (!audioState.epiano) {
    audioState.epiano = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3, modulationIndex: 5, oscillator: { type: "sine" },
      envelope: { attack: 0.01, decay: 2, sustain: 0.2, release: 1.5 },
      modulation: { type: "triangle" },
      modulationEnvelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 0.5 }
    });
    audioState.epiano.maxPolyphony = 32;
    audioState.epiano.chain(new Tone.Chorus(4, 2.5, 0.5).start(), audioState.masterVolume!);
  }

  if (!audioState.strings) {
    audioState.strings = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "fatsawtooth", count: 4, spread: 30 },
      envelope: { attack: 0.4, decay: 0.2, sustain: 0.8, release: 2 }
    });
    audioState.strings.maxPolyphony = 32;
    audioState.strings.chain(new Tone.Filter(1500, "lowpass"), audioState.masterVolume!);
  }

  if (!audioState.metronomeSynth) {
    audioState.metronomeSynth = new Tone.MembraneSynth({
      pitchDecay: 0.008, octaves: 2,
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.01 }
    }).connect(audioState.masterVolume!);
  }
};
