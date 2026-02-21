import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  totalPracticeTime: number; // in seconds
  actions: {
    unlockAchievement: (id: string) => void;
    addScore: (score: ScoreRecord) => void;
    incrementPracticeTime: (seconds: number) => void;
    resetProgress: () => void;
  };
}

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_song', title: 'First Steps', description: 'Play your first song', icon: 'Music' },
  { id: 'perfect_10', title: 'Perfect 10', description: 'Get 10 Perfect notes in a row', icon: 'Star' },
  { id: 'practice_1h', title: 'Dedicated', description: 'Practice for 1 hour total', icon: 'Clock' },
  { id: 'score_90', title: 'Virtuoso', description: 'Score over 90% accuracy on any song', icon: 'Trophy' },
  { id: 'play_3_styles', title: 'Versatile', description: 'Play songs from 3 different styles', icon: 'Palette' },
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      achievements: INITIAL_ACHIEVEMENTS,
      scores: [],
      totalPracticeTime: 0,
      actions: {
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
            scores: [score, ...state.scores].slice(0, 100), // Keep last 100 scores
          })),
        incrementPracticeTime: (seconds) =>
          set((state) => ({
            totalPracticeTime: state.totalPracticeTime + seconds,
          })),
        resetProgress: () =>
          set({
            achievements: INITIAL_ACHIEVEMENTS,
            scores: [],
            totalPracticeTime: 0,
          }),
      },
    }),
    {
      name: 'notecascade-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        achievements: state.achievements,
        scores: state.scores,
        totalPracticeTime: state.totalPracticeTime,
      }),
    }
  )
);

// Helper hooks for easier access
export const useAchievements = () => useAppStore((state) => state.achievements);
export const useScores = () => useAppStore((state) => state.scores);
export const useAppActions = () => useAppStore((state) => state.actions);
