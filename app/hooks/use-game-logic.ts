// app/hooks/use-game-logic.ts v1.3.5
import { useState, useEffect, useCallback, useRef } from 'react';
import * as Tone from 'tone';
import { Song, builtInSongs } from '../lib/songs';
import { useAppActions, usePlayMode, useMetronomeEnabled, useMetronomeBpm, useMetronomeBeats, getNextSong } from '../lib/store';
import { initAudio, startTransport, stopTransport, clearScheduledEvents, ensureAudioContext, setMetronome, scheduleNote } from '../lib/audio';

export function useGameLogic(
  activeNotes: Map<number, number>,
  setActiveNotes: React.Dispatch<React.SetStateAction<Map<number, number>>>
) {
  const { 
    addScore, incrementPracticeTime, updateStreak
  } = useAppActions();
  const playMode = usePlayMode();
  const metronomeEnabled = useMetronomeEnabled();
  const metronomeBpm = useMetronomeBpm();
  const metronomeBeats = useMetronomeBeats();

  const [selectedSong, setSelectedSong] = useState<Song>(builtInSongs[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [lastScore, setLastScore] = useState({ perfect: 0, good: 0, miss: 0, wrong: 0, currentScore: 0 });

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

  const handleSongEnd = useCallback(() => {
    if (playMode === 'demo') {
      setIsPlaying(false);
      setCurrentTime(0);
      return;
    }

    const totalNotes = lastScore.perfect + lastScore.good + lastScore.miss + lastScore.wrong;
    const accuracy = totalNotes > 0 ? (lastScore.perfect + lastScore.good) / totalNotes : 0;

    const maxScore = (selectedSong.notes?.length || 0) * 100;

    addScore({
      songId: selectedSong.id,
      score: lastScore.currentScore,
      maxScore,
      accuracy,
      perfect: lastScore.perfect,
      good: lastScore.good,
      miss: lastScore.miss,
      wrong: lastScore.wrong,
      maxCombo: 0,
      date: Date.now(),
    });

    if (accuracy > 0.8) {
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      });
    }
    
    updateStreak();
    setShowResult(true);
  }, [lastScore, updateStreak, addScore, selectedSong.id, selectedSong.notes?.length, playMode]);

  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      setIsPlaying(false);
      stopTransport();
      clearScheduledEvents();
      setActiveNotes(new Map());
    } else {
      await initAudio();
      await ensureAudioContext();
      
      if (currentTime >= (selectedSong.duration || 0)) {
        setCurrentTime(0);
      }
      Tone.Transport.seconds = currentTime;

      // Schedule notes for Demo mode
      if (playMode === 'demo') {
        clearScheduledEvents();
        selectedSong.notes?.forEach(note => {
          scheduleNote(
            note,
            () => {
              // On Start
              setActiveNotes(prev => new Map(prev).set(note.midi, note.velocity));
            },
            () => {
              // On End
              setActiveNotes(prev => {
                const next = new Map(prev);
                next.delete(note.midi);
                return next;
              });
            }
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      togglePlay();
    }
    prevActiveNotesSize.current = activeNotes.size;
  }, [activeNotes.size, isPlaying, togglePlay]);

  // Update currentTime from Transport
  useEffect(() => {
    let animationFrame: number;
    const updateTime = () => {
      if (isPlaying) {
        const time = Tone.Transport.seconds;
        setCurrentTime(time);
        
        if (time >= (selectedSong.duration || 0)) {
           setIsPlaying(false);
           stopTransport();
           clearScheduledEvents();
           handleSongEnd();
           setCurrentTime(0);
           setActiveNotes(new Map());
           return;
        }

        animationFrame = requestAnimationFrame(updateTime);
      }
    };
    
    if (isPlaying) {
      updateTime();
    }
    
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, selectedSong.duration, handleSongEnd, setActiveNotes]);

  // Practice time accumulator (approximate)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && playMode === 'perform') {
      interval = setInterval(() => {
        incrementPracticeTime(1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playMode, incrementPracticeTime]);

  const resetSong = useCallback(() => {
    setIsPlaying(false);
    stopTransport();
    setCurrentTime(0);
    setLastScore({ perfect: 0, good: 0, miss: 0, wrong: 0, currentScore: 0 });
  }, []);

  const handleNextSong = useCallback(() => {
    const nextSong = getNextSong(selectedSong);
    if (nextSong) {
      setSelectedSong(nextSong);
      resetSong();
    }
  }, [selectedSong, resetSong]);

  return {
    selectedSong,
    setSelectedSong,
    isPlaying,
    currentTime,
    showResult,
    setShowResult,
    lastScore,
    setLastScore,
    togglePlay,
    resetSong,
    handleNextSong
  };
}
