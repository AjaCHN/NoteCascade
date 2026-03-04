// app/hooks/use-midi-audio-bridge.ts v1.0.0
import { useEffect } from 'react';
import { initAudio, startNote, stopNote } from '../lib/audio';
import { MidiMessage } from './use-midi';

export function useMidiAudioBridge(lastMessage: MidiMessage | null) {
  // Logic moved to direct MIDI callback in useMidi.ts for lower latency
  return null;
}
