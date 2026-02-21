import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
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
  date: number;
}

interface AppState {
  achievements: Achievement[];
  scores: ScoreRecord[];
  totalPracticeTime: number;
  unlockAchievement: (id: string) => void;
  addScore: (score: ScoreRecord) => void;
  addPracticeTime: (seconds: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      achievements: [
        { id: 'first_song', title: 'First Steps', description: 'Play your first song', icon: 'Music' },
        { id: 'perfect_10', title: 'Perfect 10', description: 'Get 10 Perfect notes in a row', icon: 'Star' },
        { id: 'practice_1h', title: 'Dedicated', description: 'Practice for 1 hour total', icon: 'Clock' },
        { id: 'score_90', title: 'Virtuoso', description: 'Score over 90% accuracy on any song', icon: 'Trophy' },
        { id: 'play_3_styles', title: 'Versatile', description: 'Play songs from 3 different styles', icon: 'Palette' },
      ],
      scores: [],
      totalPracticeTime: 0,
      unlockAchievement: (id) =>
        set((state) => {
          const achievement = state.achievements.find((a) => a.id === id);
          if (achievement && !achievement.unlockedAt) {
            return {
              achievements: state.achievements.map((a) =>
                a.id === id ? { ...a, unlockedAt: Date.now() } : a
              ),
            };
          }
          return state;
        }),
      addScore: (score) =>
        set((state) => ({
          scores: [...state.scores, score],
        })),
      addPracticeTime: (seconds) =>
        set((state) => ({
          totalPracticeTime: state.totalPracticeTime + seconds,
        })),
    }),
    {
      name: 'midiplay-storage',
    }
  )
);
