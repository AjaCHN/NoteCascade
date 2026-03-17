// app/hooks/use-midi.ts v2.0.1
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
  const [midiMapping, setMidiMapping] = useState<Record<number, number>>({});
  const [isMappingMode, setIsMappingMode] = useState<boolean>(false);
  const [mappingTarget, setMappingTarget] = useState<number | null>(null);
  const midiAccessRef = useRef<WebMidi.MIDIAccess | null>(null);

  const settingsRef = useRef({ 
    selectedInputId, midiChannel, velocityCurve, transpose,
    midiMapping, isMappingMode, mappingTarget
  });

  useEffect(() => {
    settingsRef.current = { 
      selectedInputId, midiChannel, velocityCurve, transpose,
      midiMapping, isMappingMode, mappingTarget
    };
  }, [selectedInputId, midiChannel, velocityCurve, transpose, midiMapping, isMappingMode, mappingTarget]);

  const onMidiMessage = useCallback((event: WebMidi.MIDIMessageEvent) => {
    const { 
      selectedInputId: currentInputId, 
      midiChannel: currentChannel, 
      velocityCurve: currentCurve, 
      transpose: currentTranspose,
      midiMapping: currentMapping, 
      isMappingMode: currentMappingMode, 
      mappingTarget: currentMappingTarget
    } = settingsRef.current;

    const inputId = (event.target as WebMidi.MIDIInput)?.id;
    if (currentInputId && currentInputId !== 'all' && inputId && inputId !== currentInputId) return;
    if (!event.data || event.data.length < 3) return;

    const [statusByte, data1, data2] = event.data;
    const command = statusByte & 0xf0;
    const channel = (statusByte & 0x0f) + 1;

    if (currentChannel !== 'all' && channel !== currentChannel) return;

    if (command === 0x90 || command === 0x80) {
      const rawNote = data1;
      let note = Math.max(0, Math.min(127, rawNote + currentTranspose));
      
      // Apply mapping if exists
      if (currentMapping[rawNote] !== undefined) {
        note = currentMapping[rawNote];
      }

      // Handle mapping mode
      if (currentMappingMode && currentMappingTarget !== null && command === 0x90 && data2 > 0) {
        setMidiMapping(prev => ({ ...prev, [rawNote]: currentMappingTarget }));
        setIsMappingMode(false);
        setMappingTarget(null);
        return;
      }

      let velocity = data2;

      if (command === 0x90 && velocity > 0) {
        velocity = Math.round(applyVelocityCurve(velocity, currentCurve));
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

  const scanBluetoothMidi = useCallback(async () => {
    if (typeof navigator === 'undefined' || !('bluetooth' in navigator)) {
      console.warn('Web Bluetooth is not supported in this browser.');
      return;
    }

    try {
      // @ts-expect-error - Web Bluetooth MIDI is experimental
      const device = await (navigator as unknown as { bluetooth: { requestDevice: (options: object) => Promise<BluetoothDevice> } }).bluetooth.requestDevice({
        filters: [{ services: ['03b80e5a-ede8-4b33-a751-6ce34ec4c700'] }]
      });
      
      if (device) {
        console.log('Bluetooth MIDI device selected:', device.name);
        // After pairing, Web MIDI API should pick it up. 
        // We trigger a refresh to be sure.
        setTimeout(() => connectMidi(), 2000);
      }
    } catch (error) {
      console.error('Bluetooth MIDI scan failed:', error);
    }
  }, [connectMidi]);

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
    activeNotes, setActiveNotes, connectMidi, scanBluetoothMidi,
    midiMapping, setMidiMapping, isMappingMode, setIsMappingMode,
    mappingTarget, setMappingTarget
  };
}
