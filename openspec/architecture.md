# Architecture Specification

## Overview
NoteCascade follows a component-based architecture using Next.js App Router, React, and Zustand for state management.

## Directory Structure
- `/app/components/`: Reusable UI components (GameCanvas, Keyboard, SongSelector, etc.)
- `/app/hooks/`: Custom React hooks (use-midi for Web MIDI API integration)
- `/app/lib/`: Core logic, state, and utilities (audio.ts, store.ts, songs.ts, translations.ts)

## Core Modules
### 1. Audio Engine (`/app/lib/audio.ts`)
Uses Tone.js for audio synthesis and playback.
- `initAudio()`: Initializes the master volume, piano sampler, synthesizer, and metronome.
- `playNote()`, `startNote()`, `stopNote()`: Handles note triggering.
- `setVolume()`: Adjusts the master volume.
- `setMetronome()`, `startTransport()`, `stopTransport()`: Manages the metronome and playback transport.

### 2. State Management (`/app/lib/store.ts`)
Uses Zustand with persistence middleware.
- **AppState**: Manages achievements, scores, practice time, settings (theme, locale, volume, metronome, keymap).
- **Actions**: `addScore`, `incrementPracticeTime`, `setMetronomeEnabled`, etc.

### 3. MIDI Integration (`/app/hooks/use-midi.ts`)
Handles Web MIDI API connections.
- Requests MIDI access (`sysex: false`).
- Manages active notes and selected input/output devices.
- Triggers `onNoteOn` and `onNoteOff` callbacks.

### 4. Game Loop (`/app/components/GameCanvas.tsx`)
Uses `requestAnimationFrame` for high-performance rendering.
- Draws the waterfall notes, hit line, and visual feedback (particles, hit effects).
- Calculates score based on hit timing and velocity.
