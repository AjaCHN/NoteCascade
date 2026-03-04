// app/hooks/use-countdown-and-prompts.ts v2.0.1
'use client';

import { useState, useEffect } from 'react';

export function useCountdownAndPrompts(
  isPlaying: boolean,
  togglePlay: () => void,
  activeNotesSize: number,
  playMode: string
) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [hasPressedKey, setHasPressedKey] = useState(false);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setCountdown(null);
        if (!isPlaying) togglePlay();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [countdown, isPlaying, togglePlay]);

  useEffect(() => {
    if (activeNotesSize > 0 && !hasPressedKey) {
      const timer = setTimeout(() => setHasPressedKey(true), 0);
      return () => clearTimeout(timer);
    }
  }, [activeNotesSize, hasPressedKey]);

  useEffect(() => {
    if (playMode === 'free') {
      const timer = setTimeout(() => setHasPressedKey(false), 0);
      return () => clearTimeout(timer);
    }
  }, [playMode]);

  return { countdown, setCountdown, hasPressedKey, setHasPressedKey };
}
