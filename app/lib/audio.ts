/**
 * @file lib/audio.ts
 * @version v1.2.0
 */
import * as Tone from 'tone';

let synth: Tone.PolySynth | null = null;
let piano: Tone.Sampler | null = null;
let epiano: Tone.PolySynth | null = null;
let strings: Tone.PolySynth | null = null;
let masterVolume: Tone.Volume | null = null;
let metronomeSynth: Tone.MembraneSynth | null = null;
let currentInstrument: string = 'piano';

export const setAudioInstrument = (instrument: string) => {
  currentInstrument = instrument;
};

export const initAudio = async () => {
  await Tone.start();
  
  if (!masterVolume) {
    masterVolume = new Tone.Volume(0).toDestination();
  }
  
  if (!piano) {
    piano = new Tone.Sampler({
      urls: {
        A0: "A0.mp3",
        C1: "C1.mp3",
        "D#1": "Ds1.mp3",
        "F#1": "Fs1.mp3",
        A1: "A1.mp3",
        C2: "C2.mp3",
        "D#2": "Ds2.mp3",
        "F#2": "Fs2.mp3",
        A2: "A2.mp3",
        C3: "C3.mp3",
        "D#3": "Ds3.mp3",
        "F#3": "Fs3.mp3",
        A3: "A3.mp3",
        C4: "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        A4: "A4.mp3",
        C5: "C5.mp3",
        "D#5": "Ds5.mp3",
        "F#5": "Fs5.mp3",
        A5: "A5.mp3",
        C6: "C6.mp3",
        "D#6": "Ds6.mp3",
        "F#6": "Fs6.mp3",
        A6: "A6.mp3",
        C7: "C7.mp3",
        "D#7": "Ds7.mp3",
        "F#7": "Fs7.mp3",
        A7: "A7.mp3",
        C8: "C8.mp3"
      },
      release: 1,
      baseUrl: "https://tonejs.github.io/audio/salamander/"
    }).connect(masterVolume);
  }

  if (!synth) {
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 }
    }).connect(masterVolume);
  }

  if (!epiano) {
    epiano = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3,
      modulationIndex: 10,
      detune: 0,
      oscillator: { type: "sine" },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.5 },
      modulation: { type: "square" },
      modulationEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.5 }
    }).connect(masterVolume);
  }

  if (!strings) {
    strings = new Tone.PolySynth(Tone.AMSynth, {
      harmonicity: 2.5,
      oscillator: { type: "sawtooth" },
      envelope: { attack: 0.1, decay: 0.3, sustain: 0.8, release: 1.5 },
      modulation: { type: "square" },
      modulationEnvelope: { attack: 0.5, decay: 0, sustain: 1, release: 0.5 }
    }).connect(masterVolume);
  }

  if (!metronomeSynth) {
    metronomeSynth = new Tone.MembraneSynth({
      pitchDecay: 0.008,
      octaves: 2,
      envelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0,
        release: 0.01
      }
    }).connect(masterVolume);
  }
};

export const playMetronomeClick = (isFirstBeat: boolean = false) => {
  if (metronomeSynth) {
    metronomeSynth.triggerAttackRelease(isFirstBeat ? "C5" : "C4", "32n", undefined, isFirstBeat ? 0.8 : 0.4);
  }
};

let metronomeEventId: number | null = null;

export const setMetronome = (enabled: boolean, bpm: number, beats: number) => {
  Tone.Transport.bpm.value = bpm;
  Tone.Transport.timeSignature = beats;
  
  if (metronomeEventId !== null) {
    Tone.Transport.clear(metronomeEventId);
    metronomeEventId = null;
  }

  if (enabled) {
    let beatCount = 0;
    metronomeEventId = Tone.Transport.scheduleRepeat((time) => {
      if (metronomeSynth) {
        const isFirstBeat = beatCount % beats === 0;
        metronomeSynth.triggerAttackRelease(isFirstBeat ? "C5" : "C4", "32n", time, isFirstBeat ? 0.8 : 0.4);
      }
      beatCount++;
    }, "4n");
  }
};

export const startTransport = () => {
  if (Tone.Transport.state !== 'started') {
    Tone.Transport.start();
  }
};

export const stopTransport = () => {
  if (Tone.Transport.state === 'started') {
    Tone.Transport.stop();
  }
};

export const setVolume = (value: number) => {
  if (masterVolume) {
    // Convert 0-100 to decibels. 100 = 0dB, 0 = -60dB
    const db = value === 0 ? -Infinity : 20 * Math.log10(value / 100);
    masterVolume.volume.value = db;
  }
};

export const startNote = (note: string | number, velocity: number = 0.7) => {
  const noteToPlay = typeof note === 'number' ? Tone.Frequency(note, "midi").toNote() : note;
  let played = false;
  
  if (currentInstrument === 'piano' && piano?.loaded) {
    piano.triggerAttack(noteToPlay, undefined, velocity);
    played = true;
  } else if (currentInstrument === 'epiano' && epiano) {
    epiano.triggerAttack(noteToPlay, undefined, velocity);
    played = true;
  } else if (currentInstrument === 'strings' && strings) {
    strings.triggerAttack(noteToPlay, undefined, velocity);
    played = true;
  } 
  
  if (!played && synth) {
    synth.triggerAttack(noteToPlay, undefined, velocity);
  }
};

export const playNote = (note: string | number, duration: string | number = '8n', velocity: number = 0.7) => {
  // console.log('playNote called with:', note, duration, velocity);
  const noteToPlay = typeof note === 'number' ? Tone.Frequency(note, "midi").toNote() : note;
  let played = false;

  if (currentInstrument === 'piano' && piano?.loaded) {
    // console.log('Playing with piano:', noteToPlay);
    piano.triggerAttackRelease(noteToPlay, duration, velocity);
    played = true;
  } else if (currentInstrument === 'epiano' && epiano) {
    epiano.triggerAttackRelease(noteToPlay, duration, velocity);
    played = true;
  } else if (currentInstrument === 'strings' && strings) {
    strings.triggerAttackRelease(noteToPlay, duration, velocity);
    played = true;
  } 
  
  if (!played && synth) {
    // console.log('Fallback to synth:', noteToPlay);
    synth.triggerAttackRelease(noteToPlay, duration, velocity);
  }
};

export const stopNote = (note: string | number) => {
  const noteToPlay = typeof note === 'number' ? Tone.Frequency(note, "midi").toNote() : note;
  let played = false;

  if (currentInstrument === 'piano' && piano?.loaded) {
    piano.triggerRelease(noteToPlay);
    played = true;
  } else if (currentInstrument === 'epiano' && epiano) {
    epiano.triggerRelease(noteToPlay);
    played = true;
  } else if (currentInstrument === 'strings' && strings) {
    strings.triggerRelease(noteToPlay);
    played = true;
  } 
  
  if (!played && synth) {
    synth.triggerRelease(noteToPlay);
  }
};

export const getAudioContext = () => {
  return Tone.getContext();
};
