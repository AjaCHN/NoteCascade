// app/components/GameOverlays.tsx v2.4.2
'use client';

import type { PlayMode } from '../lib/store';
import type { Translation } from '../lib/translations';

interface GameOverlaysProps {
  countdown: number | null;
  playMode: PlayMode;
  hasPressedKey: boolean;
  isPlaying: boolean;
  t: Translation;
}

export function GameOverlays({
  countdown,
  playMode,
  hasPressedKey,
  isPlaying,
  t
}: GameOverlaysProps) {
  if (!isPlaying && !countdown && !hasPressedKey) return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none z-40 flex items-center justify-center">
      {countdown !== null && (
        <div className="text-8xl font-bold text-white animate-ping">
          {countdown}
        </div>
      )}
      {!isPlaying && !countdown && playMode === 'practice' && !hasPressedKey && (
        <div className="text-2xl font-medium text-white/80 bg-black/40 px-6 py-3 rounded-full backdrop-blur-sm">
          {t.game.ready}
        </div>
      )}
    </div>
  );
}
