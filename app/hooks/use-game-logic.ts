// app/hooks/use-game-logic.ts v1.7.2
import { useState, useEffect, useCallback, useRef } from 'react';
import * as Tone from 'tone';
import { Song, builtInSongs } from '../lib/songs';
import { useAppActions, usePlayMode, useMetronomeEnabled, useMetronomeBpm, useMetronomeBeats, getNextSong } from '../lib/store';
import { initAudio, startTransport, stopTransport, clearScheduledEvents, ensureAudioContext, setMetronome, scheduleNote, resetAudioEffects } from '../lib/audio';

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
  const latestScoreRef = useRef(lastScore);

  const resetSong = useCallback(() => {
    setIsPlaying(false);
    stopTransport();
    resetAudioEffects();
    setCurrentTime(0);
    setLastScore({ perfect: 0, good: 0, miss: 0, wrong: 0, currentScore: 0 });
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
      score: currentScoreData.currentScore,
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
        confetti.default({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      });
    }
    
    updateStreak();
    setShowResult(true);
  }, [updateStreak, addScore, selectedSong.id, selectedSong.notes?.length, playMode]);

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
      togglePlay();
    }
    prevActiveNotesSize.current = activeNotes.size;
  }, [activeNotes.size, isPlaying, togglePlay]);

  // Update currentTime from Transport
  useEffect(() => {
    let animationFrame: number;
    const updateTime = () => {
      if (isPlaying) {
        let time = Tone.Transport.seconds;

        // Practice Mode Logic
        if (playMode === 'practice') {
           // Find notes that are "current" (within a small window)
           const notesToHit = selectedSong.notes?.filter(n => 
              n.time >= time - 0.05 && 
              n.time <= time + 0.05
           ) || [];
           
           const allHit = notesToHit.every(n => activeNotes.has(n.midi));
           
           if (notesToHit.length > 0 && !allHit) {
              if (Tone.Transport.state === 'started') {
                 Tone.Transport.pause();
              }
              // Snap to the note time
              const firstUnhit = notesToHit.find(n => !activeNotes.has(n.midi));
              if (firstUnhit) {
                 time = firstUnhit.time;
                 if (Math.abs(Tone.Transport.seconds - time) > 0.001) {
                    Tone.Transport.seconds = time;
                 }
              }
           } else {
              if (Tone.Transport.state === 'paused') {
                 Tone.Transport.start();
              }
           }
        }

        setCurrentTime(time);
        
        if (time >= (selectedSong.duration || 0)) {
           setIsPlaying(false);
           stopTransport();
           clearScheduledEvents();
           handleSongEnd();
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
  }, [isPlaying, selectedSong, handleSongEnd, setActiveNotes, playMode, activeNotes]);

  // Practice time accumulator (approximate)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && (playMode === 'perform' || playMode === 'practice')) {
      interval = setInterval(() => {
        incrementPracticeTime(1);
      }, 1000);
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
