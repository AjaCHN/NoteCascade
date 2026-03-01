// app/hooks/use-midi.ts v1.3.5
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
  const midiAccessRef = useRef<WebMidi.MIDIAccess | null>(null);

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

  const onMidiMessage = useCallback((event: WebMidi.MIDIMessageEvent) => {
    const { selectedInputId, midiChannel, velocityCurve, transpose } = settingsRef.current;

    // Filter by Input Device
    const inputId = (event.target as WebMidi.MIDIInput)?.id;
    if (selectedInputId && selectedInputId !== 'all' && inputId && inputId !== selectedInputId) {
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
    // Sustain Pedal (CC 64)
    else if (command === 0xB0 && data1 === 64) {
      import('../lib/audio').then(audio => {
        audio.setSustainPedal(data2 >= 64);
      });
    }
  }, [applyVelocityCurve]);

  const updateDevices = useCallback((access: WebMidi.MIDIAccess) => {
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
      // If nothing selected, or selected is gone, default to 'all'
      if (!settingsRef.current.selectedInputId || (settingsRef.current.selectedInputId !== 'all' && !inputList.find(i => i.id === settingsRef.current.selectedInputId))) {
        setSelectedInputId('all');
      }
    } else {
      setSelectedInputId(null);
    }
  }, []);

// app/hooks/use-midi.ts v1.3.9
// ... existing code ...
  const connectMidi = useCallback(async (isMounted: () => boolean = () => true) => {
    if (typeof navigator === 'undefined' || !navigator.requestMIDIAccess) {
      if (isMounted()) setIsSupported(false);
      return false;
    }

    try {
      // Try with sysex: true first, then fallback to false if it fails
      let access: WebMidi.MIDIAccess;
      try {
        access = await navigator.requestMIDIAccess({ sysex: true }) as unknown as WebMidi.MIDIAccess;
      } catch (e) {
        console.warn('Sysex MIDI access denied, trying without sysex');
        access = await navigator.requestMIDIAccess({ sysex: false }) as unknown as WebMidi.MIDIAccess;
      }

      if (!isMounted()) return false;
      
      midiAccessRef.current = access;
      setIsSupported(true);
      updateDevices(access);
      
      // Clear existing listeners first
      access.inputs.forEach((input) => {
        input.onmidimessage = null;
        input.onmidimessage = onMidiMessage;
      });

      access.onstatechange = (e: WebMidi.MIDIConnectionEvent) => {
        updateDevices(access);
        if (e.port.type === 'input') {
           const input = e.port as WebMidi.MIDIInput;
           input.onmidimessage = null;
           input.onmidimessage = onMidiMessage;
        }
      };
      return true;
    } catch (err) {
      console.error('MIDI access denied or failed', err);
      if (isMounted()) setIsSupported(false);
      return false;
    }
  }, [onMidiMessage, updateDevices]);
// ... existing code ...

  useEffect(() => {
    let mounted = true;
    const isMounted = () => mounted;
    
    const init = async () => {
      await connectMidi(isMounted);
    };
    
    init();

    return () => {
      mounted = false;
      if (midiAccessRef.current) {
        midiAccessRef.current.onstatechange = null;
        midiAccessRef.current.inputs.forEach((input) => {
          input.onmidimessage = null;
        });
      }
    };
  }, [connectMidi]);

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
    connectMidi,
  };
}
