# MIDI Integration Specification

## Overview
NoteCascade leverages the Web MIDI API to allow users to connect physical MIDI keyboards and use them as input devices for the game.

## Core Hook (`/app/hooks/use-midi.ts`)

### State Management
- `isSupported`: Boolean indicating if the browser supports the Web MIDI API.
- `inputs`: Array of available MIDI input devices (`WebMidi.MIDIInput`).
- `outputs`: Array of available MIDI output devices (`WebMidi.MIDIOutput`).
- `selectedInputId`: The ID of the currently selected MIDI input device.
- `activeNotes`: A `Map<number, number>` tracking currently pressed MIDI note numbers and their velocities.

### Initialization
- `requestMIDIAccess({ sysex: false })`: Requests permission to use MIDI devices. `sysex` is explicitly set to `false` to improve the chances of the browser granting permission without requiring explicit user consent in some environments.

### Event Handling
- `onmidimessage`: Listens for incoming MIDI messages from the selected input device.
- **Note On (Command 144)**: Triggered when a key is pressed. If velocity > 0, the note is added to `activeNotes` and `onNoteOn` is called. If velocity is 0, it's treated as a Note Off.
- **Note Off (Command 128)**: Triggered when a key is released. The note is removed from `activeNotes` and `onNoteOff` is called.

### Device Management
- `onstatechange`: Listens for devices being connected or disconnected and updates the `inputs` and `outputs` lists accordingly.
