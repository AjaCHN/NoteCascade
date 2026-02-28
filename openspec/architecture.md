# 架构规范

## 概览
NoteCascade 遵循基于组件的架构，使用 Next.js App Router、React 和 Zustand 进行状态管理。

## 目录结构
- `/app/components/`：可重用的 UI 组件（GameCanvas、Keyboard、SongSelector 等）
- `/app/hooks/`：自定义 React hook（用于 Web MIDI API 集成的 use-midi）
- `/app/lib/`：核心逻辑、状态和工具（audio.ts、store.ts、songs.ts、translations.ts）

## 核心模块
### 1. 音频引擎 (`/app/lib/audio.ts`)
使用 Tone.js 进行音频合成和播放。
- `initAudio()`：初始化主音量、钢琴采样器、合成器和节拍器。
- `playNote()`、`startNote()`、`stopNote()`：处理音符触发。
- `setVolume()`：调节主音量。
- `setMetronome()`、`startTransport()`、`stopTransport()`：管理节拍器和播放传输。

### 2. 状态管理 (`/app/lib/store.ts`)
使用带有持久化中间件的 Zustand。
- **AppState**：管理成就、分数、练习时间、设置（主题、语言、音量、节拍器、键位映射）。
- **Actions**：`addScore`、`incrementPracticeTime`、`setMetronomeEnabled` 等。

### 3. MIDI 集成 (`/app/hooks/use-midi.ts`)
处理 Web MIDI API 连接。
- 请求 MIDI 访问权限 (`sysex: false`)。
- 管理活动音符以及所选的输入/输出设备。
- 触发 `onNoteOn` 和 `onNoteOff` 回调。

### 4. 游戏循环 (`/app/components/GameCanvas.tsx`)
使用 `requestAnimationFrame` 进行高性能渲染。
- 绘制瀑布流音符、击键线和视觉反馈（粒子、击键效果）。
- 根据击键时机和力度计算分数。
