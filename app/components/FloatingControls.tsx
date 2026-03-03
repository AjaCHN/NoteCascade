import React from 'react';
import { motion } from 'motion/react';
import { RotateCcw, RefreshCw, Play, Pause, SkipForward } from 'lucide-react';
import { Song } from '../lib/songs';

interface FloatingControlsProps {
  playMode: string;
  isPlaying: boolean;
  currentTime: number;
  selectedSong: Song;
  resetSong: () => void;
  togglePlay: () => void;
  handleNextSong: () => void;
  t: Record<string, string>;
}

export function FloatingControls({
  playMode,
  isPlaying,
  currentTime,
  selectedSong,
  resetSong,
  togglePlay,
  handleNextSong,
  t
}: FloatingControlsProps) {
  if (playMode !== 'demo' && playMode !== 'perform') return null;

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-3 z-40">
      <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md p-2 rounded-2xl border theme-border shadow-lg">
        <div className="flex items-center gap-1">
          <button onClick={resetSong} className="p-2 theme-text-secondary hover:theme-text-primary rounded-full hover:bg-white/10 transition-colors" title={t.reset}>
            <RotateCcw className="w-4 h-4" />
          </button>
          <button onClick={() => { resetSong(); togglePlay(); }} className="p-2 theme-text-secondary hover:theme-text-primary rounded-full hover:bg-white/10 transition-colors" title={t.retry}>
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="w-px h-6 bg-white/10 mx-1"></div>
        <button onClick={togglePlay} className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg shadow-indigo-500/40 hover:bg-indigo-400 hover:scale-105 active:scale-95 transition-all">
          {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-1" />}
        </button>
        <div className="w-px h-6 bg-white/10 mx-1"></div>
        <button onClick={handleNextSong} className="p-2 theme-text-secondary hover:theme-text-primary rounded-full hover:bg-white/10 transition-colors" title={t.nextSong}>
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="bg-black/40 backdrop-blur-md p-3 rounded-2xl border theme-border shadow-lg w-64">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest theme-text-secondary mb-1.5">
          <span>{Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')}</span>
          <span>{Math.floor((selectedSong.duration || 0) / 60)}:{((selectedSong.duration || 0) % 60).toFixed(0).padStart(2, '0')}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden border theme-border">
          <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${(currentTime / (selectedSong.duration || 1)) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
