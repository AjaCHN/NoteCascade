// app/components/SongSelector.tsx v1.3.5
'use client';

import React, { useState, useRef } from 'react';
import { Song, builtInSongs, parseMidiFile } from '../lib/songs';
import { Music, PlayCircle, Mic2, Filter, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocale, useScores, useAchievements, usePlayMode, useAppActions, PlayMode } from '../lib/store';
import { translations } from '../lib/translations';
import { SongCard } from './SongCard';

interface SongSelectorProps {
  onSelect: (song: Song) => void;
  selectedSongId?: string;
}

export function SongSelector({ onSelect, selectedSongId }: SongSelectorProps) {
  const locale = useLocale();
  const scores = useScores();
  const achievements = useAchievements();
  const playMode = usePlayMode();
  const { setPlayMode } = useAppActions();
  const t = translations[locale] || translations.en;
  
  const [filter, setFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<number | 'all'>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const styles = ['all', ...Array.from(new Set(builtInSongs.map(s => s.style?.toLowerCase()).filter((s): s is string => !!s && s !== 'all')))];
  const difficulties = ['all', 1, 2, 3, 4, 5];

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
      const achievementTitle = achievement ? (t[`ach_${achievement.id}_title`] || achievement.title) : condition.value;
      return `${t.unlockCondition}: ${achievementTitle}`;
    }
    if (condition.type === 'score') {
      return `${t.unlockCondition}: ${condition.value} ${t.currentScore}`;
    }
    return '';
  };

  const filteredSongs = builtInSongs.filter(song => {
    const styleMatch = filter === 'all' || song.style?.toLowerCase() === filter;
    const difficultyMatch = difficultyFilter === 'all' || song.difficulty === difficultyFilter;
    return styleMatch && difficultyMatch;
  });

  const getHighScore = (songId: string) => {
    const songScores = scores.filter(s => s.songId === songId);
    if (songScores.length === 0) return null;
    return Math.max(...songScores.map(s => s.score));
  };

  const activeFiltersCount = (filter !== 'all' ? 1 : 0) + (difficultyFilter !== 'all' ? 1 : 0);

  return (
    <div className="flex flex-col min-h-full relative">
      <div className="sticky top-0 z-20 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md p-4 md:p-6 border-b border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-4 shadow-sm transition-colors duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h2 className="text-xl font-black theme-text-primary flex items-center gap-3 text-glow">
            <Music className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
            {t.library}
          </h2>
          
          <div className="flex items-center gap-2 self-end md:self-auto">
            <div className="flex bg-slate-200 dark:bg-slate-800 rounded-xl p-1 mr-1">
              {(['perform', 'demo'] as PlayMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setPlayMode(mode)}
                  className={`px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    playMode === mode
                      ? 'bg-white dark:bg-slate-700 text-indigo-500 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                  title={t[`mode_${mode}`]}
                >
                  {mode === 'perform' ? <Mic2 className="w-3 h-3" /> : <PlayCircle className="w-3 h-3" />}
                  <span className="hidden lg:inline">{t[`mode_${mode}`]}</span>
                </button>
              ))}
            </div>

            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".mid,.midi" className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="p-2 rounded-xl theme-bg-secondary theme-border theme-text-secondary hover:theme-text-primary hover:theme-border-primary transition-all shadow-sm"
              title={t.uploadMidi}
            >
              <Upload className={`w-4 h-4 ${isUploading ? 'animate-bounce' : ''}`} />
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl border transition-all shadow-sm relative ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-indigo-500 border-indigo-400 text-white'
                  : 'theme-bg-secondary theme-border theme-text-secondary hover:theme-text-primary hover:theme-border-primary'
              }`}
            >
              <Filter className="w-4 h-4" />
              {activeFiltersCount > 0 && !showFilters && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900" />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div key="filters-panel" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden w-full">
              <div className="p-4 rounded-2xl theme-bg-secondary theme-border border space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] theme-text-secondary">Style</span>
                    {filter !== 'all' && <button onClick={() => setFilter('all')} className="text-[10px] text-rose-500 font-bold hover:underline">Clear</button>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {styles.map(style => (
                      <button
                        key={style}
                        onClick={() => setFilter(style)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all border ${
                          filter === style ? 'bg-indigo-500 border-indigo-400 text-white shadow-md' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-indigo-500/50'
                        }`}
                      >
                        {style === 'all' ? t.all : (t[`style_${style.toLowerCase()}`] || style)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] theme-text-secondary">{t.level}</span>
                    {difficultyFilter !== 'all' && <button onClick={() => setDifficultyFilter('all')} className="text-[10px] text-rose-500 font-bold hover:underline">Clear</button>}
                  </div>
                  <div className="flex gap-1.5">
                    {difficulties.map(diff => (
                      <button
                        key={diff}
                        onClick={() => setDifficultyFilter(diff as number | 'all')}
                        className={`w-8 h-8 flex items-center justify-center rounded-xl text-[10px] font-bold transition-all border ${
                          difficultyFilter === diff ? 'bg-amber-500 border-amber-400 text-white shadow-md' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-amber-500/50'
                        }`}
                      >
                        {diff === 'all' ? '∞' : diff}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 md:p-6 pt-2">
        {filteredSongs.length > 0 ? filteredSongs.map((song, idx) => (
          <SongCard 
            key={`${song.id}-${idx}`}
            song={song}
            isSelected={selectedSongId === song.id}
            unlocked={isSongUnlocked(song)}
            highScore={getHighScore(song.id)}
            unlockDescription={getUnlockDescription(song.unlockCondition)}
            onSelect={onSelect}
            t={t}
          />
        )) : (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center border border-dashed theme-border rounded-[2rem] theme-bg-secondary">
            <Music className="w-12 h-12 theme-text-secondary mb-4 opacity-50" />
            <p className="theme-text-secondary text-sm font-bold uppercase tracking-[0.2em]">{t.noSongs}</p>
            <button 
              onClick={() => { setFilter('all'); setDifficultyFilter('all'); }}
              className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 underline underline-offset-8 decoration-indigo-500/30"
            >
              {t.clearFilters}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
