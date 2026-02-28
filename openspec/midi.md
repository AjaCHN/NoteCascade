# MIDI 集成规范

## 概览
NoteCascade 利用 Web MIDI API 允许用户连接物理 MIDI 键盘，并将其作为游戏的输入设备。

## 核心 Hook (`/app/hooks/use-midi.ts`)

### 状态管理
- `isSupported`：布尔值，指示浏览器是否支持 Web MIDI API。
- `inputs`：可用 MIDI 输入设备的数组 (`WebMidi.MIDIInput`)。
- `outputs`：可用 MIDI 输出设备的数组 (`WebMidi.MIDIOutput`)。
- `selectedInputId`：当前选中的 MIDI 输入设备的 ID。
- `activeNotes`：一个 `Map<number, number>`，跟踪当前按下的 MIDI 音符编号及其力度。

### 初始化
- `requestMIDIAccess({ sysex: false })`：请求使用 MIDI 设备的权限。`sysex` 显式设置为 `false`，以提高浏览器在某些环境下无需用户显式同意即可授予权限的可能性。

### 事件处理
- `onmidimessage`：监听来自所选输入设备的传入 MIDI 消息。
- **Note On (Command 144)**：按下键时触发。如果力度 > 0，则将音符添加到 `activeNotes` 并调用 `onNoteOn`。如果力度为 0，则视为 Note Off。
- **Note Off (Command 128)**：松开键时触发。将音符从 `activeNotes` 中移除并调用 `onNoteOff`。

### 设备管理
- `onstatechange`：监听设备的连接或断开，并相应地更新 `inputs` 和 `outputs` 列表。
