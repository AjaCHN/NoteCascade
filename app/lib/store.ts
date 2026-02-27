import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Locale } from './translations';
import { builtInSongs, Song } from './songs';

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

interface AppState {
  achievements: Achievement[];
  scores: ScoreRecord[];
  totalPracticeTime: number; // in seconds
  dailyStreak: number;
  lastPracticeDate: string | null; // YYYY-MM-DD
  totalNotesHit: number;
  songsCompleted: number;
  locale: Locale;
  theme: Theme;
  keyboardRange: { start: number; end: number };
  showNoteNames: boolean;
  showKeymap: boolean;
  actions: {
    unlockAchievement: (id: string) => void;
    addScore: (score: ScoreRecord) => void;
    incrementPracticeTime: (seconds: number) => void;
    setLocale: (locale: Locale) => void;
    setTheme: (theme: Theme) => void;
    setKeyboardRange: (start: number, end: number) => void;
    setShowNoteNames: (show: boolean) => void;
    setShowKeymap: (show: boolean) => void;
    resetProgress: () => void;
    checkAchievements: () => void;
    updateStreak: () => void;
  };
}

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_song', title: 'First Steps', description: 'Play your first song', icon: 'Music', category: 'collection' },
  { id: 'perfect_10', title: 'Perfect 10', description: 'Get 10 Perfect notes in a row', icon: 'Star', category: 'skill' },
  { id: 'practice_1h', title: 'Dedicated', description: 'Practice for 1 hour total', icon: 'Clock', maxProgress: 3600, category: 'practice' },
  { id: 'score_90', title: 'Virtuoso', description: 'Score over 90% accuracy on any song', icon: 'Trophy', category: 'skill' },
  { id: 'play_3_styles', title: 'Versatile', description: 'Play songs from 3 different styles', icon: 'Palette', maxProgress: 3, category: 'collection' },
  { id: 'streak_3', title: 'Streak Master', description: 'Practice for 3 days in a row', icon: 'Flame', maxProgress: 3, category: 'practice' },
  { id: 'notes_1000', title: 'Keyboard Warrior', description: 'Hit 1000 notes total', icon: 'Zap', maxProgress: 1000, category: 'skill' },
  { id: 'full_combo', title: 'Perfectionist', description: 'Get a Full Combo on any song', icon: 'Crown', category: 'skill' },
  { id: 'early_bird', title: 'Early Bird', description: 'Practice before 8 AM', icon: 'Sun', category: 'practice' },
  { id: 'night_owl', title: 'Night Owl', description: 'Practice after 10 PM', icon: 'Moon', category: 'practice' },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      achievements: INITIAL_ACHIEVEMENTS,
      scores: [],
      totalPracticeTime: 0,
      dailyStreak: 0,
      lastPracticeDate: null,
      totalNotesHit: 0,
      songsCompleted: 0,
      locale: 'en',
      theme: 'dark',
      keyboardRange: { start: 48, end: 84 },
      showNoteNames: true,
      showKeymap: true,
      actions: {
        unlockAchievement: (id) =>
          set((state) => {
            const achievement = state.achievements.find((a) => a.id === id);
            if (achievement && !achievement.unlockedAt) {
              return {
                achievements: state.achievements.map((a) =>
                  a.id === id ? { ...a, unlockedAt: Date.now(), progress: a.maxProgress } : a
                ),
              };
            }
            return state;
          }),
        addScore: (score) => {
          set((state) => ({
            scores: [score, ...state.scores].slice(0, 100),
            totalNotesHit: state.totalNotesHit + score.perfect + score.good,
            songsCompleted: state.songsCompleted + 1,
          }));
          get().actions.updateStreak();
          get().actions.checkAchievements();
        },
        incrementPracticeTime: (seconds) => {
          set((state) => ({
            totalPracticeTime: state.totalPracticeTime + seconds,
          }));
          // Check time-based achievements periodically
          if (get().totalPracticeTime % 60 === 0) {
             get().actions.checkAchievements();
          }
        },
        updateStreak: () => {
          const today = new Date().toISOString().split('T')[0];
          const state = get();
          
          if (state.lastPracticeDate === today) return;

          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          
          if (state.lastPracticeDate === yesterday) {
            set({ dailyStreak: state.dailyStreak + 1, lastPracticeDate: today });
          } else {
            set({ dailyStreak: 1, lastPracticeDate: today });
          }
        },
        checkAchievements: () => {
          const state = get();
          const { scores, totalPracticeTime, dailyStreak, totalNotesHit, achievements } = state;
          const lastScore = scores[0]; // Most recent score

          const newAchievements = achievements.map(ach => {
            if (ach.unlockedAt) return ach;

            let unlocked = false;
            let progress = ach.progress || 0;

            switch (ach.id) {
              case 'first_song':
                if (scores.length > 0) unlocked = true;
                break;
              case 'perfect_10':
                if (lastScore && lastScore.perfect >= 10) unlocked = true; // Simplified check, ideally needs consecutive tracking in game
                break;
              case 'practice_1h':
                progress = totalPracticeTime;
                if (totalPracticeTime >= 3600) unlocked = true;
                break;
              case 'score_90':
                if (lastScore && lastScore.accuracy >= 0.9) unlocked = true;
                break;
              case 'play_3_styles':
                const styles = new Set(scores.map(s => {
                  const song = builtInSongs.find(song => song.id === s.songId);
                  return song?.style;
                }).filter(Boolean));
                progress = styles.size;
                if (styles.size >= 3) unlocked = true;
                break;
              case 'streak_3':
                progress = dailyStreak;
                if (dailyStreak >= 3) unlocked = true;
                break;
              case 'notes_1000':
                progress = totalNotesHit;
                if (totalNotesHit >= 1000) unlocked = true;
                break;
              case 'full_combo':
                if (lastScore && lastScore.miss === 0 && lastScore.wrong === 0) unlocked = true;
                break;
              case 'early_bird':
                const hour = new Date().getHours();
                if (hour < 8 && lastScore) unlocked = true;
                break;
              case 'night_owl':
                const hourOwl = new Date().getHours();
                if (hourOwl >= 22 && lastScore) unlocked = true;
                break;
            }

            if (unlocked) {
              return { ...ach, unlockedAt: Date.now(), progress: ach.maxProgress || progress };
            }
            return { ...ach, progress };
          });

          // Only update if changes
          if (JSON.stringify(newAchievements) !== JSON.stringify(achievements)) {
            set({ achievements: newAchievements });
          }
        },
        setLocale: (locale) => set({ locale }),
        setTheme: (theme) => set({ theme }),
        setKeyboardRange: (start, end) => set({ keyboardRange: { start, end } }),
        setShowNoteNames: (showNoteNames) => set({ showNoteNames }),
        setShowKeymap: (showKeymap) => set({ showKeymap }),
        resetProgress: () =>
          set({
            achievements: INITIAL_ACHIEVEMENTS,
            scores: [],
            totalPracticeTime: 0,
            dailyStreak: 0,
            lastPracticeDate: null,
            totalNotesHit: 0,
            songsCompleted: 0,
            locale: 'en',
            theme: 'dark',
            keyboardRange: { start: 48, end: 84 },
            showNoteNames: true,
            showKeymap: true,
          }),
      },
    }),
    {
      name: 'notecascade-storage',
      storage: createJSONStorage(() => typeof window !== 'undefined' ? window.localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      } as unknown as Storage),
      partialize: (state) => ({
        achievements: state.achievements,
        scores: state.scores,
        totalPracticeTime: state.totalPracticeTime,
        dailyStreak: state.dailyStreak,
        lastPracticeDate: state.lastPracticeDate,
        totalNotesHit: state.totalNotesHit,
        songsCompleted: state.songsCompleted,
        locale: state.locale,
        theme: state.theme,
        keyboardRange: state.keyboardRange,
        showNoteNames: state.showNoteNames,
        showKeymap: state.showKeymap,
      }),
      merge: (persistedState, currentState) => {
        // Merge logic to ensure new achievements are added to persisted state
        const persisted = persistedState as AppState;
        const mergedAchievements = [...INITIAL_ACHIEVEMENTS];
        
        if (persisted && persisted.achievements) {
          persisted.achievements.forEach(pAch => {
            const index = mergedAchievements.findIndex(a => a.id === pAch.id);
            if (index !== -1) {
              mergedAchievements[index] = { ...mergedAchievements[index], ...pAch };
            }
          });
        }
        
        return {
          ...currentState,
          ...persisted,
          achievements: mergedAchievements,
        };
      },
    }
  )
);

// Helper hooks for easier access
export const useAchievements = () => useAppStore((state) => state.achievements);
export const useScores = () => useAppStore((state) => state.scores);
export const useLocale = () => useAppStore((state) => state.locale);
export const useTheme = () => useAppStore((state) => state.theme);
export const useKeyboardRange = () => useAppStore((state) => state.keyboardRange);
export const useShowNoteNames = () => useAppStore((state) => state.showNoteNames);
export const useShowKeymap = () => useAppStore((state) => state.showKeymap);
export const useAppActions = () => useAppStore((state) => state.actions);

export function getNextSong(currentSong: Song): Song {
  const currentIndex = builtInSongs.findIndex(s => s.id === currentSong.id);
  if (currentIndex === -1) {
    return builtInSongs[0];
  }
  const nextIndex = (currentIndex + 1) % builtInSongs.length;
  return builtInSongs[nextIndex];
}
