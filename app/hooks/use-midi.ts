// app/hooks/use-midi.ts v2.0.0
import { useEffect, useState, useRef, useCallback } from 'react';
import { setPitchBend, setModulation, setExpression, setSustainPedal } from '../lib/audio';
import { MidiDevice, MidiMessage, VelocityCurve } from './midi/types';
import { applyVelocityCurve } from './midi/utils';

export type { MidiDevice, MidiMessage, VelocityCurve };

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

  const settingsRef = useRef({ selectedInputId, midiChannel, velocityCurve, transpose });
  useEffect(() => {
    settingsRef.current = { selectedInputId, midiChannel, velocityCurve, transpose };
  }, [selectedInputId, midiChannel, velocityCurve, transpose]);

  const onMidiMessage = useCallback((event: WebMidi.MIDIMessageEvent) => {
    const { selectedInputId, midiChannel, velocityCurve, transpose } = settingsRef.current;
    const inputId = (event.target as WebMidi.MIDIInput)?.id;
    if (selectedInputId && selectedInputId !== 'all' && inputId && inputId !== selectedInputId) return;
    if (!event.data || event.data.length < 3) return;

    const [statusByte, data1, data2] = event.data;
    const command = statusByte & 0xf0;
    const channel = (statusByte & 0x0f) + 1;

    if (midiChannel !== 'all' && channel !== midiChannel) return;

    if (command === 0x90 || command === 0x80) {
      const note = Math.max(0, Math.min(127, data1 + transpose));
      let velocity = data2;

      if (command === 0x90 && velocity > 0) {
        velocity = Math.round(applyVelocityCurve(velocity, velocityCurve));
      }

      setLastMessage({ command, note, velocity, channel, timestamp: event.timeStamp });

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
      setPitchBend((data2 << 7 | data1) / 16383);
    } else if (command === 0xB0) {
      if (data1 === 1) setModulation(data2 / 127);
      else if (data1 === 7 || data1 === 11) setExpression(data2 / 127);
      else if (data1 === 64) setSustainPedal(data2 >= 64);
      else if (data1 === 123 || data1 === 121) setActiveNotes(new Map());
    }
  }, []);

  const updateDevices = useCallback((access: WebMidi.MIDIAccess) => {
    const inputList: MidiDevice[] = Array.from(access.inputs.values()).map(i => ({
      id: i.id, name: i.name || 'Unknown Input', manufacturer: i.manufacturer
    }));
    const outputList: MidiDevice[] = Array.from(access.outputs.values()).map(o => ({
      id: o.id, name: o.name || 'Unknown Output', manufacturer: o.manufacturer
    }));

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
      if (midiAccessRef.current) updateDevices(midiAccessRef.current);
      let access: WebMidi.MIDIAccess;
      try {
        access = await navigator.requestMIDIAccess({ sysex: true }) as unknown as WebMidi.MIDIAccess;
      } catch {
        access = await navigator.requestMIDIAccess({ sysex: false }) as unknown as WebMidi.MIDIAccess;
      }

      if (!isMounted()) return false;
      midiAccessRef.current = access;
      setIsSupported(true);
      updateDevices(access);
      
      const attachListeners = () => {
        access.inputs.forEach(input => {
          input.onmidimessage = onMidiMessage;
        });
      };
      attachListeners();

      access.onstatechange = () => {
        if (isMounted()) {
          updateDevices(access);
          attachListeners();
        }
      };
      
      if (isMounted()) setIsConnecting(false);
      return true;
    } catch {
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
    setTimeout(() => connectMidi(isMounted), 0);

    return () => {
      mounted = false;
      if (midiAccessRef.current) {
        midiAccessRef.current.onstatechange = null;
        midiAccessRef.current.inputs.forEach(input => { input.onmidimessage = null; });
      }
    };
  }, [connectMidi]);

  return {
    inputs, outputs, selectedInputId, setSelectedInputId,
    midiChannel, setMidiChannel, velocityCurve, setVelocityCurve,
    transpose, setTranspose, lastMessage, isSupported, isConnecting,
    activeNotes, setActiveNotes, connectMidi,
  };
}
