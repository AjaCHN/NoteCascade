'use client';

import React from 'react';
import { Song, builtInSongs, parseMidiFile } from '../lib/songs';
import { motion } from 'motion/react';
import { Music, Upload, Star, Clock, ChevronRight } from 'lucide-react';

interface SongListProps {
  onSelect: (song: Song) => void;
}

export function SongList({ onSelect }: SongListProps) {
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const song = await parseMidiFile(file);
        onSelect(song);
      } catch {
        alert('Failed to parse MIDI file. Please try another one.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Music className="text-indigo-400" />
          Song Library
        </h2>
        
        <label className="group relative flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg cursor-pointer transition-all border border-slate-700 overflow-hidden">
          <Upload size={18} />
          <span>Import MIDI</span>
          <input type="file" accept=".mid,.midi" className="hidden" onChange={handleFileUpload} />
          <motion.div 
            className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {builtInSongs.map((song) => (
          <motion.div
            key={song.id}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(song)}
            className="group relative bg-slate-900 border border-slate-800 p-5 rounded-2xl cursor-pointer hover:border-indigo-500/50 transition-all shadow-lg hover:shadow-indigo-500/10"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                <Music size={24} />
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={i < song.difficulty ? 'text-yellow-400 fill-current' : 'text-slate-700'}
                  />
                ))}
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">
              {song.title}
            </h3>
            <p className="text-slate-400 text-sm mb-4">{song.artist} • {song.style}</p>

            <div className="flex items-center justify-between text-xs font-mono text-slate-500">
              <div className="flex items-center gap-1">
                <Clock size={14} />
                {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
              </div>
              <div className="flex items-center gap-1 text-indigo-400 font-bold">
                PRACTICE <ChevronRight size={14} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
