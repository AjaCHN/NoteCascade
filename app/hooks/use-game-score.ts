// app/hooks/use-game-score.ts v2.0.0
import { useState, useCallback, useRef, useEffect } from 'react';
import type { ScoreRecord } from '../lib/store/types';

export function useGameScore() {
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
    latestScoreRef,
    handleScoreUpdate,
    resetScore
  };
}
