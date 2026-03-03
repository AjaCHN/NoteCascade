// app/hooks/use-game-logic.ts v1.7.2
import { useState, useEffect, useCallback, useRef } from 'react';
import * as Tone from 'tone';
import { Song, builtInSongs } from '../lib/songs';
import { useAppActions, usePlayMode, useMetronomeEnabled, useMetronomeBpm, useMetronomeBeats, getNextSong } from '../lib/store';
import { ScoreRecord } from '../lib/store/types';
import { initAudio, startTransport, stopTransport, clearScheduledEvents, ensureAudioContext, setMetronome, scheduleNote, resetAudioEffects } from '../lib/audio';

import { usePracticeLogic } from './use-practice-logic';

export function useGameLogic(
  activeNotes: Map<number, number>,
  setActiveNotes: React.Dispatch<React.SetStateAction<Map<number, number>>>
) {
  const { addScore, incrementPracticeTime, updateStreak } = useAppActions();
  const playMode = usePlayMode();
  const metronomeEnabled = useMetronomeEnabled();
  const metronomeBpm = useMetronomeBpm();
  const metronomeBeats = useMetronomeBeats();

  const [selectedSong, setSelectedSong] = useState<Song>(builtInSongs[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [lastScore, setLastScore] = useState<ScoreRecord>({
    songId: '',
    score: 0,
    maxScore: 0,
    accuracy: 0,
    perfect: 0,
    good: 0,
    miss: 0,
    wrong: 0,
    maxCombo: 0,
    date: 0
  });
  const latestScoreRef = useRef(lastScore);

  const { handlePracticePause } = usePracticeLogic(playMode, selectedSong, activeNotes);

  const resetSong = useCallback(() => {
    setIsPlaying(false);
    stopTransport();
    resetAudioEffects();
    setCurrentTime(0);
    setLastScore({
      songId: '',
      score: 0,
      maxScore: 0,
      accuracy: 0,
      perfect: 0,
      good: 0,
      miss: 0,
      wrong: 0,
      maxCombo: 0,
      date: 0
    });
  }, []);

  useEffect(() => {
    latestScoreRef.current = lastScore;
  }, [lastScore]);

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

  const handleScoreUpdate = useCallback((scoreData: { perfect: number; good: number; miss: number; wrong: number; currentScore: number }) => {
    setLastScore(prev => ({
      ...prev,
      ...scoreData,
      score: scoreData.currentScore
    }));
  }, []);

  const handleSongEnd = useCallback(() => {
    if (playMode === 'demo' || playMode === 'free') {
      setIsPlaying(false);
      setCurrentTime(0);
      return;
    }

    const currentScoreData = latestScoreRef.current;
    const totalNotes = currentScoreData.perfect + currentScoreData.good + currentScoreData.miss + currentScoreData.wrong;
    const accuracy = totalNotes > 0 ? (currentScoreData.perfect + currentScoreData.good) / totalNotes : 0;
    const maxScore = (selectedSong.notes?.length || 0) * 100;

    addScore({
      songId: selectedSong.id,
      score: currentScoreData.score,
      maxScore,
      accuracy,
      perfect: currentScoreData.perfect,
      good: currentScoreData.good,
      miss: currentScoreData.miss,
      wrong: currentScoreData.wrong,
      maxCombo: 0,
      date: Date.now(),
    });

    if (accuracy > 0.8) {
      import('canvas-confetti').then((confetti) => {
        confetti.default({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      });
    }
    
    updateStreak();
    setShowResult(true);
  }, [updateStreak, addScore, selectedSong.id, selectedSong.notes?.length, playMode]);

  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      setIsPlaying(false);
      stopTransport();
      resetAudioEffects();
      clearScheduledEvents();
      setActiveNotes(new Map());
    } else {
      await initAudio();
      await ensureAudioContext();
      
      if (currentTime >= (selectedSong.duration || 0)) setCurrentTime(0);
      Tone.Transport.seconds = currentTime;

      if (playMode === 'demo') {
        clearScheduledEvents();
        selectedSong.notes?.forEach(note => {
          scheduleNote(
            note,
            () => setActiveNotes(prev => new Map(prev).set(note.midi, note.velocity)),
            () => setActiveNotes(prev => {
              const next = new Map(prev);
              next.delete(note.midi);
              return next;
            })
          );
        });
      }

      setIsPlaying(true);
      startTransport();
    }
  }, [isPlaying, currentTime, selectedSong, playMode, setActiveNotes]);

  const prevActiveNotesSize = useRef(0);
  useEffect(() => {
    if (activeNotes.size > 0 && prevActiveNotesSize.current === 0 && !isPlaying) {
      togglePlay();
    }
    prevActiveNotesSize.current = activeNotes.size;
  }, [activeNotes.size, isPlaying, togglePlay]);

  useEffect(() => {
    let animationFrame: number;
    const updateTime = () => {
      if (isPlaying) {
        let time = Tone.Transport.seconds;
        time = handlePracticePause(time);
        setCurrentTime(time);
        
        if (time >= (selectedSong.duration || 0)) {
           setIsPlaying(false);
           stopTransport();
           resetAudioEffects();
           clearScheduledEvents();
           handleSongEnd();
           setActiveNotes(new Map());
           return;
        }
        animationFrame = requestAnimationFrame(updateTime);
      }
    };
    
    if (isPlaying) updateTime();
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, selectedSong, handleSongEnd, setActiveNotes, playMode, activeNotes, handlePracticePause]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && (playMode === 'perform' || playMode === 'practice')) {
      interval = setInterval(() => incrementPracticeTime(1), 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playMode, incrementPracticeTime]);

  const handleNextSong = useCallback(() => {
    const nextSong = getNextSong(selectedSong);
    if (nextSong) {
      setSelectedSong(nextSong);
      resetSong();
    }
  }, [selectedSong, resetSong]);

  return {
    selectedSong, setSelectedSong, isPlaying, currentTime, showResult, setShowResult,
    lastScore, setLastScore: handleScoreUpdate, togglePlay, resetSong, handleNextSong
  };
}

