import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface GameOverlaysProps {
  countdown: number | null;
  playMode: string;
  hasPressedKey: boolean;
  isPlaying: boolean;
  t: Record<string, string>;
}

export function GameOverlays({
  countdown,
  playMode,
  hasPressedKey,
  isPlaying,
  t
}: GameOverlaysProps) {
  return (
    <>
      {/* Countdown Overlay */}
      <AnimatePresence>
        {countdown !== null && countdown > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <span className="text-9xl font-black text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
              {countdown}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prompts Overlay */}
      <AnimatePresence>
        {playMode === 'practice' && !hasPressedKey && !isPlaying && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none"
          >
            <div className="bg-black/60 backdrop-blur-md px-8 py-4 rounded-3xl border theme-border shadow-2xl">
              <span className="text-xl font-bold text-white tracking-widest uppercase">
                {t.pressKeyToStart || 'Press any key to start practice'}
              </span>
            </div>
          </motion.div>
        )}
        {playMode === 'free' && !hasPressedKey && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none"
          >
            <div className="bg-black/60 backdrop-blur-md px-8 py-4 rounded-3xl border theme-border shadow-2xl">
              <span className="text-xl font-bold text-white tracking-widest uppercase">
                {t.feelFreeToPlay || 'Feel free to play'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
