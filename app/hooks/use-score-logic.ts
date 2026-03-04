// app/hooks/use-score-logic.ts v2.0.1
import { useState, useCallback, useRef, useEffect } from 'react';
import { Song } from '../lib/songs/types';
import { ScoreRecord } from '../lib/store/types';
import { useAppActions } from '../lib/store';

export function useScoreLogic(
  selectedSong: Song,
  playMode: string,
  setIsPlaying: (isPlaying: boolean) => void,
  setCurrentTime: (time: number) => void,
  setShowResult: (show: boolean) => void
) {
  const { addScore, updateStreak } = useAppActions();
  
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
    latestScoreRef.current = lastScore;
  }, [lastScore]);

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
  }, [playMode, selectedSong, addScore, updateStreak, setIsPlaying, setCurrentTime, setShowResult]);

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

  return {
    lastScore,
    setLastScore: handleScoreUpdate,
    handleSongEnd,
    resetScore
  };
}
