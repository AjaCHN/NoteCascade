// app/hooks/use-midi.ts v2.4.2
'use client';
import { useState, useEffect } from 'react';

export interface MidiDevice {
  id: string;
  name: string;
}

export interface MidiMessage {
  command: number;
  channel: number;
  note: number;
  velocity: number;
  timestamp: number;
}

export function useMidi() {
  const [inputs, setInputs] = useState<MidiDevice[]>([]);
  const [selectedInputId, setSelectedInputId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeNotes, setActiveNotes] = useState<Map<number, number>>(new Map());
  const [lastMessage, setLastMessage] = useState<MidiMessage | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [midiChannel, setMidiChannel] = useState(0);
  const [velocityCurve, setVelocityCurve] = useState(1);
  const [transpose, setTranspose] = useState(0);

  const connectMidi = async () => {
    setIsConnecting(true);
    try {
      const access = await navigator.requestMIDIAccess();
      const midiInputs = Array.from(access.inputs.values()).map(input => ({
        id: input.id,
        name: input.name || 'Unknown Device'
      }));
      setInputs(midiInputs);
      if (midiInputs.length > 0) setSelectedInputId(midiInputs[0].id);
    } catch (err) {
      console.error('MIDI Access Denied', err);
      setIsSupported(false);
    } finally {
      setIsConnecting(false);
    }
  };

  return { 
    inputs, 
    selectedInputId, 
    setSelectedInputId,
    isConnecting, 
    connectMidi,
    activeNotes,
    setActiveNotes,
    lastMessage,
    isSupported,
    midiChannel,
    setMidiChannel,
    velocityCurve,
    setVelocityCurve,
    transpose,
    setTranspose
  };
}
