// app/lib/store/types.ts v1.0.0
import { Locale } from '../translations';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
  category?: 'practice' | 'skill' | 'collection';
}

export interface ScoreRecord {
  songId: string;
  score: number;
  maxScore: number;
  accuracy: number;
  perfect: number;
  good: number;
  miss: number;
  wrong: number;
  maxCombo: number;
  date: number;
}

export type Theme = 'dark' | 'light' | 'cyber' | 'classic';
export type Instrument = 'piano' | 'synth' | 'epiano' | 'strings';
export type PlayMode = 'perform' | 'demo' | 'practice' | 'free';

export interface AppState {
  achievements: Achievement[];
  scores: ScoreRecord[];
  totalPracticeTime: number;
  dailyStreak: number;
  lastPracticeDate: string | null;
  totalNotesHit: number;
  songsCompleted: number;
  locale: Locale;
  theme: Theme;
  instrument: Instrument;
  playMode: PlayMode;
  keyboardRange: { start: number; end: number };
  showNoteNames: boolean;
  showKeymap: boolean;
  isRangeManuallySet: boolean;
  metronomeEnabled: boolean;
  metronomeBpm: number;
  metronomeBeats: number;
  actions: {
    unlockAchievement: (id: string) => void;
    addScore: (score: ScoreRecord) => void;
    incrementPracticeTime: (seconds: number) => void;
    setLocale: (locale: Locale) => void;
    setTheme: (theme: Theme) => void;
    setInstrument: (instrument: Instrument) => void;
    setPlayMode: (mode: PlayMode) => void;
    setKeyboardRange: (start: number, end: number) => void;
    setIsRangeManuallySet: (isSet: boolean) => void;
    setShowNoteNames: (show: boolean) => void;
    setShowKeymap: (show: boolean) => void;
    setMetronomeEnabled: (enabled: boolean) => void;
    setMetronomeBpm: (bpm: number) => void;
    setMetronomeBeats: (beats: number) => void;
    resetProgress: () => void;
    checkAchievements: () => void;
    updateStreak: () => void;
  };
}
