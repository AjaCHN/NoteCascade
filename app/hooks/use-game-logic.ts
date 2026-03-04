// app/hooks/use-game-logic.ts v2.0.1
import { useState, useEffect, useCallback, useRef } from 'react';
import { Song } from '../lib/songs/types';
import { useAppActions, usePlayMode, useMetronomeEnabled, useMetronomeBpm, useMetronomeBeats, getNextSong } from '../lib/store';
import { initAudio, startTransport, stopTransport, ensureAudioContext, setMetronome } from '../lib/audio';
import { useScoreLogic } from './use-score-logic';
import { usePlaybackLogic } from './use-playback-logic';

export function useGameLogic(
  activeNotes: Map<number, number>,
  setActiveNotes: React.Dispatch<React.SetStateAction<Map<number, number>>>,
  songs: Song[]
) {
  const { incrementPracticeTime } = useAppActions();
  const playMode = usePlayMode();
  const metronomeEnabled = useMetronomeEnabled();
  const metronomeBpm = useMetronomeBpm();
  const metronomeBeats = useMetronomeBeats();

  const [selectedSong, setSelectedSong] = useState<Song>(songs[0] || { id: 'loading', title: 'Loading...', artist: '', difficulty: 0, midiUrl: '' });
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (songs.length > 0 && selectedSong.id === 'loading') {
      const timer = setTimeout(() => setSelectedSong(songs[0]), 0);
      return () => clearTimeout(timer);
    }
  }, [songs, selectedSong.id]);

  // Forward declarations to handle circular dependencies between score and playback logic
  const setIsPlayingRef = useRef<(isPlaying: boolean) => void>(() => {});
  const setCurrentTimeRef = useRef<(time: number) => void>(() => {});

  const { lastScore, setLastScore, handleSongEnd, resetScore } = useScoreLogic(
    selectedSong,
    playMode,
    (isPlaying) => setIsPlayingRef.current(isPlaying),
    (time) => setCurrentTimeRef.current(time),
    setShowResult
  );

  const { isPlaying, setIsPlaying, currentTime, setCurrentTime, togglePlay, resetPlayback } = usePlaybackLogic(
    selectedSong,
    playMode,
    activeNotes,
    setActiveNotes,
    handleSongEnd
  );

  // Update refs
  useEffect(() => {
    setIsPlayingRef.current = setIsPlaying;
    setCurrentTimeRef.current = setCurrentTime;
  }, [setIsPlaying, setCurrentTime]);

  const resetSong = useCallback(() => {
    resetPlayback();
    resetScore();
  }, [resetPlayback, resetScore]);

  useEffect(() => {
    resetSong();
  }, [playMode, resetSong]);

  useEffect(() => {
    const syncMetronome = async () => {
      if (metronomeEnabled) {
        await initAudio();
        await ensureAudioContext();
        if (!isPlaying) startTransport();
      } else if (!isPlaying) {
        stopTransport();
      }
      setMetronome(metronomeEnabled, metronomeBpm, metronomeBeats);
    };
    syncMetronome();
  }, [metronomeEnabled, metronomeBpm, metronomeBeats, isPlaying]);

  const prevActiveNotesSize = useRef(0);
  useEffect(() => {
    if (activeNotes.size > 0 && prevActiveNotesSize.current === 0 && !isPlaying) {
      togglePlay();
    }
    prevActiveNotesSize.current = activeNotes.size;
  }, [activeNotes.size, isPlaying, togglePlay]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && (playMode === 'perform' || playMode === 'practice')) {
      interval = setInterval(() => incrementPracticeTime(1), 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playMode, incrementPracticeTime]);

  const handleNextSong = useCallback(() => {
    const nextSong = getNextSong(selectedSong, songs);
    if (nextSong) {
      setSelectedSong(nextSong);
      resetSong();
    }
  }, [selectedSong, resetSong, songs]);

  return {
    selectedSong, setSelectedSong, isPlaying, currentTime, showResult, setShowResult,
    lastScore, setLastScore, togglePlay, resetSong, handleNextSong
  };
}

