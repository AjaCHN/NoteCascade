// app/hooks/use-countdown-and-prompts.ts v2.3.2
'use client';
import { useState } from 'react';

export function useCountdownAndPrompts(isPlaying: boolean, togglePlay: any, activeNotesSize: number, playMode: string) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [hasPressedKey, setHasPressedKey] = useState(false);
  const [prompt, setPrompt] = useState<string | null>(null);

  return { countdown, setCountdown, hasPressedKey, setHasPressedKey, prompt };
}
