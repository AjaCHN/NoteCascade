/**
 * @file hooks/use-midi.ts
 * @version v1.3.0
 */
import { useEffect, useState, useRef, useCallback } from 'react';

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

export type VelocityCurve = 'linear' | 'log' | 'exp' | 'fixed';

export function useMidi() {
  const [inputs, setInputs] = useState<MidiDevice[]>([]);
  const [outputs, setOutputs] = useState<MidiDevice[]>([]);
  const [selectedInputId, setSelectedInputId] = useState<string | null>(null);
  const [midiChannel, setMidiChannel] = useState<number | 'all'>('all');
  const [velocityCurve, setVelocityCurve] = useState<VelocityCurve>('linear');
  const [transpose, setTranspose] = useState<number>(0);
  const [lastMessage, setLastMessage] = useState<MidiMessage | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [activeNotes, setActiveNotes] = useState<Map<number, number>>(new Map());

  // Use refs to keep track of latest settings inside event listeners
  const settingsRef = useRef({
    selectedInputId,
    midiChannel,
    velocityCurve,
    transpose
  });

  useEffect(() => {
    settingsRef.current = {
      selectedInputId,
      midiChannel,
      velocityCurve,
      transpose
    };
  }, [selectedInputId, midiChannel, velocityCurve, transpose]);

  const applyVelocityCurve = useCallback((velocity: number, curve: VelocityCurve): number => {
    const norm = velocity / 127;
    switch (curve) {
      case 'log':
        return Math.pow(norm, 0.5) * 127; // More sensitive
      case 'exp':
        return Math.pow(norm, 2) * 127; // Less sensitive (requires harder hit)
      case 'fixed':
        return 100; // Fixed velocity
      case 'linear':
      default:
        return velocity;
    }
  }, []);

  useEffect(() => {
    let midiAccess: WebMidi.MIDIAccess | null = null;

    const onMidiMessage = (event: WebMidi.MIDIMessageEvent) => {
      const { selectedInputId, midiChannel, velocityCurve, transpose } = settingsRef.current;

      // Filter by Input Device
      const inputId = (event.target as WebMidi.MIDIInput)?.id;
      if (selectedInputId && inputId && inputId !== selectedInputId) {
        return;
      }

      const [statusByte, data1, data2] = event.data;
      const command = statusByte & 0xf0;
      const channel = (statusByte & 0x0f) + 1; // 1-16

      // Filter by Channel
      if (midiChannel !== 'all' && channel !== midiChannel) {
        return;
      }

      // Handle Note On/Off
      if (command === 0x90 || command === 0x80) {
        let note = data1;
        let velocity = data2;

        // Apply Transpose
        note = Math.max(0, Math.min(127, note + transpose));

        // Apply Velocity Curve
        if (command === 0x90 && velocity > 0) {
          velocity = Math.round(applyVelocityCurve(velocity, velocityCurve));
        }

        setLastMessage({
          command,
          note,
          velocity,
          channel,
          timestamp: event.timeStamp,
        });

        // Note On (Velocity > 0)
        if (command === 0x90 && velocity > 0) {
          setActiveNotes(prev => {
            const next = new Map(prev);
            next.set(note, velocity / 127);
            return next;
          });
        }
        // Note Off (Velocity 0 or Note Off command)
        else {
          setActiveNotes(prev => {
            const next = new Map(prev);
            next.delete(note);
            return next;
          });
        }
      }
      // All Notes Off (CC 123) or Reset All Controllers (CC 121)
      else if (command === 0xB0 && (data1 === 123 || data1 === 121)) {
        setActiveNotes(new Map());
      }
    };

    const updateDevices = (access: WebMidi.MIDIAccess) => {
      const inputList: MidiDevice[] = [];
      const outputList: MidiDevice[] = [];
      const seenInputIds = new Set<string>();
      const seenOutputIds = new Set<string>();

      access.inputs.forEach((input) => {
        if (!seenInputIds.has(input.id)) {
          inputList.push({
            id: input.id,
            name: input.name || 'Unknown Device',
            manufacturer: input.manufacturer,
          });
          seenInputIds.add(input.id);
        }
      });

      access.outputs.forEach((output) => {
        if (!seenOutputIds.has(output.id)) {
          outputList.push({
            id: output.id,
            name: output.name || 'Unknown Device',
            manufacturer: output.manufacturer,
          });
          seenOutputIds.add(output.id);
        }
      });

      setInputs(inputList);
      setOutputs(outputList);

      // Auto-select logic
      if (inputList.length > 0) {
        // If nothing selected, or selected is gone, pick first
        if (!settingsRef.current.selectedInputId || !inputList.find(i => i.id === settingsRef.current.selectedInputId)) {
          setSelectedInputId(inputList[0].id);
        }
      } else {
        setSelectedInputId(null);
      }
    };

    const bindListeners = (access: WebMidi.MIDIAccess) => {
      access.inputs.forEach((input) => {
        input.onmidimessage = onMidiMessage;
      });
    };

    const onStateChange = (e: WebMidi.MIDIConnectionEvent) => {
      if (midiAccess) {
        updateDevices(midiAccess);
        // Re-bind listener for the specific port that changed
        if (e.port.type === 'input') {
           (e.port as WebMidi.MIDIInput).onmidimessage = onMidiMessage;
        }
      }
    };

    const initMidi = async () => {
      if (typeof navigator === 'undefined' || !navigator.requestMIDIAccess) {
        setIsSupported(false);
        return;
      }

      try {
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
  }, [applyVelocityCurve]); // Added applyVelocityCurve to dependencies

  return {
    inputs,
    outputs,
    selectedInputId,
    setSelectedInputId,
    midiChannel,
    setMidiChannel,
    velocityCurve,
    setVelocityCurve,
    transpose,
    setTranspose,
    lastMessage,
    isSupported,
    activeNotes,
    setActiveNotes,
  };
}
