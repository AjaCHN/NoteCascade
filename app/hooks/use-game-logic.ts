// app/hooks/use-game-logic.ts v2.0.1
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import * as Tone from 'tone';
import { Song } from '../lib/songs/types';
import { useAppActions, usePlayMode, useMetronomeEnabled, useMetronomeBpm, useMetronomeBeats } from '../lib/store';
import { getNextSong } from '../lib/songs/utils';
import { initAudio, startTransport, stopTransport, ensureAudioContext, setMetronome, clearScheduledEvents, scheduleNote, resetAudioEffects } from '../lib/audio';
import { ScoreRecord } from '../lib/store/types';

export function useGameLogic(
  activeNotes: Map<number, number>,
  setActiveNotes: React.Dispatch<React.SetStateAction<Map<number, number>>>,
  songs: Song[]
) {
  const { incrementPracticeTime, addScore, updateStreak } = useAppActions();
  const playMode = usePlayMode();
  const metronomeEnabled = useMetronomeEnabled();
  const metronomeBpm = useMetronomeBpm();
  const metronomeBeats = useMetronomeBeats();

  const [selectedSong, setSelectedSong] = useState<Song>(songs[0] || { id: 'loading', title: 'Loading...', artist: '', difficulty: 0, midiUrl: '' });
  const [showResult, setShowResult] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  
  const handlePracticePause = useCallback((time: number): number => {
    if (playMode !== 'practice') return time;

    const notesToHit = selectedSong.notes?.filter(n => 
      n.time >= time - 0.05 && 
      n.time <= time + 0.05
    ) || [];
    
    const allHit = notesToHit.every(n => activeNotes.has(n.midi));
    
    if (notesToHit.length > 0 && !allHit) {
      if (Tone.Transport.state === 'started') {
        Tone.Transport.pause();
      }
      const firstUnhit = notesToHit.find(n => !activeNotes.has(n.midi));
      if (firstUnhit) {
        const newTime = firstUnhit.time;
        if (Math.abs(Tone.Transport.seconds - newTime) > 0.001) {
          Tone.Transport.seconds = newTime;
        }
        return newTime;
      }
    } else {
      if (Tone.Transport.state === 'paused') {
        Tone.Transport.start();
      }
    }
    return time;
  }, [playMode, selectedSong, activeNotes]);

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

  useEffect(() => {
    if (songs.length > 0 && selectedSong.id === 'loading') {
      const timer = setTimeout(() => setSelectedSong(songs[0]), 0);
      return () => clearTimeout(timer);
    }
  }, [songs, selectedSong.id]);

  useEffect(() => {
    latestScoreRef.current = lastScore;
  }, [lastScore]);

  const handleScoreUpdate = useCallback((scoreData: { perfect: number; good: number; miss: number; wrong: number; currentScore: number }) => {
    setLastScore(prev => ({
      ...prev,
      ...scoreData,
      score: scoreData.currentScore
    }));
  }, []);

  const resetScore = useCallback(() => {
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
  }, [playMode, selectedSong, addScore, updateStreak]);

  const resetPlayback = useCallback(() => {
    setIsPlaying(false);
    stopTransport();
    resetAudioEffects();
    setCurrentTime(0);
  }, []);

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
    lastScore, setLastScore: handleScoreUpdate, togglePlay, resetSong, handleNextSong
  };
}

