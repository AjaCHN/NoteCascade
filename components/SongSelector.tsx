'use client';

import React from 'react';
import { Song, builtInSongs } from '../lib/songs';
import { Music, Star, ChevronRight } from 'lucide-react';

interface SongSelectorProps {
  onSelect: (song: Song) => void;
  selectedSongId?: string;
}

export function SongSelector({ onSelect, selectedSongId }: SongSelectorProps) {
  return (
    <div className="flex flex-col space-y-4 p-4">
      <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
        <Music className="w-5 h-5" />
        Song Library
      </h2>
      <div className="grid grid-cols-1 gap-3">
        {builtInSongs.map((song) => (
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
                <span className="text-[10px] font-bold uppercase tracking-tighter">Play</span>
                <ChevronRight className={`h-4 w-4 transition-transform group-hover:translate-x-1`} />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
