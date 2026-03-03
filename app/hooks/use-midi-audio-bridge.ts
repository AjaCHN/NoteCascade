// app/hooks/use-midi-audio-bridge.ts v1.0.0
import { useEffect } from 'react';
import { initAudio, startNote, stopNote } from '../lib/audio';
import { MidiMessage } from './use-midi';

export function useMidiAudioBridge(lastMessage: MidiMessage | null) {
  useEffect(() => {
    if (lastMessage) {
      initAudio();
      const { command, note, velocity } = lastMessage;
      const status = command & 0xf0;
      if (status === 0x90 && velocity > 0) {
        startNote(note, velocity / 127);
      } else if (status === 0x80 || (status === 0x90 && velocity === 0)) {
        stopNote(note);
      }
    }
  }, [lastMessage]);
}
