// app/lib/audio.ts v2.0.0
import * as Tone from 'tone';
import { audioState } from './audio/state';
import { initInstruments } from './audio/instruments';
import { setPitchBend, setModulation, setExpression, resetAudioEffects } from './audio/effects';
import { setMetronome } from './audio/metronome';

export { setPitchBend, setModulation, setExpression, resetAudioEffects, setMetronome };

export const setAudioInstrument = (instrument: string) => {
  audioState.currentInstrument = instrument;
};

export const initAudio = async () => {
  if (Tone.getContext().state !== 'running') {
    await Tone.start();
  }
  
  // Optimize for low latency
  if (Tone.getContext().latencyHint !== 'interactive') {
    Tone.getContext().latencyHint = 'interactive';
  }
  // Reduce lookahead to minimize delay between trigger and sound
  if (Tone.getContext().lookAhead !== 0.01) {
    Tone.getContext().lookAhead = 0.01;
  }

  if (!audioState.masterVolume) {
    audioState.masterEq = new Tone.EQ3({ low: 2, mid: -1, high: 1.5 });
    audioState.masterReverb = new Tone.Reverb({ decay: 2.5, preDelay: 0.01, wet: 0.15 });
    audioState.masterCompressor = new Tone.Compressor({ threshold: -24, ratio: 4, attack: 0.01, release: 0.25 });
    audioState.masterLimiter = new Tone.Limiter(-1);
    audioState.vibrato = new Tone.Vibrato({ frequency: 5, depth: 0 });
    audioState.expressionGain = new Tone.Gain(1);
    audioState.masterVolume = new Tone.Volume(-8);
    
    audioState.masterVolume.chain(
      audioState.vibrato, audioState.expressionGain, audioState.masterEq, 
      audioState.masterCompressor, audioState.masterReverb, audioState.masterLimiter, Tone.Destination
    );
  }
  
  await initInstruments();
};

export const startTransport = () => {
  if (Tone.Transport.state !== 'started') Tone.Transport.start();
};

export const stopTransport = () => {
  if (Tone.Transport.state === 'started') Tone.Transport.stop();
};

export const setVolume = (value: number) => {
  if (audioState.masterVolume) {
    const db = value === 0 ? -Infinity : 20 * Math.log10(value / 100);
    audioState.masterVolume.volume.value = db;
  }
};

export const setSustainPedal = (isDown: boolean) => {
  audioState.isSustainPedalDown = isDown;
  if (!isDown) {
    audioState.sustainedNotes.forEach(note => {
      if (!audioState.activeNotes.has(note)) stopNoteInternal(note);
    });
    audioState.sustainedNotes.clear();
  }
};

const stopNoteInternal = (noteToPlay: string) => {
  const { currentInstrument, piano, epiano, strings, celesta, pad, synth } = audioState;
  if (currentInstrument === 'piano' && piano?.loaded) piano.triggerRelease(noteToPlay);
  else if (currentInstrument === 'epiano' && epiano) epiano.triggerRelease(noteToPlay);
  else if (currentInstrument === 'strings' && strings) strings.triggerRelease(noteToPlay);
  else if (currentInstrument === 'celesta' && celesta) celesta.triggerRelease(noteToPlay);
  else if (currentInstrument === 'pad' && pad) pad.triggerRelease(noteToPlay);
  else if (synth) synth.triggerRelease(noteToPlay);
};

export const startNote = (note: string | number, velocity: number = 0.7) => {
  const noteToPlay = typeof note === 'number' ? Tone.Frequency(note, "midi").toNote() : note;
  audioState.activeNotes.add(noteToPlay);
  audioState.sustainedNotes.delete(noteToPlay);
  
  const { currentInstrument, piano, epiano, strings, celesta, pad, synth } = audioState;
  if (currentInstrument === 'piano' && piano?.loaded) piano.triggerAttack(noteToPlay, undefined, velocity);
  else if (currentInstrument === 'epiano' && epiano) epiano.triggerAttack(noteToPlay, undefined, velocity);
  else if (currentInstrument === 'strings' && strings) strings.triggerAttack(noteToPlay, undefined, velocity);
  else if (currentInstrument === 'celesta' && celesta) celesta.triggerAttack(noteToPlay, undefined, velocity);
  else if (currentInstrument === 'pad' && pad) pad.triggerAttack(noteToPlay, undefined, velocity);
  else if (synth) synth.triggerAttack(noteToPlay, undefined, velocity);
};

export const stopNote = (note: string | number) => {
  const noteToPlay = typeof note === 'number' ? Tone.Frequency(note, "midi").toNote() : note;
  audioState.activeNotes.delete(noteToPlay);
  if (audioState.isSustainPedalDown) audioState.sustainedNotes.add(noteToPlay);
  else stopNoteInternal(noteToPlay);
};

export const playNote = (note: string | number, duration: string | number = '8n', velocity: number = 0.7) => {
  const noteToPlay = typeof note === 'number' ? Tone.Frequency(note, "midi").toNote() : note;
  const { currentInstrument, piano, epiano, strings, celesta, pad, synth } = audioState;
  if (currentInstrument === 'piano' && piano?.loaded) piano.triggerAttackRelease(noteToPlay, duration, undefined, velocity);
  else if (currentInstrument === 'epiano' && epiano) epiano.triggerAttackRelease(noteToPlay, duration, undefined, velocity);
  else if (currentInstrument === 'strings' && strings) strings.triggerAttackRelease(noteToPlay, duration, undefined, velocity);
  else if (currentInstrument === 'celesta' && celesta) celesta.triggerAttackRelease(noteToPlay, duration, undefined, velocity);
  else if (currentInstrument === 'pad' && pad) pad.triggerAttackRelease(noteToPlay, duration, undefined, velocity);
  else if (synth) synth.triggerAttackRelease(noteToPlay, duration, undefined, velocity);
};

export const clearScheduledEvents = () => {
  Tone.Transport.cancel();
};

export const scheduleNote = (
  note: { midi: number; time: number; duration: number; velocity: number },
  onStart?: () => void,
  onEnd?: () => void
) => {
  const noteToPlay = Tone.Frequency(note.midi, "midi").toNote();
  Tone.Transport.schedule((time) => {
    if (onStart) Tone.Draw.schedule(onStart, time);
    const { currentInstrument, piano, epiano, strings, celesta, pad, synth } = audioState;
    if (currentInstrument === 'piano' && piano?.loaded) piano.triggerAttackRelease(noteToPlay, note.duration, time, note.velocity);
    else if (currentInstrument === 'epiano' && epiano) epiano.triggerAttackRelease(noteToPlay, note.duration, time, note.velocity);
    else if (currentInstrument === 'strings' && strings) strings.triggerAttackRelease(noteToPlay, note.duration, time, note.velocity);
    else if (currentInstrument === 'celesta' && celesta) celesta.triggerAttackRelease(noteToPlay, note.duration, time, note.velocity);
    else if (currentInstrument === 'pad' && pad) pad.triggerAttackRelease(noteToPlay, note.duration, time, note.velocity);
    else if (synth) synth.triggerAttackRelease(noteToPlay, note.duration, time, note.velocity);
  }, note.time);

  if (onEnd) {
    Tone.Transport.schedule((time) => {
      Tone.Draw.schedule(onEnd, time);
    }, note.time + note.duration);
  }
};

export const ensureAudioContext = async () => {
  if (Tone.getContext().state !== 'running') await Tone.getContext().resume();
};
