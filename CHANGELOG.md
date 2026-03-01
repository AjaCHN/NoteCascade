# Changelog

## [1.6.2]
- UI: Swapped positions of song difficulty stars and song style tags for a more logical information hierarchy.

## [1.6.1]
- UI: Moved song difficulty stars to the same line as the song style tag, freeing up more horizontal space for song titles in the library list.

## [1.6.0]
- UI: Enhanced MIDI device status indicator in the header with more prominent colors, borders, and a pulsing glow when connected.
- UI: Optimized song library layout with single-line song names and horizontal scrolling for long titles.
- Performance: Significantly optimized the game renderer by reducing expensive canvas operations like `shadowBlur` and `createLinearGradient` inside the main loop.
- Performance: Switched to solid colors with alpha for notes and active columns to reduce hardware resource consumption.
- Performance: Enabled `alpha: false` on the 2D context for faster background rendering.

## [1.5.1]
- Fix: Disabled automatic keyboard range adjustment when an external MIDI device is connected. The keyboard now stays at a fixed 88-key range (21-108) to ensure stability for hardware users.

## [1.5.0]
- UI: Optimized song library list by removing redundant "Play" links/buttons from song cards for a cleaner look.
- Visual: Enhanced the hit line (baseline) in the game renderer with a stronger glow and more prominent styling.
- Visual: Added dynamic contact effects (horizontal flash and vertical glow) when notes hit the baseline, improving visual feedback for timing.

## [1.4.12]
- Fix: Fixed `ReferenceError: isConnecting is not defined` in `page.tsx`.

## [1.4.11]
- Feature: Enhanced MIDI refresh functionality. The "Connect" button now explicitly re-requests MIDI access from the browser, which is more effective at triggering the permission prompt if it was previously dismissed.
- UI: Added an `isConnecting` loading state with visual feedback (animations) when MIDI is being initialized.
- UI: The MIDI device indicator in the header is now visible on mobile devices to allow manual connection.

## [1.4.10]
- Feature: Made the "NO DEVICE" indicator in the top header clickable. Clicking it now manually triggers the MIDI connection process, which correctly prompts the browser's MIDI permission dialog (required by recent Chrome security policies).

## [1.4.9]
- Fix: Fixed a bug where the result modal showed all 0s for the score data because the game engine was resetting the score immediately upon the song ending.

## [1.4.8]
- Audio: Enhanced instrument sounds for a thicker, warmer tone. Added a master EQ (boosting lows and highs), a master Reverb, and a Chorus effect for the EPiano. Upgraded Synth and Strings to use fat oscillators.

## [1.4.7]
- Chore: Fixed various linting warnings (unused imports, missing dependencies in `useEffect`).

## [1.4.6]
- Fix: Added missing import for `PERFECT_THRESHOLD` in `use-game-renderer.ts`.

## [1.4.5]
- UI: Moved the timing bar (Early/Perfect/Late indicator) to the top center of the screen and enhanced its visual styling, including a highlighted perfect zone and ripple effects for hits.
- UI: Adjusted the GameStatsOverlay layout to prevent overlapping with the new timing bar position.

## [1.4.4]
- Fix: Fixed a bug where the final score shown in the result modal was occasionally stale by using a ref to track the latest score state.
- UI: Added icons to the buttons in the Result Modal.

## [1.4.3]
- Fix: Extremely robust MIDI device enumeration using iterators instead of `forEach`.
- Fix: Prioritize `sysex: false` for MIDI access to avoid permission blocks in strict environments.
- Fix: Re-attach MIDI listeners to all inputs on any state change (hot-plugging).

## [1.4.2]
- Refactor: Split `app/lib/song-data.ts` into smaller, categorized files (`classic.ts`, `holiday.ts`, `chinese.ts`, `pop-rock.ts`, `utils.ts`) for better maintainability.

## [1.4.1]
- Feat: Expanded melodies for multiple built-in songs to make them longer and more complete (Ode to Joy, Spring, Canon in D, Fur Elise, Swan Lake, Blue Danube, Entertainer, William Tell, Mo Li Hua, Butterfly Lovers, Beyond songs, Bugs Fly).

## [1.4.0]
- Design: New SVG logo and favicon.
- Branding: Updated app header with the new logo.

## [1.3.9]
- Fix: Improved MIDI connection robustness (added sysex retry and listener cleanup).
- Feat: Dynamic keyboard range adjustment (fits song notes when no MIDI is connected).
- Feat: Auto-expand keyboard range when MIDI is connected.

## [1.3.8]
- Feat: Sort songs by difficulty (ascending).

## [1.3.7]
- Fix: Syntax error in SongSelector component.

## [1.3.6]
- Fix: Make song selector header sticky to prevent it from disappearing on scroll.
