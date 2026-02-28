# 音频引擎规范

## 概览
NoteCascade 中的音频引擎基于 Tone.js 构建，为用户输入和自动歌曲播放提供高质量的播放。

## 核心组件 (`/app/lib/audio.ts`)

### 合成器
- **钢琴采样器 (`Tone.Sampler`)**：使用高质量的 Salamander 大钢琴样本，提供真实的钢琴声音。
- **多音合成器 (`Tone.PolySynth`)**：如果钢琴样本尚未加载或加载失败，则使用此备用合成器。
- **节拍器 (`Tone.MembraneSynth`)**：用于节拍器点击声的打击乐合成器。

### 初始化
- `initAudio()`：必须在第一次用户交互（点击、按键、触摸）时调用，以启动 AudioContext 并初始化合成器和主音量。

### 播放函数
- `playNote(note, duration, velocity)`：触发具有特定时长（起音和释音）的音符。用于自动歌曲播放。
- `startNote(note, velocity)`：触发音符的起音（attack）阶段。用于实时 MIDI 或键盘输入。
- `stopNote(note)`：触发音符的释音（release）阶段。在松开 MIDI 键或键盘键时使用。

### 节拍器和传输控制
- `playMetronomeClick(isFirstBeat)`：播放单次节拍器点击声，小节的第一拍具有更高的音调/力度。
- `setMetronome(enabled, bpm, beats)`：配置 `Tone.Transport` 的 BPM 和拍号，并使用 `Tone.Transport.scheduleRepeat` 调度节拍器点击声。
- `startTransport()`：启动驱动节拍器的 `Tone.Transport`。
- `stopTransport()`：停止 `Tone.Transport`。

### 音量控制
- `setVolume(value)`：将 0-100 的线性音量值转换为分贝，并将其应用于 `masterVolume` 节点。
