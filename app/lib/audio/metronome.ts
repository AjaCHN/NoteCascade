// app/lib/audio/metronome.ts v1.0.0
import * as Tone from 'tone';
import { audioState } from './state';

export const setMetronome = (enabled: boolean, bpm: number, beats: number) => {
  Tone.Transport.bpm.value = bpm;
  Tone.Transport.timeSignature = beats;
  
  if (audioState.metronomeEventId !== null) {
    Tone.Transport.clear(audioState.metronomeEventId);
    audioState.metronomeEventId = null;
  }

  if (enabled) {
    audioState.metronomeEventId = Tone.Transport.scheduleRepeat((time) => {
      if (audioState.metronomeSynth) {
        const bbs = Tone.Time(time).toBarsBeatsSixteenths();
        const beat = parseInt(bbs.split(':')[1]);
        const isFirstBeat = beat === 0;
        audioState.metronomeSynth.triggerAttackRelease(isFirstBeat ? "C5" : "C4", "32n", time, isFirstBeat ? 0.8 : 0.4);
      }
    }, "4n");
  }
};
