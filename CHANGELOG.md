# Changelog

## [2.7.0]
- Feature: Implemented user roles (Admin, Moderator, User, Guest) and permission management.
- Feature: Added `Permissions` system to control access to specific features.
- UI: Updated `ProfileButton` to display user roles for privileged accounts.

## [2.6.0]
- Feature: Integrated Firebase Auth with Google and GitHub login.
- Feature: Automatic Firestore user document creation for new users.
- UI: Updated `ProfileButton` to show user avatar and handle authentication state.
- UI: Enhanced `AuthModal` with social login options.

## [2.5.2]
- Fixed: React hook warnings in `SheetMusicView.tsx` by removing unnecessary state updates inside effects.

## [2.5.1]
- Fixed: Added error boundary components (`error.tsx`, `global-error.tsx`) to catch unexpected runtime errors.

## [2.5.0]
- Refactor: Split `AppRoot.tsx` into `GameContainer.tsx` and `KeyboardContainer.tsx` to improve maintainability and reduce file complexity.

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
