'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Trophy, RefreshCw } from 'lucide-react';
import { Song } from '../lib/songs';
import { translations } from '../lib/translations';
import { useLocale } from '../lib/store';

interface ResultModalProps {
  show: boolean;
  onClose: () => void;
  onRetry: () => void;
  score: {
    perfect: number;
    good: number;
    miss: number;
    wrong: number;
    currentScore: number;
  };
  song: Song;
}

export function ResultModal({ onClose, onRetry, score, song }: ResultModalProps) {
  const locale = useLocale();
  const t = translations[locale] || translations.en;

  const totalNotes = score.perfect + score.good + score.miss + score.wrong;
  const accuracy = totalNotes > 0 
    ? ((score.perfect + score.good) / totalNotes) * 100 
    : 0;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-lg rounded-[2.5rem] bg-slate-900 border border-slate-800 p-8 md:p-12 shadow-2xl text-center"
      >
        <div className="mb-8">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 mb-4">
            <Trophy className="h-10 w-10" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-2">{t.result}</h2>
          <p className="text-slate-400 font-medium">{t[`song_${song.id}`] || song.title} - {t[`artist_${song.artist.toLowerCase()}`] || song.artist}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700/50">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">{t.totalScore}</div>
            <div className="text-3xl font-black text-white tabular-nums">{score.currentScore.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700/50">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">{t.accuracy}</div>
            <div className="text-3xl font-black text-indigo-400 tabular-nums">
              {accuracy.toFixed(1)}%
            </div>
          </div>
          <div className="col-span-2 grid grid-cols-4 gap-2">
            {[
              { key: 'perfect', label: t.perfect, value: score.perfect, color: 'text-emerald-400' },
              { key: 'good', label: t.good, value: score.good, color: 'text-blue-400' },
              { key: 'miss', label: t.miss, value: score.miss, color: 'text-amber-400' },
              { key: 'wrong', label: t.wrong, value: score.wrong, color: 'text-rose-400' },
            ].map((stat, idx) => (
              <div key={`${stat.key}-${idx}`} className="bg-slate-800/30 rounded-2xl p-3 border border-slate-700/30">
                <div className={`text-[8px] uppercase tracking-tighter font-bold ${stat.color} mb-1`}>{stat.label}</div>
                <div className="text-lg font-black text-white tabular-nums">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <button 
            onClick={onRetry}
            className="flex-1 rounded-2xl bg-slate-800 py-4 font-bold text-white hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-5 w-5" />
            {t.retry}
          </button>
          <button 
            onClick={onClose}
            className="flex-1 rounded-2xl bg-indigo-500 py-4 font-bold text-white hover:bg-indigo-400 transition-colors"
          >
            {t.continue}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
