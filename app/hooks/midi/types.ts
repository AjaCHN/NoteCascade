// app/hooks/midi/types.ts v2.3.1
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
