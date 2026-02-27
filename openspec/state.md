# State Management Specification

## Overview
NoteCascade uses Zustand for global state management, with persistence to `localStorage`.

## Store Definition (`/app/lib/store.ts`)

### AppState Interface
- `achievements: Achievement[]`: List of all achievements and their unlock status.
- `scores: ScoreRecord[]`: History of played songs and their scores.
- `totalPracticeTime: number`: Total time spent practicing in seconds.
- `dailyStreak: number`: Consecutive days practiced.
- `lastPracticeDate: string | null`: Date of last practice (YYYY-MM-DD).
- `totalNotesHit: number`: Total perfect and good notes hit.
- `songsCompleted: number`: Total number of songs finished.
- `locale: Locale`: Current language setting ('en', 'zh-CN', etc.).
- `theme: Theme`: Current visual theme.
- `keyboardRange: { start: number; end: number }`: Visible range of the virtual keyboard.
- `showNoteNames: boolean`: Toggle for displaying note names on keys.
- `showKeymap: boolean`: Toggle for displaying PC keyboard mapping on keys.
- `metronomeEnabled: boolean`: Toggle for the metronome.
- `metronomeBpm: number`: Beats per minute for the metronome.
- `metronomeBeats: number`: Beats per measure for the metronome.

### Actions
- `unlockAchievement(id: string)`: Unlocks a specific achievement.
- `addScore(score: ScoreRecord)`: Adds a new score record and updates totals.
- `incrementPracticeTime(seconds: number)`: Adds to total practice time.
- `setLocale(locale: Locale)`: Changes the application language.
- `setTheme(theme: Theme)`: Changes the application theme.
- `setKeyboardRange(start: number, end: number)`: Updates the visible keyboard range.
- `setShowNoteNames(show: boolean)`: Toggles note name display.
- `setShowKeymap(show: boolean)`: Toggles PC keyboard map display.
- `setMetronomeEnabled(enabled: boolean)`: Toggles the metronome.
- `setMetronomeBpm(bpm: number)`: Sets the metronome BPM.
- `setMetronomeBeats(beats: number)`: Sets the metronome beats per measure.
- `resetProgress()`: Resets all progress and settings to default.
- `checkAchievements()`: Evaluates conditions for unlocking achievements.
- `updateStreak()`: Updates the daily practice streak.

### Persistence
The state is persisted using Zustand's `persist` middleware with `createJSONStorage`. The `partialize` function ensures only necessary state is saved, and `merge` handles migrating achievements when new ones are added to the initial state.
