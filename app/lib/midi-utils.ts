// app/lib/midi-utils.ts v1.0.0
export type VelocityCurve = 'linear' | 'log' | 'exp' | 'fixed';

export function applyVelocityCurve(velocity: number, curve: VelocityCurve): number {
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
}

export function parseMidiMessage(event: WebMidi.MIDIMessageEvent) {
  if (!event.data || event.data.length < 3) return null;

  const [statusByte, data1, data2] = event.data;
  const command = statusByte & 0xf0;
  const channel = (statusByte & 0x0f) + 1;
  const note = data1;
  const velocity = data2;

  return { command, channel, note, velocity, timestamp: event.timeStamp };
}
