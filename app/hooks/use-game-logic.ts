// app/hooks/use-game-logic.ts v2.4.2
'use client';
import { useState } from 'react';
import { Song } from '../lib/songs';

export function useGameLogic(
  activeNotes: Map<number, number>, 
  setActiveNotes: (notes: Map<number, number> | ((prev: Map<number, number>) => Map<number, number>)) => void, 
  songs: Song[]
) {
  const [gameState, setGameState] = useState('idle');
  const [score, setScore] = useState(0);
  const [selectedSong, setSelectedSong] = useState<Song | null>(songs[0] || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [lastScore, setLastScore] = useState<{ perfect: number; good: number; miss: number; wrong: number; currentScore: number } | null>(null);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const resetSong = () => setCurrentTime(0);
  const handleNextSong = () => {
    const currentIndex = songs.findIndex(s => s.id === selectedSong?.id);
    const nextSong = songs[(currentIndex + 1) % songs.length];
    setSelectedSong(nextSong);
  };

  return { 
    gameState, 
    score, 
    setGameState, 
    setScore,
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
