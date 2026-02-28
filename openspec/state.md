# 状态管理规范

## 概览
NoteCascade 使用 Zustand 进行全局状态管理，并持久化到 `localStorage`。

## Store 定义 (`/app/lib/store.ts`)

### AppState 接口
- `achievements: Achievement[]`：所有成就及其解锁状态的列表。
- `scores: ScoreRecord[]`：已播放歌曲及其分数的历史记录。
- `totalPracticeTime: number`：总练习时间（秒）。
- `dailyStreak: number`：连续练习天数。
- `lastPracticeDate: string | null`：上次练习日期 (YYYY-MM-DD)。
- `totalNotesHit: number`：击中的 Perfect 和 Good 音符总数。
- `songsCompleted: number`：完成的歌曲总数。
- `locale: Locale`：当前语言设置（'en'、'zh-CN' 等）。
- `theme: Theme`：当前视觉主题。
- `keyboardRange: { start: number; end: number }`：虚拟键盘的可见范围。
- `showNoteNames: boolean`：在琴键上显示音符名称的开关。
- `showKeymap: boolean`：在琴键上显示电脑键盘映射的开关。
- `metronomeEnabled: boolean`：节拍器开关。
- `metronomeBpm: number`：节拍器的每分钟节拍数 (BPM)。
- `metronomeBeats: number`：节拍器的每小节拍数。

### Actions
- `unlockAchievement(id: string)`：解锁特定成就。
- `addScore(score: ScoreRecord)`：添加新的分数记录并更新总计。
- `incrementPracticeTime(seconds: number)`：增加总练习时间。
- `setLocale(locale: Locale)`：更改应用语言。
- `setTheme(theme: Theme)`：更改应用主题。
- `setKeyboardRange(start: number, end: number)`：更新可见键盘范围。
- `setShowNoteNames(show: boolean)`：切换音符名称显示。
- `setShowKeymap(show: boolean)`：切换电脑键盘映射显示。
- `setMetronomeEnabled(enabled: boolean)`：切换节拍器。
- `setMetronomeBpm(bpm: number)`：设置节拍器 BPM。
- `setMetronomeBeats(beats: number)`：设置节拍器每小节拍数。
- `resetProgress()`：将所有进度和设置重置为默认值。
- `checkAchievements()`：评估解锁成就的条件。
- `updateStreak()`：更新每日练习连胜。

### 持久化
状态使用 Zustand 的 `persist` 中间件和 `createJSONStorage` 进行持久化。`partialize` 函数确保仅保存必要的状态，而 `merge` 处理在初始状态中添加新成就时的迁移。
