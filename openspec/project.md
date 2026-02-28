# 项目规范：NoteCascade

## 概览
NoteCascade 是一款视觉化 MIDI 键盘练习应用，旨在通过类游戏的界面帮助用户掌握钢琴技能。它具有瀑布流式的音符显示、实时评分和成就系统。

## 核心功能
- **实时 MIDI 输入**：通过 Web MIDI API 连接物理 MIDI 键盘。
- **视觉反馈**：与所选歌曲同步的下落音符。
- **评分系统**：Perfect（完美）、Good（良好）、Miss（错过）和 Wrong（错误）击键检测。
- **曲库**：内置不同难度等级的歌曲。
- **成就系统**：练习里程碑的可解锁奖励。
- **音频反馈**：为演奏的音符提供高质量的合成器声音。

## 技术栈
- **框架**：Next.js 15+ (App Router)
- **语言**：TypeScript
- **样式**：Tailwind CSS
- **动画**：Framer Motion (motion/react)
- **音频**：Tone.js
- **状态管理**：Zustand
- **图标**：Lucide React
