# Changelog

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
