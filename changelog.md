# Changelog

## v1.3.5
- Added "Bugs Fly" song to the library.
- Refactored `app/page.tsx` into custom hooks (`useGameLogic`, `useSidebarResize`) for better maintainability.
- Fixed an issue with sound playback in demo mode.
- Optimized sidebar resizing and UI layout.

## v1.1.2
- Added automatic metronome with adjustable BPM and beats per measure.
- Moved playback controls to the bottom of the song list sidebar.
- Added a toggle to show/hide PC keyboard mapping on the virtual piano keys.
- Extracted and documented architecture, components, state, and audio specifications into the `openspec` directory.

## v1.1.1
- Refactored project structure by moving hooks and lib directories to root, and components to app/components.
- Updated all import paths to reflect the new directory structure.
- Recreated missing Keyboard.tsx component.

## v1.1.0
- Added theme system (Dark, Light, Cyber, Classic)
- Enhanced settings modal with dynamic keyboard range selection
- Added note name toggle for falling notes and keyboard
- Improved UI with icons and responsive sidebar
- Updated translations for zh-CN and zh-TW
- Added app information and MIDI status in settings

## v1.0.5
- Initial release with MIDI support and basic gameplay
- Song library and achievement system
- Multi-language support
