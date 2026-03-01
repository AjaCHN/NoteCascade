// app/hooks/use-midi.ts v1.4.11
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
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
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
        return Math.pow(norm, 0.5) * 127;
      case 'exp':
        return Math.pow(norm, 2) * 127;
      case 'fixed':
        return 100;
      case 'linear':
      default:
        return velocity;
    }
  }, []);

  const onMidiMessage = useCallback((event: WebMidi.MIDIMessageEvent) => {
    const { selectedInputId, midiChannel, velocityCurve, transpose } = settingsRef.current;

    const inputId = (event.target as WebMidi.MIDIInput)?.id;
    if (selectedInputId && selectedInputId !== 'all' && inputId && inputId !== selectedInputId) {
      return;
    }

    if (!event.data || event.data.length < 3) return;

    const [statusByte, data1, data2] = event.data;
    const command = statusByte & 0xf0;
    const channel = (statusByte & 0x0f) + 1;

    if (midiChannel !== 'all' && channel !== midiChannel) {
      return;
    }

    if (command === 0x90 || command === 0x80) {
      let note = data1;
      let velocity = data2;

      note = Math.max(0, Math.min(127, note + transpose));

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

      if (command === 0x90 && velocity > 0) {
        setActiveNotes(prev => {
          const next = new Map(prev);
          next.set(note, velocity / 127);
          return next;
        });
      }
      else {
        setActiveNotes(prev => {
          const next = new Map(prev);
          next.delete(note);
          return next;
        });
      }
    }
    else if (command === 0xB0 && (data1 === 123 || data1 === 121)) {
      setActiveNotes(new Map());
    }
    else if (command === 0xB0 && data1 === 64) {
      import('../lib/audio').then(audio => {
        audio.setSustainPedal(data2 >= 64);
      });
    }
  }, [applyVelocityCurve]);

  const updateDevices = useCallback((access: WebMidi.MIDIAccess) => {
    const inputList: MidiDevice[] = [];
    const outputList: MidiDevice[] = [];

    try {
      const inputsIter = access.inputs.values();
      for (let input = inputsIter.next(); !input.done; input = inputsIter.next()) {
        inputList.push({
          id: input.value.id,
          name: input.value.name || 'Unknown Input Device',
          manufacturer: input.value.manufacturer,
        });
      }

      const outputsIter = access.outputs.values();
      for (let output = outputsIter.next(); !output.done; output = outputsIter.next()) {
        outputList.push({
          id: output.value.id,
          name: output.value.name || 'Unknown Output Device',
          manufacturer: output.value.manufacturer,
        });
      }
    } catch (e) {
      console.error('Error enumerating MIDI devices:', e);
    }

    setInputs(inputList);
    setOutputs(outputList);

    if (inputList.length > 0) {
      if (!settingsRef.current.selectedInputId || 
          (settingsRef.current.selectedInputId !== 'all' && !inputList.find(i => i.id === settingsRef.current.selectedInputId))) {
        setSelectedInputId('all');
      }
    } else {
      setSelectedInputId(null);
    }
  }, []);

  const connectMidi = useCallback(async (isMounted: () => boolean = () => true) => {
    if (typeof navigator === 'undefined' || !navigator.requestMIDIAccess) {
      if (isMounted()) setIsSupported(false);
      return false;
    }

    if (isMounted()) setIsConnecting(true);

    try {
      // If we already have access, try to refresh it first
      if (midiAccessRef.current) {
        updateDevices(midiAccessRef.current);
      }

      let access: WebMidi.MIDIAccess;
      try {
        // Requesting access again is the only way to trigger the browser prompt if it was dismissed
        access = await navigator.requestMIDIAccess({ sysex: true }) as unknown as WebMidi.MIDIAccess;
      } catch (e) {
        console.warn('MIDI access with sysex failed, trying without', e);
        access = await navigator.requestMIDIAccess({ sysex: false }) as unknown as WebMidi.MIDIAccess;
      }

      if (!isMounted()) return false;
      
      midiAccessRef.current = access;
      setIsSupported(true);
      updateDevices(access);
      
      const attachListeners = () => {
        try {
          const inputsIter = access.inputs.values();
          for (let input = inputsIter.next(); !input.done; input = inputsIter.next()) {
            // Remove old listener if any to avoid duplicates
            input.value.onmidimessage = null;
            input.value.onmidimessage = onMidiMessage;
          }
        } catch (e) {
          console.error('Error attaching MIDI listeners:', e);
        }
      };

      attachListeners();

      access.onstatechange = (e: WebMidi.MIDIConnectionEvent) => {
        console.log('MIDI state change:', e.port.name, e.port.state);
        if (isMounted()) {
          updateDevices(access);
          attachListeners();
        }
      };
      
      if (isMounted()) setIsConnecting(false);
      return true;
    } catch (err) {
      console.error('MIDI access completely denied or failed', err);
      if (isMounted()) {
        setIsSupported(false);
        setIsConnecting(false);
      }
      return false;
    }
  }, [onMidiMessage, updateDevices]);

  useEffect(() => {
    let mounted = true;
    const isMounted = () => mounted;
    
    const init = async () => {
      // On initial load, we call it. If it fails due to no gesture, isSupported becomes false.
      // This is expected. The user can then click the "Connect" button.
      await connectMidi(isMounted);
    };
    
    init();

    return () => {
      mounted = false;
      if (midiAccessRef.current) {
        midiAccessRef.current.onstatechange = null;
        try {
          const inputsIter = midiAccessRef.current.inputs.values();
          for (let input = inputsIter.next(); !input.done; input = inputsIter.next()) {
            input.value.onmidimessage = null;
          }
        } catch (_) {
          // Ignore
        }
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
    isConnecting,
    activeNotes,
    setActiveNotes,
    connectMidi,
  };
}
