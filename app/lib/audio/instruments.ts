// app/lib/audio/instruments.ts v2.4.0
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
      oscillator: { type: "fatsawtooth", count: 2, spread: 15 },
      envelope: { attack: 0.005, decay: 0.2, sustain: 0.3, release: 1.2 }
    });
    audioState.synth.maxPolyphony = 16;
    audioState.synth.chain(new Tone.Filter(2500, "lowpass"), audioState.masterVolume!);
  }

  if (!audioState.epiano) {
    audioState.epiano = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3.5, modulationIndex: 10, oscillator: { type: "sine" },
      envelope: { attack: 0.005, decay: 2, sustain: 0.1, release: 1.5 },
      modulation: { type: "triangle" },
      modulationEnvelope: { attack: 0.005, decay: 0.5, sustain: 0, release: 0.5 }
    });
    audioState.epiano.maxPolyphony = 16;
    audioState.epiano.chain(new Tone.Chorus(4, 2.5, 0.5).start(), audioState.masterVolume!);
  }

  if (!audioState.strings) {
    audioState.strings = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "fatsawtooth", count: 3, spread: 25 },
      envelope: { attack: 0.5, decay: 0.3, sustain: 0.8, release: 2.0 }
    });
    audioState.strings.maxPolyphony = 16;
    audioState.strings.chain(new Tone.Chorus(4, 1.5, 0.5).start(), new Tone.Filter(1200, "lowpass"), audioState.masterVolume!);
  }

  if (!audioState.celesta) {
    audioState.celesta = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 8,
      modulationIndex: 20,
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.5 },
      modulation: { type: "square" },
      modulationEnvelope: { attack: 0.002, decay: 0.05, sustain: 0, release: 0.05 }
    });
    audioState.celesta.maxPolyphony = 16;
    audioState.celesta.chain(new Tone.Filter(4000, "lowpass"), audioState.masterVolume!);
  }

  if (!audioState.pad) {
    audioState.pad = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "fatsawtooth", count: 3, spread: 30 },
      envelope: { attack: 1.5, decay: 0.5, sustain: 0.7, release: 2.5 }
    });
    audioState.pad.maxPolyphony = 16;
    audioState.pad.chain(new Tone.Chorus(2, 1.5, 0.7).start(), new Tone.Filter(800, "lowpass"), audioState.masterVolume!);
  }

  if (!audioState.metronomeSynth) {
    audioState.metronomeSynth = new Tone.MembraneSynth({
      pitchDecay: 0.008, octaves: 2,
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.01 }
    }).connect(audioState.masterVolume!);
  }
};
