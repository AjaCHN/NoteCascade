// app/hooks/use-game-logic.ts v2.3.1
import { useState, useEffect, useCallback, useRef } from 'react';
import * as Tone from 'tone';
import confetti from 'canvas-confetti';
import { Song, builtInSongs } from '../lib/songs';
import { useAppActions, usePlayMode, useMetronomeEnabled, useMetronomeBpm, useMetronomeBeats, getNextSong } from '../lib/store';
import { initAudio, startTransport, stopTransport, clearScheduledEvents, ensureAudioContext, setMetronome, scheduleNote } from '../lib/audio';
import { ScoreData } from './game/types';

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
  const currentTimeRef = useRef(0);
  const [showResult, setShowResult] = useState(false);
  const [lastScore, setLastScore] = useState<ScoreData>({ perfect: 0, good: 0, miss: 0, wrong: 0, currentScore: 0 });
  const latestScoreRef = useRef(lastScore);

  const resetSong = useCallback(() => {
    setIsPlaying(false);
    stopTransport();
    setCurrentTime(0);
    currentTimeRef.current = 0;
    setLastScore({ perfect: 0, good: 0, miss: 0, wrong: 0, currentScore: 0 });
  }, []);

  useEffect(() => { latestScoreRef.current = lastScore; }, [lastScore]);
  useEffect(() => { currentTimeRef.current = currentTime; }, [currentTime]);
  useEffect(() => { setTimeout(() => resetSong(), 0); }, [playMode, resetSong]);

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
    if (playMode === 'demo' || playMode === 'free-play') {
      setIsPlaying(false);
      setCurrentTime(0);
      currentTimeRef.current = 0;
      return;
    }

    const { perfect, good, miss, wrong, currentScore } = latestScoreRef.current;
    
    // Prevent multiple calls to handleSongEnd for the same song
    if (showResult) return;

    const totalNotes = perfect + good + miss + wrong;
    const accuracy = totalNotes > 0 ? (perfect + good) / totalNotes : 0;
    const maxScore = (selectedSong.notes?.length || 0) * 100;

    addScore({
      songId: selectedSong.id, score: currentScore, maxScore, accuracy,
      perfect, good, miss, wrong, maxCombo: 0, date: Date.now(),
    });

    if (accuracy > 0.8) confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    updateStreak();
    setShowResult(true);
  }, [updateStreak, addScore, selectedSong.id, selectedSong.notes?.length, playMode, showResult]);

  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      setIsPlaying(false);
      stopTransport();
      clearScheduledEvents();
      setActiveNotes(new Map());
    } else {
      await initAudio();
      await ensureAudioContext();
      
      const currentT = currentTimeRef.current;
      Tone.Transport.seconds = currentT >= (selectedSong.duration || 0) ? 0 : currentT;
      if (Tone.Transport.seconds === 0) { setCurrentTime(0); currentTimeRef.current = 0; }

      if (playMode === 'demo') {
        clearScheduledEvents();
        selectedSong.notes?.forEach(note => {
          scheduleNote(note, 
            () => setActiveNotes(prev => new Map(prev).set(note.midi, note.velocity)),
            () => setActiveNotes(prev => { const n = new Map(prev); n.delete(note.midi); return n; })
          );
        });
      }

      setIsPlaying(true);
      startTransport();
    }
  }, [isPlaying, selectedSong, playMode, setActiveNotes]);

  const prevActiveNotesSize = useRef(0);
  useEffect(() => {
    if (playMode !== 'free-play' && activeNotes.size > 0 && prevActiveNotesSize.current === 0 && !isPlaying) {
      setTimeout(() => togglePlay(), 0);
    }
    prevActiveNotesSize.current = activeNotes.size;
  }, [activeNotes.size, isPlaying, togglePlay, playMode]);

  useEffect(() => {
    let animationFrame: number;
    const updateTime = () => {
      if (isPlaying) {
        let time = Tone.Transport.seconds;
        if (playMode === 'practice') {
           const notesToHit = selectedSong.notes?.filter(n => Math.abs(n.time - time) <= 0.05) || [];
           const allHit = notesToHit.every(n => activeNotes.has(n.midi));
           if (notesToHit.length > 0 && !allHit) {
              if (Tone.Transport.state === 'started') Tone.Transport.pause();
              const firstUnhit = notesToHit.find(n => !activeNotes.has(n.midi));
              if (firstUnhit) {
                 time = firstUnhit.time;
                 if (Math.abs(Tone.Transport.seconds - time) > 0.001) Tone.Transport.seconds = time;
              }
           } else if (Tone.Transport.state === 'paused') {
              Tone.Transport.start();
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
    if (isPlaying) updateTime();
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, selectedSong, handleSongEnd, setActiveNotes, playMode, activeNotes]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && playMode === 'practice') interval = setInterval(() => incrementPracticeTime(1), 1000);
    return () => clearInterval(interval);
  }, [isPlaying, playMode, incrementPracticeTime]);

  const handleNextSong = useCallback(() => {
    const nextSong = getNextSong(selectedSong);
    if (nextSong) { setSelectedSong(nextSong); resetSong(); }
  }, [selectedSong, resetSong]);

  return {
    selectedSong, setSelectedSong, isPlaying, currentTime, showResult, setShowResult,
    lastScore, setLastScore, togglePlay, resetSong, handleNextSong
  };
}
