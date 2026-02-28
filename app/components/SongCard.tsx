'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Star, Trophy, Lock, ChevronRight } from 'lucide-react';
import { Song } from '../lib/songs';

interface SongCardProps {
  song: Song;
  isSelected: boolean;
  unlocked: boolean;
  highScore: number | null;
  unlockDescription: string;
  onSelect: (song: Song) => void;
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
    <button
      onClick={() => unlocked && onSelect(song)}
      disabled={!unlocked}
      className={`group flex items-center justify-between rounded-2xl border p-5 transition-all relative overflow-hidden ${
        !unlocked 
          ? 'theme-border bg-black/5 dark:bg-white/2 opacity-40 cursor-not-allowed'
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
      
      <div className="flex flex-col items-start gap-2 relative z-10">
        <div className="flex items-center gap-2">
          <span className={`font-black text-xl tracking-tight leading-none ${unlocked ? 'theme-text-primary' : 'theme-text-secondary'}`}>
            {t[`song_${song.id}`] || song.title}
          </span>
          {!unlocked && <Lock className="w-3.5 h-3.5 theme-text-secondary" />}
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`text-[9px] uppercase tracking-[0.2em] font-black px-2 py-0.5 rounded-md border ${
            unlocked ? 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border-indigo-500/20' : 'bg-slate-200 dark:bg-slate-900 text-slate-500 dark:text-slate-700 border-slate-300 dark:border-slate-800'
          }`}>
            {song.style ? (t[`style_${song.style.toLowerCase()}`] || song.style) : ''}
          </span>
          <span className="text-xs theme-text-secondary font-bold uppercase tracking-widest opacity-80">{t[`artist_${song.artist.toLowerCase()}`] || song.artist}</span>
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
      
      <div className="flex flex-col items-end gap-3 relative z-10">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${
                i < song.difficulty 
                  ? unlocked ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'fill-slate-300 dark:fill-slate-700 text-slate-300 dark:text-slate-700'
                  : 'text-slate-200 dark:text-slate-800'
              }`}
            />
          ))}
        </div>
        {unlocked && (
          <div className={`flex items-center gap-1 transition-all ${isSelected ? 'text-indigo-500 dark:text-indigo-400' : 'theme-text-secondary group-hover:text-indigo-500 dark:group-hover:text-indigo-400'}`}>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t.play}</span>
            <ChevronRight className={`h-4 w-4 transition-transform group-hover:translate-x-1`} />
          </div>
        )}
      </div>
    </button>
  );
}
