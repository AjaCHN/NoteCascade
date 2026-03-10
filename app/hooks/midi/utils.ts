// app/hooks/midi/utils.ts v1.0.0
import { VelocityCurve } from './types';

export const applyVelocityCurve = (velocity: number, curve: VelocityCurve): number => {
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
};
