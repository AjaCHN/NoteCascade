import { useState, useEffect, useCallback } from 'react';

export interface MidiDevice {
  id: string;
  name: string;
  manufacturer: string;
}

export function useMidi() {
  const [midiAccess, setMidiAccess] = useState<WebMidi.MIDIAccess | null>(null);
  const [inputs, setInputs] = useState<MidiDevice[]>([]);
  const [selectedInputId, setSelectedInputId] = useState<string | null>(null);
  const [activeNotes, setActiveNotes] = useState<Map<number, number>>(new Map());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(
        (access) => {
          setMidiAccess(access);
          const update = () => {
            const newInputs: MidiDevice[] = [];
            access.inputs.forEach((input) => {
              newInputs.push({
                id: input.id,
                name: input.name || 'Unknown Device',
                manufacturer: input.manufacturer || 'Unknown',
              });
            });
            setInputs(newInputs);
            if (newInputs.length > 0 && !selectedInputId) {
              setSelectedInputId(newInputs[0].id);
            }
          };
          update();
          access.onstatechange = update;
        },
        (err) => {
          console.error('MIDI Access Failed', err);
          setError('Could not access MIDI devices.');
        }
      );
    }
  }, [selectedInputId]);

  const handleMidiMessage = useCallback((message: WebMidi.MIDIMessageEvent) => {
    const [status, data1, data2] = message.data;
    const command = status >> 4;
    const note = data1;
    const velocity = data2 / 127;

    if (command === 9 && velocity > 0) {
      setActiveNotes((prev) => {
        const next = new Map(prev);
        next.set(note, velocity);
        return next;
      });
    } else if (command === 8 || (command === 9 && velocity === 0)) {
      setActiveNotes((prev) => {
        const next = new Map(prev);
        next.delete(note);
        return next;
      });
    }
  }, []);

  useEffect(() => {
    if (!midiAccess || !selectedInputId) return;
    const input = midiAccess.inputs.get(selectedInputId);
    if (input) {
      input.onmidimessage = handleMidiMessage;
    }
    return () => {
      if (input) input.onmidimessage = null;
    };
  }, [midiAccess, selectedInputId, handleMidiMessage]);

  return { inputs, selectedInputId, setSelectedInputId, activeNotes, error };
}
