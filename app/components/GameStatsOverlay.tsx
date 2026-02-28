'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Song } from '../lib/songs';

interface GameStatsOverlayProps {
  song: Song;
  score: {
    perfect: number;
    good: number;
    miss: number;
    wrong: number;
    currentScore: number;
  };
  theme: string;
  t: Record<string, string>;
}

export function GameStatsOverlay({ song, score, theme, t }: GameStatsOverlayProps) {
  return (
    <div id="game-stats-overlay" className="pointer-events-none absolute inset-0 flex flex-col p-4 md:p-8">
      <div className="flex justify-between items-start w-full relative">
        <div className="flex flex-col gap-6 md:gap-8 max-w-[60%] md:max-w-none">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            key={song.id}
            className="space-y-1"
          >
            <h2 className="text-2xl md:text-5xl font-black theme-text-primary text-glow tracking-tighter leading-none truncate">{t[`song_${song.id}`] || song.title}</h2>
            <div className="flex items-center gap-3">
              <p className="text-sm md:text-lg text-indigo-400 font-bold uppercase tracking-widest opacity-90 truncate">{t[`artist_${song.artist.toLowerCase()}`] || song.artist}</p>
              <div className="hidden md:block h-4 w-px theme-border" />
              <p className="hidden md:block text-[10px] md:text-xs theme-text-secondary font-bold uppercase tracking-[0.2em]">{song.style ? (t[`style_${song.style.toLowerCase()}`] || song.style) : ''}</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col hidden md:flex"
          >
            <div className="text-[10px] uppercase tracking-[0.3em] theme-text-secondary font-black mb-2">{t.currentScore}</div>
            <div className="text-6xl md:text-8xl font-black theme-text-primary tabular-nums drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] tracking-tighter">
              {score.currentScore.toLocaleString()}
            </div>
          </motion.div>
        </div>

        {/* Desktop Stats */}
        <div className="flex flex-col gap-3 hidden md:flex">
          {[
            { key: 'perfect', label: t.perfect, value: score.perfect, color: 'text-emerald-400', bg: theme === 'light' ? 'bg-emerald-400/10' : 'bg-emerald-400/5', border: theme === 'light' ? 'border-emerald-400/20' : 'border-emerald-400/10' },
            { key: 'good', label: t.good, value: score.good, color: 'text-blue-400', bg: theme === 'light' ? 'bg-blue-400/10' : 'bg-blue-400/5', border: theme === 'light' ? 'border-blue-400/20' : 'border-blue-400/10' },
            { key: 'miss', label: t.miss, value: score.miss, color: 'text-amber-400', bg: theme === 'light' ? 'bg-amber-400/10' : 'bg-amber-400/5', border: theme === 'light' ? 'border-amber-400/20' : 'border-amber-400/10' },
            { key: 'wrong', label: t.wrong, value: score.wrong, color: 'text-rose-400', bg: theme === 'light' ? 'bg-rose-400/10' : 'bg-rose-400/5', border: theme === 'light' ? 'border-rose-400/20' : 'border-rose-400/10' },
          ].map((stat, idx) => (
            <motion.div 
              key={`${stat.key}-${idx}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center justify-between gap-6 px-5 py-2.5 rounded-2xl border ${stat.bg} ${stat.border} backdrop-blur-xl min-w-[160px] shadow-lg`}
            >
              <span className={`text-[10px] uppercase tracking-widest font-black ${stat.color}`}>{stat.label}</span>
              <span className="text-2xl font-black theme-text-primary tabular-nums">{stat.value}</span>
            </motion.div>
          ))}
        </div>

        {/* Mobile Stats (Simplified) */}
        <div className="flex md:hidden flex-col items-end gap-1">
           <div className="text-[10px] uppercase tracking-widest theme-text-secondary font-black">{t.currentScore}</div>
           <div className="text-3xl font-black theme-text-primary tabular-nums drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
             {score.currentScore.toLocaleString()}
           </div>
        </div>
      </div>
    </div>
  );
}
