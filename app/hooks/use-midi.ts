/**
 * @file hooks/use-midi.ts
 * @version v1.2.0
 */
import { useEffect, useState, useRef } from 'react';

export interface MidiDevice {
  id: string;
  name: string;
  manufacturer?: string;
}

export interface MidiMessage {
  command: number;
  note: number;
  velocity: number;
  channel: number;
  timestamp: number;
}

export function useMidi() {
  const [inputs, setInputs] = useState<MidiDevice[]>([]);
  const [outputs, setOutputs] = useState<MidiDevice[]>([]);
  const [selectedInputId, setSelectedInputId] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<MidiMessage | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [activeNotes, setActiveNotes] = useState<Map<number, number>>(new Map());

  // Use a ref to keep track of the latest selectedInputId inside the event listeners
  // This prevents needing to re-bind listeners every time the selection changes
  const selectedInputIdRef = useRef(selectedInputId);
  
  useEffect(() => {
    selectedInputIdRef.current = selectedInputId;
  }, [selectedInputId]);

  useEffect(() => {
    let midiAccess: WebMidi.MIDIAccess | null = null;

    const onMidiMessage = (event: WebMidi.MIDIMessageEvent) => {
      // If a specific input is selected, ignore messages from other inputs
      const inputId = (event.target as WebMidi.MIDIInput)?.id;
      if (selectedInputIdRef.current && inputId && inputId !== selectedInputIdRef.current) {
        return;
      }

      const [command, note, velocity] = event.data;
      const status = command & 0xf0;
      const channel = command & 0x0f;

      setLastMessage({
        command,
        note,
        velocity,
        channel,
        timestamp: event.timeStamp,
      });

      // Note On
      if (status === 0x90 && velocity > 0) {
        setActiveNotes(prev => {
          const next = new Map(prev);
          next.set(note, velocity / 127);
          return next;
        });
      }
      // Note Off
      else if (status === 0x80 || (status === 0x90 && velocity === 0)) {
        setActiveNotes(prev => {
          const next = new Map(prev);
          next.delete(note);
          return next;
        });
      }
      // All Notes Off (CC 123) or Reset All Controllers (CC 121)
      else if (status === 0xB0 && (note === 123 || note === 121)) {
        setActiveNotes(new Map());
      }
    };

    const updateDevices = (access: WebMidi.MIDIAccess) => {
      const inputList: MidiDevice[] = [];
      const outputList: MidiDevice[] = [];

      access.inputs.forEach((input) => {
        inputList.push({
          id: input.id,
          name: input.name || 'Unknown Device',
          manufacturer: input.manufacturer,
        });
      });

      access.outputs.forEach((output) => {
        outputList.push({
          id: output.id,
          name: output.name || 'Unknown Device',
          manufacturer: output.manufacturer,
        });
      });

      setInputs(inputList);
      setOutputs(outputList);

      // Auto-select first input if none selected, or if the currently selected one is disconnected
      if (inputList.length > 0) {
        if (!selectedInputIdRef.current || !inputList.find(i => i.id === selectedInputIdRef.current)) {
          setSelectedInputId(inputList[0].id);
        }
      } else {
        setSelectedInputId(null);
        setActiveNotes(new Map()); // Clear notes if all devices disconnected
      }
    };

    const bindListeners = (access: WebMidi.MIDIAccess) => {
      access.inputs.forEach((input) => {
        // Remove existing listener to avoid duplicates
        input.onmidimessage = null;
        // Attach new listener
        input.onmidimessage = onMidiMessage;
      });
    };

    const onStateChange = () => {
      if (midiAccess) {
        updateDevices(midiAccess);
        bindListeners(midiAccess);
      }
    };

    const initMidi = async () => {
      if (typeof navigator === 'undefined' || !navigator.requestMIDIAccess) {
        setIsSupported(false);
        return;
      }

      try {
        // Request MIDI access without sysex first, as it requires fewer permissions
        const access = await navigator.requestMIDIAccess({ sysex: false }) as unknown as WebMidi.MIDIAccess;
        midiAccess = access;
        setIsSupported(true);
        updateDevices(access);
        bindListeners(access);
        access.onstatechange = onStateChange;
      } catch (err) {
        console.error('MIDI access denied or failed', err);
        setIsSupported(false);
      }
    };

    initMidi();

    return () => {
      if (midiAccess) {
        midiAccess.onstatechange = null;
        midiAccess.inputs.forEach((input) => {
          input.onmidimessage = null;
        });
      }
    };
  }, []); // Empty dependency array, we use refs for dynamic values

  return {
    inputs,
    outputs,
    selectedInputId,
    setSelectedInputId,
    lastMessage,
    isSupported,
    activeNotes,
    setActiveNotes,
  };
}
