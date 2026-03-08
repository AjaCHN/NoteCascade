# Changelog

## [2.4.2]
- L10n: Translated Music Theory page strings and lessons into Chinese (Simplified and Traditional).
- L10n: Added Traditional Chinese (zh-TW) support to the translation system.

## [2.4.1]
- UI: Removed audio settings button from top toolbar (redundant with settings modal).

## [2.4.0]
- UI: Optimized result card auto-exit countdown to 5 seconds.
- Audio: Optimized instruments for low-end computers (reduced polyphony and simplified oscillators).
- Feature: Implemented Screen Wake Lock to prevent computer from sleeping during use.

## [2.3.2]
- Fixed: `Uncaught TypeError: onScoreUpdate is not a function` by correcting prop names and types in `GameViews` and `AppRoot`.
- Refactor: Removed unused `containerSize` prop from `GameViews`.

## [2.3.1]
- UI: Moved view mode toggle button to the top toolbar (AppHeader) for better accessibility.

## [2.3.0]
- Refactor: Extracted large components (`AppHeader`, `AppRoot`, `InfoModals`, `SongSelector`) into smaller, focused sub-components (`MenuDropdown`, `AudioControls`, `GameViews`, `ChangelogContent`, `SongFilters`).
- Refactor: Split `use-game-logic.ts` and `use-midi.ts` hooks into smaller, more manageable hooks (`useGameScore`, `useMidiMessage`).
- Fixed: TypeScript & ESLint errors in `AudioControls`, `MenuDropdown`, `ChangelogContent`, and `SongFilters`.
- Fixed: Missing props in `AppHeader` and type mismatches in `SongSelector` and `GameViews`.
