// app/components/SongCard.tsx v2.3.1
'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Lock, Play, Keyboard as KeyboardIcon } from 'lucide-react';
import { Song } from '../lib/songs';

interface SongCardProps {
  song: Song;
  isSelected: boolean;
  unlocked: boolean;
  highScore: number | null;
  unlockDescription: string;
  onSelect: (song: Song, mode?: 'demo' | 'practice') => void;
  t: Record<string, string>;
}

export function SongCard({ 
  song, 
  isSelected, 
  unlocked, 
  highScore, 
  unlockDescription, 
  onSelect, 
  t 
}: SongCardProps) {
  return (
    <div
      className={`group flex items-center justify-between rounded-2xl border p-5 transition-all relative overflow-hidden ${
        !unlocked 
          ? 'theme-border bg-black/5 dark:bg-white/2 opacity-40'
          : isSelected
            ? 'border-indigo-500 bg-indigo-500/10 shadow-xl shadow-indigo-500/10'
            : 'theme-border theme-bg-secondary hover:border-indigo-500/30 hover:bg-indigo-500/5 hover:scale-[1.02] active:scale-[0.98]'
      }`}
    >
      {isSelected && (
        <motion.div 
          layoutId="active-song-glow"
          className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent pointer-events-none"
        />
      )}
      
      <div className="flex flex-col items-start gap-2 relative z-10 min-w-0 flex-1 cursor-pointer" onClick={() => unlocked && onSelect(song)}>
        <div className="flex items-center gap-2 w-full">
          <div className="flex-1 min-w-0 overflow-x-auto custom-scrollbar-mini pb-1">
            <span className={`font-black text-xl tracking-tight leading-none whitespace-nowrap ${unlocked ? 'theme-text-primary' : 'theme-text-secondary'}`}>
              {t[`song_${song.id}`] || song.title}
            </span>
          </div>
          {!unlocked && <Lock className="w-3.5 h-3.5 theme-text-secondary shrink-0" />}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`text-[9px] uppercase tracking-[0.2em] font-black px-2 py-0.5 rounded-md border shrink-0 ${
              unlocked 
                ? song.difficulty === 1 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                  song.difficulty === 2 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                  song.difficulty === 3 ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                  'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                : 'bg-slate-200 dark:bg-slate-900 text-slate-500 dark:text-slate-700 border-slate-300 dark:border-slate-800'
            }`}>
              {t[`diff_${song.difficulty}`] || song.difficulty}
            </span>
            <span className={`text-[9px] uppercase tracking-[0.2em] font-black px-2 py-0.5 rounded-md border shrink-0 ${
              unlocked ? 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20' : 'bg-slate-200 dark:bg-slate-900 text-slate-500 dark:text-slate-700 border-slate-300 dark:border-slate-800'
            }`}>
              {song.style ? (t[`style_${song.style.toLowerCase()}`] || song.style) : ''}
            </span>
            <span className="text-xs theme-text-secondary font-bold uppercase tracking-widest opacity-80 truncate">{t[`artist_${song.artist.toLowerCase()}`] || song.artist}</span>
          </div>
        </div>
        
        {unlocked ? (
          highScore !== null && (
            <div className="flex items-center gap-1.5 mt-1 text-amber-500 dark:text-amber-400/90">
              <Trophy className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black tabular-nums tracking-widest">{highScore.toLocaleString()}</span>
            </div>
          )
        ) : (
          <div className="flex items-center gap-1.5 mt-1 text-rose-500 dark:text-rose-400/80">
            <Lock className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{unlockDescription}</span>
          </div>
        )}
      </div>

      {unlocked && (
        <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <button 
            onClick={() => onSelect(song, 'demo')}
            className="p-2 rounded-full bg-indigo-500 text-white hover:bg-indigo-600 transition-all shadow-lg"
            title={t.demo}
          >
            <Play className="w-4 h-4 fill-current" />
          </button>
          <button 
            onClick={() => onSelect(song, 'practice')}
            className="p-2 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-lg"
            title={t.practice}
          >
            <KeyboardIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
