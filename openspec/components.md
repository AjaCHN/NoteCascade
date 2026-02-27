# Component Specification

## Overview
This document details the core UI components of NoteCascade.

## Core Components

### 1. `GameCanvas.tsx`
- **Purpose**: Renders the falling notes, hit line, and visual feedback.
- **Props**: `song`, `currentTime`, `activeNotes`, `isPlaying`, `onScoreUpdate`, `keyboardRange`, `showNoteNames`, `theme`.
- **Logic**: Uses a `requestAnimationFrame` loop to draw notes based on `currentTime` and `song.notes`. Calculates hit accuracy (Perfect, Good, Miss, Wrong) and renders hit effects (particles, ripples).

### 2. `Keyboard.tsx`
- **Purpose**: Displays the virtual piano keyboard and handles user input (mouse, touch, PC keyboard mapping).
- **Props**: `activeNotes`, `startNote`, `endNote`, `showNoteNames`, `showKeymap`, `keyMap`, `onNoteOn`, `onNoteOff`.
- **Logic**: Renders black and white keys in a realistic piano layout. Supports sliding pointer events for continuous playing. Displays note names and mapped PC keys if enabled.

### 3. `SongSelector.tsx`
- **Purpose**: Allows users to select a song from the built-in library.
- **Props**: `onSelect`, `selectedSongId`.
- **Logic**: Lists available songs, highlighting the currently selected one.

### 4. `AchievementList.tsx`
- **Purpose**: Displays the user's unlocked and locked achievements.
- **Logic**: Reads achievements from `useAppStore` and renders them with progress bars and icons.

### 5. `page.tsx` (Main Layout)
- **Purpose**: The root component that orchestrates the application.
- **Logic**:
  - Manages the `currentTime` via `setInterval` and `Tone.Transport`.
  - Handles the `isPlaying` state and song progression.
  - Integrates the `useMidi` hook and `GameCanvas`.
  - Renders the sidebar (settings, song list, achievements) and the main game area.
  - Includes settings for Volume, Metronome (BPM, Beats), PC Keyboard Map, Note Names, and MIDI Devices.
