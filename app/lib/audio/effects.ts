// app/lib/audio/effects.ts v1.0.0
import { audioState } from './state';

export const setPitchBend = (value: number) => {
  const detune = (value - 0.5) * 2400;
  if (audioState.synth) audioState.synth.set({ detune });
  if (audioState.epiano) audioState.epiano.set({ detune });
  if (audioState.strings) audioState.strings.set({ detune });
  if (audioState.piano) (audioState.piano as unknown as { set: (opt: { detune: number }) => void }).set({ detune });
};

export const setModulation = (value: number) => {
  if (audioState.vibrato) audioState.vibrato.depth.value = value * 0.5;
};

export const setExpression = (value: number) => {
  if (audioState.expressionGain) audioState.expressionGain.gain.rampTo(value, 0.05);
};

export const resetAudioEffects = () => {
  setPitchBend(0.5);
  setModulation(0);
  setExpression(1);
};
