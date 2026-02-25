'use client';

import React from 'react';
import { Song, builtInSongs } from '../lib/songs';
import { Music, Star, ChevronRight, Trophy } from 'lucide-react';
import { useLocale, useScores } from '../lib/store';
import { translations } from '../lib/i18n';

interface SongSelectorProps {
  onSelect: (song: Song) => void;
  selectedSongId?: string;
}

export function SongSelector({ onSelect, selectedSongId }: SongSelectorProps) {
  const locale = useLocale();
  const scores = useScores();
  const t = translations[locale] || translations.en;
  const [filter, setFilter] = React.useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = React.useState<number | 'all'>('all');

  const styles = ['all', ...Array.from(new Set(builtInSongs.map(s => s.style)))];
  const difficulties = ['all', 1, 2, 3, 4, 5];

  const filteredSongs = builtInSongs.filter(song => {
    const styleMatch = filter === 'all' || song.style === filter;
    const difficultyMatch = difficultyFilter === 'all' || song.difficulty === difficultyFilter;
    return styleMatch && difficultyMatch;
  });

  const getHighScore = (songId: string) => {
    const songScores = scores.filter(s => s.songId === songId);
    if (songScores.length === 0) return null;
    return Math.max(...songScores.map(s => s.score));
  };

  return (
    <div className="flex flex-col space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Music className="w-5 h-5" />
          {t.library}
        </h2>
        <span className="text-[10px] font-mono text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded border border-slate-800">
          {filteredSongs.length} {filteredSongs.length === 1 ? t.song : t.songsCount}
        </span>
      </div>

      {/* Filters */}
      <div className="space-y-3 pb-2 border-b border-slate-800/50">
        <div className="flex flex-wrap gap-1.5">
          {styles.map(style => (
            <button
              key={style}
              onClick={() => setFilter(style)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                filter === style 
                  ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/20' 
                  : 'bg-slate-800/50 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{t.level}</span>
          <div className="flex gap-1">
            {difficulties.map(diff => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff as number | 'all')}
                className={`w-6 h-6 flex items-center justify-center rounded-md text-[10px] font-bold transition-all border ${
                  difficultyFilter === diff 
                    ? 'bg-amber-500 border-amber-400 text-white' 
                    : 'bg-slate-800/30 border-slate-800 text-slate-600 hover:border-slate-700'
                }`}
              >
                {diff === 'all' ? '∞' : diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredSongs.length > 0 ? filteredSongs.map((song) => (
          <button
            key={song.id}
            onClick={() => onSelect(song)}
            className={`group flex items-center justify-between rounded-xl border p-4 transition-all hover:scale-[1.02] active:scale-[0.98] ${
              selectedSongId === song.id
                ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
            }`}
          >
            <div className="flex flex-col items-start gap-1">
              <span className="font-bold text-slate-100 text-lg leading-tight">{song.title}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {song.style}
                </span>
                <span className="text-xs text-slate-500 font-medium">{song.artist}</span>
              </div>
              {getHighScore(song.id) !== null && (
                <div className="flex items-center gap-1 mt-1 text-amber-400/80">
                  <Trophy className="w-3 h-3" />
                  <span className="text-[10px] font-bold tabular-nums">{getHighScore(song.id)?.toLocaleString()}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < song.difficulty 
                        ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.4)]' 
                        : 'text-slate-800'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1 text-slate-500 group-hover:text-indigo-400 transition-colors">
                <span className="text-[10px] font-bold uppercase tracking-tighter">{t.play}</span>
                <ChevronRight className={`h-4 w-4 transition-transform group-hover:translate-x-1`} />
              </div>
            </div>
          </button>
        )) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
            <Music className="w-10 h-10 text-slate-800 mb-3" />
            <p className="text-slate-500 text-sm font-medium">{t.noSongs}</p>
            <button 
              onClick={() => { setFilter('all'); setDifficultyFilter('all'); }}
              className="mt-4 text-xs font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
            >
              {t.clearFilters}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
