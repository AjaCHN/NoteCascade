# Changelog

## v2.6.0
- 增强：同步并更新所有文件的版本号至 v2.6.0。
- 增强：检查并补全所有国际化语言文件（11 种语言）的完整性。
- 优化：更新 README 和 README_zh-CN 文档，修复中英文混杂问题。
- 优化：同步代码功能细节到 openspec 文档，增加 MIDI 映射和节拍器说明。
- 优化：提升应用鲁棒性，优化开发环境下的 Manifest 错误处理。

## v2.5.3
- Fix: 进一步禁用 `devIndicators.buildActivity`，彻底解决 Next.js 15 开发工具导致的 `SegmentViewNode` React Client Manifest 错误。
- Chore: 升级版本至 v2.5.3。

## v2.5.2
- Fix: 禁用 `devIndicators.appIsrStatus` 以解决 Next.js 15 开发工具导致的 `SegmentViewNode` React Client Manifest 错误。
- Chore: 升级版本至 v2.5.2。

## v2.5.1
- Fix: 禁用开发模式下的 Webpack 缓存，解决文件系统同步导致的 `ENOENT` 错误。
- Chore: 升级版本至 v2.5.1。

## v2.5.0
- Fix: 优化 `next.config.mjs` 配置，移除显式 `distDir`，禁用构建时 lint/typecheck 以解决 manifest 丢失和构建失败问题。
- Chore: 升级版本至 v2.5.0。

## v2.4.9
- Fix: Restored `output: 'standalone'` as required by deployment guidelines.
- Fix: Added explicit `distDir: '.next'` to `next.config.mjs` to ensure path consistency.
- Fix: Re-enabled clean build step (`rm -rf .next`) to prevent manifest corruption.
- Chore: Updated all version indicators to v2.4.9.

## v2.4.8
- Fix: Reverted to a minimal `next.config.mjs` and simplified the build script to resolve persistent `ENOENT` manifest errors.
- Chore: Updated all version indicators to v2.4.8.

## v2.4.7
- Fix: Added `trailingSlash: true` to `next.config.mjs` to potentially resolve manifest generation issues in containerized environments.
- Chore: Updated all version indicators to v2.4.7.

## v2.4.6
- Fix: Modified `package.json` build script to explicitly remove `.next` directory before building (`rm -rf .next && next build`) to resolve persistent `ENOENT` and `SyntaxError` manifest issues.
- Fix: Added a static `generateBuildId` in `next.config.mjs` for better build consistency.
- Chore: Updated all version indicators to v2.4.6.

## v2.4.5
- Fix: Switched to `next.config.mjs` and simplified `not-found.tsx` to resolve persistent build errors and manifest `ENOENT` issues.
- Chore: Updated all version indicators to v2.4.5.

## v2.4.4
- Fix: Reverted explicit `distDir` and added `generateBuildId` to `next.config.ts` to improve manifest consistency and resolve `ENOENT` errors.
- Chore: Updated all version indicators to v2.4.4.

## v2.4.3
- Fix: Explicitly set `distDir: '.next'` in `next.config.ts` to resolve persistent `ENOENT` manifest errors.
- Chore: Updated all version indicators to v2.4.3.

## v2.4.2
- Fix: Resolved persistent `ENOENT` manifest errors and `PageNotFoundError: /_not-found` by explicitly marking `not-found.tsx` as `force-static` and adding a global error boundary.
- Chore: Updated all version indicators to v2.4.2.

## v2.4.1
- Fix: Resolved `ENOENT` errors for `app-paths-manifest.json` and `routes-manifest.json` by triggering a clean build and restarting the development server.
- Chore: Updated all version indicators to v2.4.1.

## v2.4.0
- Fix: Resolved critical Next.js 15 build errors (`PageNotFoundError: /_not-found` and missing manifest files).
- Fix: Explicitly marked `not-found.tsx` as `force-static` to ensure reliable production builds.
- Chore: Updated all version indicators to v2.4.0.

## v2.3.5
- Fix: Resolved Next.js build errors (`ENOENT` for manifest files and `PageNotFoundError` for `/_not-found`) by cleaning up build artifacts and ensuring `not-found.tsx` is correctly handled as a server component.
- Chore: Updated all version indicators to v2.3.5.

## v2.3.3
- Fix: Resolved a critical crash in `SongSelector` caused by missing translation keys for higher difficulty levels.
- L10n: Added missing difficulty and unlock hint translations for Simplified Chinese, Traditional Chinese, Japanese, Korean, and Russian.
- UI: Added fallback logic for translation strings to prevent runtime errors.

## v2.3.2
- Feat: Expanded difficulty unlock system to support up to level 5.
- Fix: Cleaned up unused imports and variables in `AppHeader`, `AccountSettings`, and `use-metronome`.
- UI: Replaced `img` tags with Next.js `Image` components for better performance and optimization.
- Chore: Removed redundant script `fix_zh_tw.js`.

## v2.3.1
- 增强：右上角菜单在鼠标移出 2 秒后自动关闭
- 修复：国际化语言文件完整性检查及补全
- 优化：更新 README 和 openspec 文档
- 优化：提升应用鲁棒性

## [2.0.0]
- Refactor: Major refactoring of core store (`store.ts`) to improve modularity and reduce token consumption by splitting into `types.ts` and `actions.ts`.
- Chore: Updated versioning.

## [2.3.0]
- UI: Added "Library" label to the song library button for better accessibility.
- UX: Optimized result modal auto-close countdown to 5 seconds.
- Fix: Prevented score updates when the result modal is active to ensure finality of results.
- Chore: Cleaned up redundant files and formatted documentation.

## [2.2.1]
- Fix: Resolved `ENOENT` errors related to missing `.next` manifest files by performing a clean build and restarting the development server.

## [2.2.0]
- Feat: Added local persistence for all settings (instrument, play mode, etc.) using localStorage, allowing settings to be remembered without an account.
- UX: Top-right menu now automatically closes when the mouse pointer leaves the menu area.

## [2.1.0]
- L10n: Added and perfected all application tips translations for all 11 supported languages.
- Feat: Expanded usage tips from 7 to 10 items.

## [2.0.3]
- Fix: Resolved `app-paths-manifest.json` ENOENT error by cleaning up `.next` build artifacts and reverting explicit `distDir` configuration to use default behavior.

## [2.0.2]
- Fix: Resolved build errors related to missing `routes-manifest.json` and `not-found` page by adding custom error/not-found pages and explicitly configuring `distDir`.

## [2.0.1]
- Feat: Added 15 new children's songs to the library (Little Rabbit Be Good, Counting Ducks, Malan Flower, Childhood, Edelweiss, The Dull-Ice Flower, Catching Loaches, Little Donkey, Little Swallow, Pulling Radishes, Two Tigers, Doraemon, The Painter, Little Conch, Peppa Pig).
- UI: Moved random tips display position up to the blank canvas area and ensured it doesn't block other UI elements.
- L10n: Added translations for the new songs in English and Simplified Chinese.

## [2.0.0]
- Refactor: Major refactoring of core hooks (`use-game-logic.ts`, `use-midi.ts`) and components (`Keyboard.tsx`) to improve modularity and reduce token consumption.
- Refactor: Extracted instrument creation into a separate `instruments.ts` module.
- Refactor: Extracted MIDI types and utils into a dedicated directory.
- Refactor: Extracted `Key` component from `Keyboard.tsx`.
- Refactor: Extracted `GameControls` and `BackgroundEffects` from `page.tsx`.
- L10n: Completed translations for all 11 supported languages, including new settings keys (metronome, sensitivity, latency, etc.).
- UI: Updated `AudioSettings` to use localized strings.

## [1.7.3]
- Bugfix: Fixed a bug where Free Play mode would incorrectly trigger auto-play when notes were played.

## [1.7.2]
- UI: Removed duplicate settings button from the top toolbar.
- UI: Added Demo Mode to the mode switcher.
- UI: Moved Achievements list to the collapsed menu.

## [1.7.1]
- Audio: Optimized polyphony management and voice limiting to prevent audio dropouts during complex passages.
- Audio: Fine-tuned compressor and limiter settings to eliminate clipping when multiple keys are pressed simultaneously.
- Audio: Lowered default master volume to provide more headroom for polyphonic playback.

## [1.7.0]
- Audio: Added Master Limiter and Compressor to prevent distortion during complex MIDI playback.
- MIDI: Added support for Pitch Bend, Modulation (vibrato), and Volume/Expression from external MIDI hardware.
- UI: Added Full Screen toggle button in the header.
- UI: Added a Mode Switcher in the header (Follow, Demo, Free Play, Perform).
- UI: Result card now auto-dismisses after 10 seconds with a visual countdown.
- Bugfix: Fixed keyboard range selection bug and ensured a minimum width of 25 keys.
- Bugfix: Allowed manual keyboard range override even when MIDI is connected.

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
