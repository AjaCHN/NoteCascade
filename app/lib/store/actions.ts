// app/lib/store/actions.ts v2.3.1
import { AppState, ScoreRecord } from './types';
import { INITIAL_ACHIEVEMENTS } from '../achievements-data';
import { builtInSongs } from '../songs';

export const createActions = (set: (partial: Partial<AppState> | ((state: AppState) => Partial<AppState>)) => void, get: () => AppState): AppState['actions'] => ({
  unlockAchievement: (id) =>
    set((state: AppState) => {
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
  addScore: (score: ScoreRecord) => {
    set((state: AppState) => ({
      scores: [score, ...state.scores].slice(0, 100),
      totalNotesHit: state.totalNotesHit + score.perfect + score.good,
      songsCompleted: state.songsCompleted + 1,
    }));
    get().actions.updateStreak();
    get().actions.checkAchievements();
  },
  incrementPracticeTime: (seconds: number) => {
    set((state: AppState) => ({
      totalPracticeTime: state.totalPracticeTime + seconds,
    }));
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
    const lastScore = scores[0];

    const newAchievements = achievements.map(ach => {
      if (ach.unlockedAt) return ach;

      let unlocked = false;
      let progress = ach.progress || 0;

      switch (ach.id) {
        case 'first_song':
          if (scores.length > 0) unlocked = true;
          break;
        case 'perfect_10':
          if (lastScore && lastScore.perfect >= 10) unlocked = true;
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

    if (JSON.stringify(newAchievements) !== JSON.stringify(achievements)) {
      set({ achievements: newAchievements });
    }
  },
  setLocale: (locale) => set({ locale }),
  setTheme: (theme) => set({ theme }),
  setInstrument: (instrument) => set({ instrument }),
  setPlayMode: (playMode) => set({ playMode }),
  setKeyboardRange: (start, end) => set({ keyboardRange: { start, end } }),
  setShowNoteNames: (showNoteNames) => set({ showNoteNames }),
  setShowKeymap: (showKeymap) => set({ showKeymap }),
  setMetronomeEnabled: (metronomeEnabled) => set({ metronomeEnabled }),
  setMetronomeBpm: (metronomeBpm) => set({ metronomeBpm }),
  setMetronomeBeats: (metronomeBeats) => set({ metronomeBeats }),
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
      instrument: 'piano',
      playMode: 'practice',
      keyboardRange: { start: 48, end: 84 },
      showNoteNames: true,
      showKeymap: true,
      metronomeEnabled: false,
      metronomeBpm: 120,
      metronomeBeats: 4,
    }),
});
