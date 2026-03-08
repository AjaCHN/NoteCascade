// app/hooks/use-countdown-and-prompts.ts v2.4.2
'use client';
import { useState } from 'react';
import type { PlayMode } from '../lib/store';

export function useCountdownAndPrompts(
  isPlaying: boolean, 
  togglePlay: () => void, 
  activeNotesSize: number, 
  playMode: PlayMode
) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [hasPressedKey, setHasPressedKey] = useState(false);
  const [prompt, setPrompt] = useState<string | null>(null);

  return { countdown, setCountdown, hasPressedKey, setHasPressedKey, prompt, setPrompt, isPlaying, togglePlay, activeNotesSize, playMode };
}
