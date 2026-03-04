// app/lib/audio/state.ts v1.0.0
import * as Tone from 'tone';

export const audioState = {
  synth: null as Tone.PolySynth | null,
  piano: null as Tone.Sampler | null,
  epiano: null as Tone.PolySynth | null,
  strings: null as Tone.PolySynth | null,
  celesta: null as Tone.PolySynth | null,
  pad: null as Tone.PolySynth | null,
  masterVolume: null as Tone.Volume | null,
  masterEq: null as Tone.EQ3 | null,
  masterReverb: null as Tone.Reverb | null,
  masterLimiter: null as Tone.Limiter | null,
  masterCompressor: null as Tone.Compressor | null,
  expressionGain: null as Tone.Gain | null,
  vibrato: null as Tone.Vibrato | null,
  metronomeSynth: null as Tone.MembraneSynth | null,
  currentInstrument: 'piano',
  isSustainPedalDown: false,
  sustainedNotes: new Set<string>(),
  activeNotes: new Set<string>(),
  metronomeEventId: null as number | null,
};
