// app/lib/audio.ts v1.5.0
import * as Tone from 'tone';
import { createInstruments, Instruments } from './audio/instruments';

let instruments: Instruments | null = null;
let masterVolume: Tone.Volume | null = null;
let masterEq: Tone.EQ3 | null = null;
let masterReverb: Tone.Freeverb | null = null;
let masterLimiter: Tone.Limiter | null = null;
let masterCompressor: Tone.Compressor | null = null;
let expressionGain: Tone.Gain | null = null;
let vibrato: Tone.Vibrato | null = null;
let metronomeSynth: Tone.MembraneSynth | null = null;
let currentInstrument: string = 'piano';

export const setAudioInstrument = (instrument: string) => { currentInstrument = instrument; };

export const setPitchBend = (value: number) => {
  const detune = (value - 0.5) * 2400;
  if (!instruments) return;
  const { synth, epiano, strings, piano } = instruments;
  if (synth) synth.set({ detune });
  if (epiano) epiano.set({ detune });
  if (strings) strings.set({ detune });
  // @ts-ignore - detune exists on Sampler but type definition is missing it in set()
  if (piano) piano.set({ detune });
};

export const setModulation = (value: number) => { if (vibrato) vibrato.depth.value = value * 0.5; };
export const setExpression = (value: number) => { if (expressionGain) expressionGain.gain.rampTo(value, 0.05); };

export const initAudio = async () => {
  await Tone.start();
  if (!masterVolume) {
    masterEq = new Tone.EQ3({ low: 4, mid: -1, high: 2 });
    masterReverb = new Tone.Freeverb({ roomSize: 0.6, dampening: 2000, wet: 0.2 });
    masterCompressor = new Tone.Compressor({ threshold: -30, ratio: 12, attack: 0.003, release: 0.25 });
    masterLimiter = new Tone.Limiter(-3);
    vibrato = new Tone.Vibrato({ frequency: 5, depth: 0 });
    expressionGain = new Tone.Gain(1);
    masterVolume = new Tone.Volume(-6);
    masterVolume.chain(vibrato, expressionGain, masterEq, masterCompressor, masterReverb, masterLimiter, Tone.Destination);
  }
  if (!instruments && masterVolume) {
    instruments = createInstruments(masterVolume);
  }
  if (!metronomeSynth && masterVolume) {
    metronomeSynth = new Tone.MembraneSynth({
      pitchDecay: 0.008, octaves: 2,
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.01 }
    }).connect(masterVolume);
  }
};

export const playMetronomeClick = (isFirstBeat: boolean = false) => {
  if (metronomeSynth) metronomeSynth.triggerAttackRelease(isFirstBeat ? "C5" : "C4", "32n", undefined, isFirstBeat ? 0.8 : 0.4);
};

let metronomeEventId: number | null = null;
export const setMetronome = (enabled: boolean, bpm: number, beats: number) => {
  Tone.Transport.bpm.value = bpm;
  Tone.Transport.timeSignature = beats;
  if (metronomeEventId !== null) { Tone.Transport.clear(metronomeEventId); metronomeEventId = null; }
  if (enabled) {
    metronomeEventId = Tone.Transport.scheduleRepeat((time) => {
      if (metronomeSynth) {
        const beat = parseInt(Tone.Time(time).toBarsBeatsSixteenths().split(':')[1]);
        const isFirstBeat = beat === 0;
        metronomeSynth.triggerAttackRelease(isFirstBeat ? "C5" : "C4", "32n", time, isFirstBeat ? 0.8 : 0.4);
      }
    }, "4n");
  }
};

export const startTransport = () => { if (Tone.Transport.state !== 'started') Tone.Transport.start(); };
export const stopTransport = () => { if (Tone.Transport.state === 'started') Tone.Transport.stop(); };
export const setVolume = (value: number) => {
  if (masterVolume) {
    const db = value === 0 ? -Infinity : 20 * Math.log10(value / 100);
    masterVolume.volume.value = db;
  }
};

let isSustainPedalDown = false;
const sustainedNotes = new Set<string>();
const activeNotes = new Set<string>();

export const setSustainPedal = (isDown: boolean) => {
  isSustainPedalDown = isDown;
  if (!isDown) {
    sustainedNotes.forEach(note => { if (!activeNotes.has(note)) stopNoteInternal(note); });
    sustainedNotes.clear();
  }
};

const getInstrument = () => {
  if (!instruments) return null;
  const { piano, epiano, strings, synth } = instruments;
  if (currentInstrument === 'piano' && piano?.loaded) return piano;
  if (currentInstrument === 'epiano' && epiano) return epiano;
  if (currentInstrument === 'strings' && strings) return strings;
  return synth;
};

export const startNote = (note: string | number, velocity: number = 0.7) => {
  const noteToPlay = typeof note === 'number' ? Tone.Frequency(note, "midi").toNote() : note;
  activeNotes.add(noteToPlay);
  sustainedNotes.delete(noteToPlay);
  const inst = getInstrument();
  if (inst) inst.triggerAttack(noteToPlay, undefined, velocity);
};

export const playNote = (note: string | number, duration: string | number = '8n', velocity: number = 0.7) => {
  const noteToPlay = typeof note === 'number' ? Tone.Frequency(note, "midi").toNote() : note;
  const inst = getInstrument();
  if (inst) inst.triggerAttackRelease(noteToPlay, duration, undefined, velocity);
};

export const stopNote = (note: string | number) => {
  const noteToPlay = typeof note === 'number' ? Tone.Frequency(note, "midi").toNote() : note;
  activeNotes.delete(noteToPlay);
  if (isSustainPedalDown) sustainedNotes.add(noteToPlay);
  else stopNoteInternal(noteToPlay);
};

const stopNoteInternal = (noteToPlay: string) => {
  const inst = getInstrument();
  if (inst) inst.triggerRelease(noteToPlay);
};

export const clearScheduledEvents = () => { Tone.Transport.cancel(); };

export const scheduleNote = (note: { midi: number; time: number; duration: number; velocity: number }, onStart?: () => void, onEnd?: () => void) => {
  const noteToPlay = Tone.Frequency(note.midi, "midi").toNote();
  Tone.Transport.schedule((time) => {
    if (onStart) Tone.Draw.schedule(onStart, time);
    const inst = getInstrument();
    if (inst) inst.triggerAttackRelease(noteToPlay, note.duration, time, note.velocity);
  }, note.time);
  if (onEnd) Tone.Transport.schedule((time) => { Tone.Draw.schedule(onEnd, time); }, note.time + note.duration);
};

export const ensureAudioContext = async () => { if (Tone.getContext().state !== 'running') await Tone.getContext().resume(); };
