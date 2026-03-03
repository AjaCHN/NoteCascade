// app/lib/songs/types.ts v1.0.0
export interface Note {
  midi: number;
  time: number;
  duration: number;
  velocity: number;
}

export interface UnlockCondition {
  type: 'achievement' | 'score' | 'level';
  value: string | number;
  description: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  difficulty: number;
  midiUrl: string;
  style?: string;
  duration?: number;
  notes?: Note[];
  unlockCondition?: UnlockCondition;
}
