// app/components/SongCard.tsx v1.7.2
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Trophy, Lock, Play, Keyboard as KeyboardIcon } from 'lucide-react';
import { Translation } from '../lib/translations';
import type { Song } from '../lib/songs';

interface SongCardProps {
  song: Song;
  isSelected: boolean;
  unlocked: boolean;
  highScore: number | null;
  unlockDescription: string;
  onPlayPractice: (song: Song) => void;
  onPlayDemo: (song: Song) => void;
  t: Translation;
}

export function SongCard({ 
  song, 
  isSelected, 
  unlocked, 
  highScore, 
  unlockDescription, 
  onPlayPractice,
  onPlayDemo,
  t 
}: SongCardProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      onMouseEnter={() => unlocked && setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={() => unlocked && setShowActions(!showActions)}
      className={`group flex flex-col justify-between rounded-2xl border p-5 transition-all relative overflow-hidden ${
        !unlocked 
          ? 'theme-border bg-black/5 dark:bg-white/2 opacity-40 cursor-not-allowed'
          : isSelected
            ? 'border-indigo-500 bg-indigo-500/10 shadow-xl shadow-indigo-500/10'
            : 'theme-border theme-bg-secondary hover:border-indigo-500/30 hover:bg-indigo-500/5 cursor-pointer'
      }`}
    >
      {isSelected && (
        <motion.div 
          layoutId="active-song-glow"
          className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent pointer-events-none"
        />
      )}
      
      <div className="flex flex-col items-start gap-2 relative z-10 min-w-0 flex-1 w-full">
        <div className="flex items-center gap-2 w-full">
          <div className="flex-1 min-w-0 overflow-x-auto custom-scrollbar-mini pb-1">
            <span className={`font-black text-xl tracking-tight leading-none whitespace-nowrap ${unlocked ? 'theme-text-primary' : 'theme-text-secondary'}`}>
              {t.songs[song.id as keyof typeof t.songs] || song.title}
            </span>
          </div>
          {!unlocked && <Lock className="w-3.5 h-3.5 theme-text-secondary shrink-0" />}
        </div>
        
        <div className="flex items-center gap-3 w-full">
          <div className="flex gap-0.5 shrink-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < song.difficulty 
                    ? unlocked ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'fill-slate-300 dark:fill-slate-700 text-slate-300 dark:text-slate-700'
                    : 'text-slate-200 dark:text-slate-800'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className={`text-[9px] uppercase tracking-[0.2em] font-black px-2 py-0.5 rounded-md border shrink-0 ${
              unlocked ? 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border-indigo-500/20' : 'bg-slate-200 dark:bg-slate-900 text-slate-500 dark:text-slate-700 border-slate-300 dark:border-slate-800'
            }`}>
              {song.style ? (t.settings[`style_${song.style.toLowerCase()}` as keyof typeof t.settings] || song.style) : ''}
            </span>
            <span className="text-xs theme-text-secondary font-bold uppercase tracking-widest opacity-80 truncate">{t.artists[song.artist.toLowerCase() as keyof typeof t.artists] || song.artist}</span>
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

      <AnimatePresence>
        {showActions && unlocked && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="flex gap-2 w-full relative z-20"
          >
            <button
              onClick={(e) => { e.stopPropagation(); onPlayPractice(song); }}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold uppercase tracking-widest transition-colors"
            >
              <KeyboardIcon className="w-4 h-4" />
              {t.game.practice || 'Practice'}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onPlayDemo(song); }}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold uppercase tracking-widest transition-colors"
            >
              <Play className="w-4 h-4" />
              {t.game.demo || 'Demo'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
