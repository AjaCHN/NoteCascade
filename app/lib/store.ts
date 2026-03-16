// app/lib/store.ts v2.3.1
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { AppState, PlayMode, Theme, Instrument, Achievement, ScoreRecord } from './store/types';
import { INITIAL_ACHIEVEMENTS } from './achievements-data';
import { createActions } from './store/actions';
import { builtInSongs, Song } from './songs';

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
      localeSetByUser: false,
      theme: 'dark',
      instrument: 'piano',
      playMode: 'practice',
      keyboardRange: { start: 48, end: 84 },
      showNoteNames: true,
      showKeymap: true,
      metronomeEnabled: false,
      metronomeBpm: 120,
      metronomeBeats: 4,
      unlockedDifficulty: 1,
      actions: createActions(set, get),
    }),
    {
      name: 'notecascade-storage',
      storage: createJSONStorage(() => ({
        getItem: (name: string): string | null => Cookies.get(name) || null,
        setItem: (name: string, value: string): void => { Cookies.set(name, value, { expires: 365 }); },
        removeItem: (name: string): void => { Cookies.remove(name); },
      }) as unknown as Storage),
      partialize: (state) => ({
        achievements: state.achievements,
        scores: state.scores,
        totalPracticeTime: state.totalPracticeTime,
        dailyStreak: state.dailyStreak,
        lastPracticeDate: state.lastPracticeDate,
        totalNotesHit: state.totalNotesHit,
        songsCompleted: state.songsCompleted,
        locale: state.locale,
        localeSetByUser: state.localeSetByUser,
        theme: state.theme,
        instrument: state.instrument,
        playMode: state.playMode,
        keyboardRange: state.keyboardRange,
        showNoteNames: state.showNoteNames,
        showKeymap: state.showKeymap,
        metronomeEnabled: state.metronomeEnabled,
        metronomeBpm: state.metronomeBpm,
        metronomeBeats: state.metronomeBeats,
      }),
      merge: (persistedState, currentState) => {
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

// Helper hooks
export const useAchievements = () => useAppStore((state) => state.achievements);
export const useScores = () => useAppStore((state) => state.scores);
export const useLocale = () => useAppStore((state) => state.locale);
export const useTheme = () => useAppStore((state) => state.theme);
export const useInstrument = () => useAppStore((state) => state.instrument);
export const usePlayMode = () => useAppStore((state) => state.playMode);
export const useKeyboardRange = () => useAppStore((state) => state.keyboardRange);
export const useShowNoteNames = () => useAppStore((state) => state.showNoteNames);
export const useShowKeymap = () => useAppStore((state) => state.showKeymap);
export const useMetronomeEnabled = () => useAppStore((state) => state.metronomeEnabled);
export const useMetronomeBpm = () => useAppStore((state) => state.metronomeBpm);
export const useMetronomeBeats = () => useAppStore((state) => state.metronomeBeats);
export const useAppActions = () => useAppStore((state) => state.actions);

export function getNextSong(currentSong: Song): Song {
  const currentIndex = builtInSongs.findIndex(s => s.id === currentSong.id);
  if (currentIndex === -1) return builtInSongs[0];
  const nextIndex = (currentIndex + 1) % builtInSongs.length;
  return builtInSongs[nextIndex];
}

export type { PlayMode, Theme, Instrument, Achievement, ScoreRecord };