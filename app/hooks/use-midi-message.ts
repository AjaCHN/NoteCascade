// app/hooks/use-midi-message.ts v2.0.0
import { useCallback } from 'react';
import { applyVelocityCurve, parseMidiMessage } from '../lib/midi-utils';
import type { VelocityCurve } from '../lib/midi-utils';
import { initAudio, startNote, stopNote, setPitchBend, setModulation, setExpression, setSustainPedal, resetAudioEffects } from '../lib/audio';
import type { MidiMessage } from './use-midi';

export function useMidiMessage(
  settingsRef: React.MutableRefObject<{
    selectedInputId: string | null;
    midiChannel: number | 'all';
    velocityCurve: VelocityCurve;
    transpose: number;
  }>,
  setLastMessage: (msg: MidiMessage | null) => void,
  setActiveNotes: React.Dispatch<React.SetStateAction<Map<number, number>>>
) {
  return useCallback((event: WebMidi.MIDIMessageEvent) => {
    const { selectedInputId, midiChannel, velocityCurve, transpose } = settingsRef.current;
    const inputId = (event.target as WebMidi.MIDIInput)?.id;
    
    if (selectedInputId && selectedInputId !== 'all' && inputId && inputId !== selectedInputId) return;

    const parsed = parseMidiMessage(event);
    if (!parsed) return;

    const { command, channel, note: rawNote, velocity: rawVelocity, timestamp } = parsed;

    if (midiChannel !== 'all' && channel !== midiChannel) return;

    if (command === 0x90 || command === 0x80) {
      const note = Math.max(0, Math.min(127, rawNote + transpose));
      let velocity = rawVelocity;

      if (command === 0x90 && velocity > 0) {
        velocity = Math.round(applyVelocityCurve(velocity, velocityCurve));
      }

      setLastMessage({ command, note, velocity, channel, timestamp });

      // Direct audio trigger to bypass React state/effect latency
      initAudio(); // Ensure context is started
      if (command === 0x90 && velocity > 0) {
        startNote(note, velocity / 127);
      } else {
        stopNote(note);
      }

      if (command === 0x90 && velocity > 0) {
        setActiveNotes(prev => new Map(prev).set(note, velocity / 127));
      } else {
        setActiveNotes(prev => {
          const next = new Map(prev);
          next.delete(note);
          return next;
        });
      }
    } else if (command === 0xE0) {
      const value = (rawVelocity << 7 | rawNote) / 16383;
      setPitchBend(value);
    } else if (command === 0xB0) {
      if (rawNote === 1) {
        setModulation(rawVelocity / 127);
      } else if (rawNote === 7 || rawNote === 11) {
        setExpression(rawVelocity / 127);
      } else if (rawNote === 64) {
        setSustainPedal(rawVelocity >= 64);
      } else if (rawNote === 123 || rawNote === 121) {
        setActiveNotes(new Map());
        resetAudioEffects();
      }
    }
  }, [setLastMessage, setActiveNotes, settingsRef]);
}
