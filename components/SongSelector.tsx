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
            <div className="flex flex-col items-start">
              <span className="font-semibold text-slate-100">{song.title}</span>
              <span className="text-xs text-slate-400">{song.artist} • {song.style}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < song.difficulty ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>
              <ChevronRight className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${
                selectedSongId === song.id ? 'text-indigo-400' : 'text-slate-600'
              }`} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
