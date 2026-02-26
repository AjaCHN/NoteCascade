'use client';

import React from 'react';
import { Song, builtInSongs, parseMidiFile } from '../lib/songs';
import { Music, Star, ChevronRight, Trophy, Lock, Upload } from 'lucide-react';
import { motion } from 'motion/react';
import { useLocale, useScores, useAchievements } from '../lib/store';
import { translations } from '../lib/translations';

interface SongSelectorProps {
  onSelect: (song: Song) => void;
  selectedSongId?: string;
}

export function SongSelector({ onSelect, selectedSongId }: SongSelectorProps) {
  const locale = useLocale();
  const scores = useScores();
  const achievements = useAchievements();
  const t = translations[locale] || translations.en;
  const [filter, setFilter] = React.useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = React.useState<number | 'all'>('all');
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const styles = [t.all, ...Array.from(new Set(builtInSongs.map(s => s.style)))];
  const difficulties = [t.all, 1, 2, 3, 4, 5];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const song = await parseMidiFile(file);
      onSelect(song);
    } catch (error) {
      console.error('Failed to parse MIDI:', error);
      alert(t.midiParseError);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const isSongUnlocked = (song: Song) => {
    if (!song.unlockCondition) return true;
    
    if (song.unlockCondition.type === 'achievement') {
      const achievement = achievements.find(a => a.id === song.unlockCondition?.value);
      return !!achievement?.unlockedAt;
    }

    if (song.unlockCondition.type === 'score') {
      const totalScore = scores.reduce((acc, s) => acc + s.score, 0);
      return totalScore >= (song.unlockCondition.value as number);
    }
    
    return true;
  };

  const getUnlockDescription = (condition: Song['unlockCondition']) => {
    if (!condition) return '';
    if (condition.description) return condition.description;
    
    if (condition.type === 'achievement') {
      const achievement = achievements.find(a => a.id === condition.value);
      return `${t.unlockCondition}: ${achievement?.title || condition.value}`;
    }
    
    if (condition.type === 'score') {
      return `${t.unlockCondition}: ${condition.value} ${t.currentScore}`;
    }
    
    return '';
  };

  const filteredSongs = builtInSongs.filter(song => {
    const styleMatch = filter === t.all || song.style === filter;
    const difficultyMatch = difficultyFilter === t.all || song.difficulty === difficultyFilter;
    return styleMatch && difficultyMatch;
  });

  const getHighScore = (songId: string) => {
    const songScores = scores.filter(s => s.songId === songId);
    if (songScores.length === 0) return null;
    return Math.max(...songScores.map(s => s.score));
  };

  return (
    <div className="flex flex-col space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-white flex items-center gap-3 text-glow">
          <Music className="w-6 h-6 text-indigo-400" />
          {t.library}
        </h2>
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".mid,.midi"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-2 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all shadow-lg"
            title={t.uploadMidi}
          >
            <Upload className={`w-4 h-4 ${isUploading ? 'animate-bounce' : ''}`} />
          </button>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
            {filteredSongs.length} {filteredSongs.length === 1 ? t.song : t.songsCount}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4 pb-4 border-b border-white/5">
        <div className="flex flex-wrap gap-2">
          {styles.map(style => (
            <button
              key={style}
              onClick={() => setFilter(style)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all border ${
                filter === style 
                  ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/20' 
                  : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">{t.level}</span>
          <div className="flex gap-1.5">
            {difficulties.map(diff => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff as number | 'all')}
                className={`w-8 h-8 flex items-center justify-center rounded-xl text-[10px] font-bold transition-all border ${
                  difficultyFilter === diff 
                    ? 'bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-500/20' 
                    : 'bg-white/5 border-white/5 text-slate-600 hover:border-white/10'
                }`}
              >
                {diff === t.all ? '∞' : diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredSongs.length > 0 ? filteredSongs.map((song) => {
          const unlocked = isSongUnlocked(song);
          const isSelected = selectedSongId === song.id;
          return (
            <button
              key={song.id}
              onClick={() => unlocked && onSelect(song)}
              disabled={!unlocked}
              className={`group flex items-center justify-between rounded-2xl border p-5 transition-all relative overflow-hidden ${
                !unlocked 
                  ? 'border-white/5 bg-white/2 opacity-40 cursor-not-allowed'
                  : isSelected
                    ? 'border-indigo-500 bg-indigo-500/10 shadow-xl shadow-indigo-500/10'
                    : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98]'
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
                  <span className={`font-black text-xl tracking-tight leading-none ${unlocked ? 'text-white' : 'text-slate-600'}`}>
                    {song.title}
                  </span>
                  {!unlocked && <Lock className="w-3.5 h-3.5 text-slate-600" />}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] uppercase tracking-[0.2em] font-black px-2 py-0.5 rounded-md border ${
                    unlocked ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20' : 'bg-slate-900 text-slate-700 border-slate-800'
                  }`}>
                    {song.style}
                  </span>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-widest opacity-80">{song.artist}</span>
                </div>
                
                {unlocked ? (
                  getHighScore(song.id) !== null && (
                    <div className="flex items-center gap-1.5 mt-1 text-amber-400/90">
                      <Trophy className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black tabular-nums tracking-widest">{getHighScore(song.id)?.toLocaleString()}</span>
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-1.5 mt-1 text-rose-400/80">
                    <Lock className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{getUnlockDescription(song.unlockCondition)}</span>
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
                          ? unlocked ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'fill-slate-700 text-slate-700'
                          : 'text-slate-800'
                      }`}
                    />
                  ))}
                </div>
                {unlocked && (
                  <div className={`flex items-center gap-1 transition-all ${isSelected ? 'text-indigo-400' : 'text-slate-600 group-hover:text-indigo-400'}`}>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t.play}</span>
                    <ChevronRight className={`h-4 w-4 transition-transform group-hover:translate-x-1`} />
                  </div>
                )}
              </div>
            </button>
          );
        }) : (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center border border-dashed border-white/10 rounded-[2rem] bg-white/2">
            <Music className="w-12 h-12 text-slate-800 mb-4 opacity-50" />
            <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.2em]">{t.noSongs}</p>
            <button 
              onClick={() => { setFilter('all'); setDifficultyFilter('all'); }}
              className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 hover:text-indigo-300 underline underline-offset-8 decoration-indigo-500/30"
            >
              {t.clearFilters}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
