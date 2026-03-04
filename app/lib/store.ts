// app/lib/store.ts v2.0.1
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { INITIAL_ACHIEVEMENTS } from './achievements-data';
import type { AppState, Achievement, ScoreRecord, Theme, Instrument, PlayMode } from './store/types';
import { checkAchievementsLogic } from './store/achievement-logic';

export type { Achievement, ScoreRecord, Theme, Instrument, PlayMode };

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
      songs: [],
      locale: 'en',
      theme: 'dark',
      instrument: 'piano',
      playMode: 'perform',
      keyboardRange: { start: 48, end: 84 },
      showNoteNames: true,
      showKeymap: true,
      isRangeManuallySet: false,
      metronomeEnabled: false,
      metronomeBpm: 120,
      metronomeBeats: 4,
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
          set((state) => ({ totalPracticeTime: state.totalPracticeTime + seconds }));
          if (get().totalPracticeTime % 60 === 0) get().actions.checkAchievements();
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
          const newAchievements = checkAchievementsLogic(state, state.songs);
          if (JSON.stringify(newAchievements) !== JSON.stringify(state.achievements)) {
            set({ achievements: newAchievements });
          }
        },
        setSongs: (songs) => set({ songs }),
        setLocale: (locale) => set({ locale }),
        setTheme: (theme) => set({ theme }),
        setInstrument: (instrument) => set({ instrument }),
        setPlayMode: (playMode) => set({ playMode }),
        setKeyboardRange: (start, end) => set({ keyboardRange: { start, end } }),
        setIsRangeManuallySet: (isRangeManuallySet) => set({ isRangeManuallySet }),
        setShowNoteNames: (showNoteNames) => set({ showNoteNames }),
        setShowKeymap: (showKeymap) => set({ showKeymap }),
        setMetronomeEnabled: (metronomeEnabled) => set({ metronomeEnabled }),
        setMetronomeBpm: (metronomeBpm) => set({ metronomeBpm }),
        setMetronomeBeats: (metronomeBeats) => set({ metronomeBeats }),
        resetProgress: () =>
          set({
            achievements: INITIAL_ACHIEVEMENTS, scores: [], totalPracticeTime: 0, dailyStreak: 0,
            lastPracticeDate: null, totalNotesHit: 0, songsCompleted: 0, locale: 'en',
            theme: 'dark', instrument: 'piano', playMode: 'perform',
            keyboardRange: { start: 48, end: 84 }, showNoteNames: true, showKeymap: true,
            isRangeManuallySet: false, metronomeEnabled: false, metronomeBpm: 120, metronomeBeats: 4,
          }),
      },
    }),
    {
      name: 'notecascade-storage',
      storage: createJSONStorage(() => typeof window !== 'undefined' ? window.localStorage : {
        getItem: () => null, setItem: () => {}, removeItem: () => {},
      } as unknown as Storage),
      partialize: (state) => ({
        achievements: state.achievements, scores: state.scores, totalPracticeTime: state.totalPracticeTime,
        dailyStreak: state.dailyStreak, lastPracticeDate: state.lastPracticeDate, totalNotesHit: state.totalNotesHit,
        songsCompleted: state.songsCompleted, locale: state.locale, theme: state.theme,
        keyboardRange: state.keyboardRange, isRangeManuallySet: state.isRangeManuallySet,
        showNoteNames: state.showNoteNames, showKeymap: state.showKeymap,
        metronomeEnabled: state.metronomeEnabled, metronomeBpm: state.metronomeBpm, metronomeBeats: state.metronomeBeats,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as AppState;
        const mergedAchievements = [...INITIAL_ACHIEVEMENTS];
        if (persisted && persisted.achievements) {
          persisted.achievements.forEach(pAch => {
            const index = mergedAchievements.findIndex(a => a.id === pAch.id);
            if (index !== -1) mergedAchievements[index] = { ...mergedAchievements[index], ...pAch };
          });
        }
        return { ...currentState, ...persisted, achievements: mergedAchievements };
      },
    }
  )
);

export const useAchievements = () => useAppStore((state) => state.achievements);
export const useScores = () => useAppStore((state) => state.scores);
export const useLocale = () => useAppStore((state) => state.locale);
export const useTheme = () => useAppStore((state) => state.theme);
export const useInstrument = () => useAppStore((state) => state.instrument);
export const usePlayMode = () => useAppStore((state) => state.playMode);
export const useKeyboardRange = () => useAppStore((state) => state.keyboardRange);
export const useShowNoteNames = () => useAppStore((state) => state.showNoteNames);
export const useShowKeymap = () => useAppStore((state) => state.showKeymap);
export const useIsRangeManuallySet = () => useAppStore((state) => state.isRangeManuallySet);
export const useMetronomeEnabled = () => useAppStore((state) => state.metronomeEnabled);
export const useMetronomeBpm = () => useAppStore((state) => state.metronomeBpm);
export const useMetronomeBeats = () => useAppStore((state) => state.metronomeBeats);
export const useAppActions = () => useAppStore((state) => state.actions);

