# Audio Engine Specification

## Overview
The audio engine in NoteCascade is built on top of Tone.js, providing high-quality playback for both user input and automated song playback.

## Core Components (`/app/lib/audio.ts`)

### Synthesizers
- **Piano Sampler (`Tone.Sampler`)**: Uses high-quality Salamander Grand Piano samples for realistic piano sound.
- **PolySynth (`Tone.PolySynth`)**: A fallback synthesizer used if the piano samples are not yet loaded or fail to load.
- **Metronome (`Tone.MembraneSynth`)**: A percussive synthesizer used for the metronome click.

### Initialization
- `initAudio()`: Must be called on the first user interaction (click, keydown, touchstart) to start the AudioContext and initialize the synthesizers and master volume.

### Playback Functions
- `playNote(note, duration, velocity)`: Triggers a note with a specific duration (attack and release). Used for automated song playback.
- `startNote(note, velocity)`: Triggers the attack phase of a note. Used for real-time MIDI or keyboard input.
- `stopNote(note)`: Triggers the release phase of a note. Used when a MIDI key or keyboard key is released.

### Metronome and Transport
- `playMetronomeClick(isFirstBeat)`: Plays a single metronome click, with a higher pitch/velocity for the first beat of a measure.
- `setMetronome(enabled, bpm, beats)`: Configures the `Tone.Transport` BPM and time signature, and schedules the metronome click using `Tone.Transport.scheduleRepeat`.
- `startTransport()`: Starts the `Tone.Transport`, which drives the metronome.
- `stopTransport()`: Stops the `Tone.Transport`.

### Volume Control
- `setVolume(value)`: Converts a 0-100 linear volume value to decibels and applies it to the `masterVolume` node.
