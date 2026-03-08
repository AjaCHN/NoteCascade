// app/lib/store.ts v2.4.2
import { create } from "zustand";
import { Locale } from "./translations";
import { Achievement } from "./store/types";
import { INITIAL_ACHIEVEMENTS } from "./achievements-data";
import { Song } from "./songs/types";

export interface Score {
  songId: string;
  score: number;
  timestamp: number;
}

export type PlayMode = 'demo' | 'practice' | 'free';
export type Theme = 'dark' | 'light' | 'cyber' | 'classic' | 'default';
export type Instrument = 'piano' | 'synth' | 'epiano' | 'strings' | 'celesta' | 'pad';

interface AppState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isSettingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  isLibraryOpen: boolean;
  setLibraryOpen: (open: boolean) => void;
  isAuthOpen: boolean;
  setAuthOpen: (open: boolean) => void;
  
  // Metronome
  metronomeEnabled: boolean;
  setMetronomeEnabled: (enabled: boolean) => void;
  metronomeBpm: number;
  setMetronomeBpm: (bpm: number) => void;
  metronomeBeats: number;
  setMetronomeBeats: (beats: number) => void;
  
  // Keyboard
  keyboardType: '88' | '61' | '49' | '32' | 'virtual';
  setKeyboardType: (type: '88' | '61' | '49' | '32' | 'virtual') => void;
  
  // Play Mode
  playMode: 'demo' | 'practice' | 'free';
  setPlayMode: (mode: 'demo' | 'practice' | 'free') => void;

  theme: Theme;
  setTheme: (theme: Theme) => void;
  instrument: Instrument;
  setInstrument: (instrument: Instrument) => void;
  keyboardRange: { start: number; end: number };
  setKeyboardRange: (range: { start: number; end: number }) => void;
  showNoteNames: boolean;
  setShowNoteNames: (show: boolean) => void;
  showKeymap: boolean;
  setShowKeymap: (show: boolean) => void;
  isRangeManuallySet: boolean;
  setIsRangeManuallySet: (set: boolean) => void;
  songs: Song[];
  setSongs: (songs: Song[]) => void;
  scores: Score[];
  setScores: (scores: Score[]) => void;
  
  achievements: Achievement[];
  setAchievements: (achievements: Achievement[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  locale: "zh-CN",
  setLocale: (locale) => set({ locale }),
  isSettingsOpen: false,
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),
  isLibraryOpen: false,
  setLibraryOpen: (open) => set({ isLibraryOpen: open }),
  isAuthOpen: false,
  setAuthOpen: (open) => set({ isAuthOpen: open }),
  
  metronomeEnabled: false,
  setMetronomeEnabled: (enabled) => set({ metronomeEnabled: enabled }),
  metronomeBpm: 120,
  setMetronomeBpm: (bpm) => set({ metronomeBpm: bpm }),
  metronomeBeats: 4,
  setMetronomeBeats: (beats) => set({ metronomeBeats: beats }),
  
  keyboardType: '88',
  setKeyboardType: (type) => set({ keyboardType: type }),
  
  playMode: 'practice',
  setPlayMode: (mode) => set({ playMode: mode }),

  theme: 'default',
  setTheme: (theme) => set({ theme }),
  instrument: 'piano',
  setInstrument: (instrument) => set({ instrument }),
  keyboardRange: { start: 21, end: 108 },
  setKeyboardRange: (range) => set({ keyboardRange: range }),
  showNoteNames: true,
  setShowNoteNames: (show) => set({ showNoteNames: show }),
  showKeymap: true,
  setShowKeymap: (show) => set({ showKeymap: show }),
  isRangeManuallySet: false,
  setIsRangeManuallySet: (isSet) => set({ isRangeManuallySet: isSet }),
  songs: [],
  setSongs: (songs) => set({ songs }),
  scores: [],
  setScores: (scores) => set({ scores }),
  
  achievements: INITIAL_ACHIEVEMENTS,
  setAchievements: (achievements) => set({ achievements }),
}));

// Selectors
export const useLocale = () => useAppStore((state) => state.locale);
export const useMetronomeEnabled = () => useAppStore((state) => state.metronomeEnabled);
export const useMetronomeBpm = () => useAppStore((state) => state.metronomeBpm);
export const useMetronomeBeats = () => useAppStore((state) => state.metronomeBeats);
export const useKeyboardType = () => useAppStore((state) => state.keyboardType);
export const usePlayMode = () => useAppStore((state) => state.playMode);
export const useTheme = () => useAppStore((state) => state.theme);
export const useInstrument = () => useAppStore((state) => state.instrument);
export const useKeyboardRange = () => useAppStore((state) => state.keyboardRange);
export const useShowNoteNames = () => useAppStore((state) => state.showNoteNames);
export const useShowKeymap = () => useAppStore((state) => state.showKeymap);
export const useIsRangeManuallySet = () => useAppStore((state) => state.isRangeManuallySet);
export const useSongs = () => useAppStore((state) => state.songs);
export const useScores = () => useAppStore((state) => state.scores);
export const useAchievements = () => useAppStore((state) => state.achievements);

export const useAppActions = () => {
  const setLocale = useAppStore((state) => state.setLocale);
  const setMetronomeEnabled = useAppStore((state) => state.setMetronomeEnabled);
  const setMetronomeBpm = useAppStore((state) => state.setMetronomeBpm);
  const setMetronomeBeats = useAppStore((state) => state.setMetronomeBeats);
  const setPlayMode = useAppStore((state) => state.setPlayMode);
  const setKeyboardType = useAppStore((state) => state.setKeyboardType);
  const setKeyboardRange = useAppStore((state) => state.setKeyboardRange);
  const setSongs = useAppStore((state) => state.setSongs);
  const setScores = useAppStore((state) => state.setScores);
  const setAchievements = useAppStore((state) => state.setAchievements);
  const setTheme = useAppStore((state) => state.setTheme);
  const setInstrument = useAppStore((state) => state.setInstrument);
  const setShowNoteNames = useAppStore((state) => state.setShowNoteNames);
  const setShowKeymap = useAppStore((state) => state.setShowKeymap);
  const setIsRangeManuallySet = useAppStore((state) => state.setIsRangeManuallySet);
  
  return {
    setLocale,
    setMetronomeEnabled,
    setMetronomeBpm,
    setMetronomeBeats,
    setPlayMode,
    setKeyboardType,
    setKeyboardRange,
    setSongs,
    setScores,
    setAchievements,
    setTheme,
    setInstrument,
    setShowNoteNames,
    setShowKeymap,
    setIsRangeManuallySet
  };
};
