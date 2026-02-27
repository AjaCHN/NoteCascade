# Gameplay Specification

## Overview
The core gameplay loop of NoteCascade involves falling notes synchronized to music, hit detection, and scoring.

## Rendering (`/app/components/GameCanvas.tsx`)

### Canvas Setup
- Uses an HTML5 `<canvas>` element for high-performance rendering.
- `ResizeObserver` ensures the canvas always matches its container size.

### Note Rendering (Waterfall)
- Notes fall from the top of the screen towards a "hit line" near the bottom.
- The vertical position of a note is calculated based on its `time` relative to the `currentTime` of the song, scaled by a `pixelsPerSecond` factor.
- The horizontal position and width are calculated based on the note's `midi` pitch, mapping it to the visible `keyboardRange`.

### Hit Detection
- When a user presses a key (via MIDI, PC keyboard, or touch), the game checks if there is a falling note for that specific MIDI pitch within a certain time window around the `currentTime`.
- **Hit Windows**:
  - Perfect: ±0.1 seconds
  - Good: ±0.2 seconds
  - Miss: Note passed the hit line without being pressed.
  - Wrong: Key pressed but no note was in the hit window.

### Visual Feedback
- **Hit Line**: Glows when notes are hit.
- **Particles**: Small squares burst from the hit line on a successful hit.
- **Ripples**: Expanding circles appear on the hit line.
- **Floating Text**: "Perfect", "Good", "Miss", or "Wrong" text floats up from the hit location, colored according to the hit quality.
