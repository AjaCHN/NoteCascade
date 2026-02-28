# 组件规范

## 概览
本文档详细介绍了 NoteCascade 的核心 UI 组件。

## 核心组件

### 1. `GameCanvas.tsx`
- **用途**：渲染下落音符、击键线和视觉反馈。
- **Props**：`song`、`currentTime`、`activeNotes`、`isPlaying`、`onScoreUpdate`、`keyboardRange`、`showNoteNames`、`theme`。
- **逻辑**：使用 `requestAnimationFrame` 循环根据 `currentTime` 和 `song.notes` 绘制音符。计算击键准确度（Perfect、Good、Miss、Wrong）并渲染击键效果（粒子、波纹）。

### 2. `Keyboard.tsx`
- **用途**：显示虚拟钢琴键盘并处理用户输入（鼠标、触摸、电脑键盘映射）。
- **Props**：`activeNotes`、`startNote`、`endNote`、`showNoteNames`、`showKeymap`、`keyMap`、`onNoteOn`、`onNoteOff`。
- **逻辑**：以真实的钢琴布局渲染黑白键。支持滑动手势以实现连续演奏。如果启用，则显示音符名称和映射的电脑按键。

### 3. `SongSelector.tsx`
- **用途**：允许用户从内置曲库中选择歌曲。
- **Props**：`onSelect`、`selectedSongId`。
- **逻辑**：列出可用歌曲，并高亮显示当前选中的歌曲。

### 4. `AchievementList.tsx`
- **用途**：显示用户已解锁和未解锁的成就。
- **逻辑**：从 `useAppStore` 读取成就，并使用进度条和图标进行渲染。

### 5. `page.tsx` (主布局)
- **用途**：编排应用程序的根组件。
- **逻辑**：
  - 通过 `setInterval` 和 `Tone.Transport` 管理 `currentTime`。
  - 处理 `isPlaying` 状态和歌曲进度。
  - 集成 `useMidi` 钩子和 `GameCanvas`。
  - 渲染侧边栏（设置、歌曲列表、成就）和主游戏区域。
  - 包含音量、节拍器（BPM、拍数）、电脑键盘映射、音符名称和 MIDI 设备的设置。
