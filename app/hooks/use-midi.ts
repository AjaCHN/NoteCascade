// app/hooks/use-midi.ts v2.0.2
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import type { VelocityCurve } from '../lib/midi-utils';
import { useMidiMessage } from './use-midi-message';

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

export type { VelocityCurve };

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

  const onMidiMessage = useMidiMessage(settingsRef, setLastMessage, setActiveNotes);

  const updateDevices = useCallback((access: WebMidi.MIDIAccess) => {
    const inputList: MidiDevice[] = [];
    const outputList: MidiDevice[] = [];

    try {
      access.inputs.forEach(input => {
        inputList.push({ id: input.id, name: input.name || 'Unknown Input Device', manufacturer: input.manufacturer });
      });
      access.outputs.forEach(output => {
        outputList.push({ id: output.id, name: output.name || 'Unknown Output Device', manufacturer: output.manufacturer });
      });
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
    } catch (err) {
      console.error('MIDI access failed', err);
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
      await connectMidi(isMounted);
    };
    init();

    return () => {
      mounted = false;
      if (midiAccessRef.current) {
        midiAccessRef.current.onstatechange = null;
        midiAccessRef.current.inputs.forEach(input => {
          input.onmidimessage = null;
        });
      }
    };
  }, [connectMidi]);

  return {
    inputs, outputs, selectedInputId, setSelectedInputId, midiChannel, setMidiChannel,
    velocityCurve, setVelocityCurve, transpose, setTranspose, lastMessage,
    isSupported, isConnecting, activeNotes, setActiveNotes, connectMidi,
  };
}
