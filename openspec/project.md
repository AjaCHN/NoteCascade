// openspec/project.md v2.3.2
# NoteCascade Project Specification

## Overview
NoteCascade is a web-based piano learning and rhythm game. It allows users to play MIDI files, track their performance, and learn piano in an interactive way.

## Core Features
- **MIDI Playback**: Support for loading and playing MIDI files via `useMidi` hook.
- **Rhythm Gameplay**: Falling notes interface (Waterfall view) for interactive play.
- **Performance Tracking**: Scoring system based on timing and accuracy (Perfect/Good/Miss).
- **Multi-language Support**: i18n support for English (`en`) and Chinese (`zh-CN`).
- **User Accounts**: Firebase integration for user profiles (ProfileButton).
- **Audio Engine**: Powered by Tone.js with metronome support.

## Technical Stack
- **Frontend**: Next.js 15, React 19, Tailwind CSS 4.
- **State Management**: Zustand.
- **Audio Engine**: Tone.js.
- **MIDI Processing**: @tonejs/midi.
- **Animations**: Motion (framer-motion).
- **Backend**: Firebase (Auth, Firestore).
