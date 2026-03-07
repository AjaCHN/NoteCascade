// app/lib/store/achievements-logic.ts v2.0.0
import type { AppState, Achievement } from './types';
import type { Song } from '../songs/types';

export function checkAchievementsLogic(state: AppState, songs: Song[]): Achievement[] {
  const { scores, totalPracticeTime, dailyStreak, totalNotesHit, achievements } = state;
  const lastScore = scores[0];

  return achievements.map(ach => {
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
          const song = songs.find(song => song.id === s.songId);
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
}
