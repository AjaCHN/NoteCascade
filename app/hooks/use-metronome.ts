// app/hooks/use-metronome.ts v2.3.1
import { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { useMetronomeEnabled, useMetronomeBpm } from '../lib/store';

export function useMetronome() {
  const enabled = useMetronomeEnabled();
  const bpm = useMetronomeBpm();
  const clickRef = useRef<Tone.MembraneSynth | null>(null);

  useEffect(() => {
    clickRef.current = new Tone.MembraneSynth({
      pitchDecay: 0.001,
      octaves: 1,
      oscillator: { type: "square" },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
    }).toDestination();
    
    return () => {
      clickRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      Tone.Transport.stop();
      return;
    }

    Tone.Transport.bpm.value = bpm;
    
    const part = new Tone.Part((time) => {
      clickRef.current?.triggerAttackRelease("C4", "8n", time);
    }, [[0]]);
    
    part.loop = true;
    part.loopEnd = "4n";
    part.start(0);

    Tone.Transport.start();

    return () => {
      part.stop();
      part.dispose();
      Tone.Transport.stop();
    };
  }, [enabled, bpm]);
}
