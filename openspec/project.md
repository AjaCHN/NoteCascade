# 项目概述

## 背景
NoteCascade 是一个现代化的基于 Web 的 MIDI 钢琴练习应用，旨在通过引人入胜的瀑布流节奏游戏界面帮助用户掌握琴键。

## 目标
- 提供一个无障碍、基于 Web 的 MIDI 键盘练习平台。
- 为音乐演奏提供实时反馈和评分。
- 支持多种语言和主题。
- 通过成就系统和进度跟踪促进学习社区的形成。

## 技术栈
- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS v4
- **状态管理**: Zustand
- **音频/MIDI**: Tone.js & Web MIDI API
- **动画**: Motion
- **图标**: Lucide React

## 架构设计
NoteCascade 采用组件化架构，利用 Next.js App Router 进行路由和服务器端渲染（在适当的情况下），同时将核心游戏逻辑保留在客户端以确保高性能。
