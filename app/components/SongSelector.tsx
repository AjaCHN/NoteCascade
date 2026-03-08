// app/components/SongSelector.tsx v1.7.3
'use client';

import React, { useState, useRef } from 'react';
import { builtInSongs } from '../lib/songs';
import { parseMidiFile } from '../lib/songs/midi';
import type { Song } from '../lib/songs';
import { Music, Filter, Upload } from 'lucide-react';
import { useLocale, useScores, useAchievements } from '../lib/store';
import { translations } from '../lib/translations';
import { SongCard } from './SongCard';
import { SongFilters } from './library/SongFilters';

interface SongSelectorProps {
  onPlayPractice: (song: Song) => void;
  onPlayDemo: (song: Song) => void;
  selectedSongId?: string;
}

export function SongSelector({ onPlayPractice, onPlayDemo, selectedSongId }: SongSelectorProps) {
  const locale = useLocale();
  const scores = useScores();
  const achievements = useAchievements();
  const t = translations[locale];
  
  const [filter, setFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<number | 'all'>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const styles = ['all', ...Array.from(new Set(builtInSongs.map(s => s.style?.toLowerCase()).filter((s): s is string => !!s && s !== 'all')))];
  const difficulties: (number | 'all')[] = ['all', 1, 2, 3, 4, 5];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const song = await parseMidiFile(file);
      onPlayPractice(song);
    } catch (error) {
      console.error('Failed to parse MIDI:', error);
      alert(t.game.midiParseError);
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
      const achievementTitle = achievement ? (t.achievements[`${achievement.id}_title` as keyof typeof t.achievements] || achievement.title) : condition.value;
      return `${t.common.unlockCondition}: ${achievementTitle}`;
    }
    if (condition.type === 'score') {
      return `${t.common.unlockCondition}: ${condition.value} ${t.common.currentScore}`;
    }
    return '';
  };

  const filteredSongs = builtInSongs.filter(song => {
    const styleMatch = filter === 'all' || song.style?.toLowerCase() === filter;
    const difficultyMatch = difficultyFilter === 'all' || song.difficulty === difficultyFilter;
    return styleMatch && difficultyMatch;
  }).sort((a, b) => a.difficulty - b.difficulty);

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
            {t.ui.library}
          </h2>
          
          <div className="flex items-center gap-2 self-end md:self-auto">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".mid,.midi" className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="p-2 rounded-xl theme-bg-secondary theme-border theme-text-secondary hover:theme-text-primary hover:theme-border-primary transition-all shadow-sm"
              title={t.common.uploadMidi}
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

        <SongFilters 
          showFilters={showFilters}
          filter={filter}
          setFilter={setFilter}
          difficultyFilter={difficultyFilter}
          setDifficultyFilter={setDifficultyFilter}
          styles={styles}
          difficulties={difficulties}
          t={t}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4 md:p-6 pt-2">
        {filteredSongs.length > 0 ? filteredSongs.map((song, idx) => (
          <SongCard 
            key={`${song.id}-${idx}`}
            song={song}
            isSelected={selectedSongId === song.id}
            unlocked={isSongUnlocked(song)}
            highScore={getHighScore(song.id)}
            unlockDescription={getUnlockDescription(song.unlockCondition)}
            onPlayPractice={onPlayPractice}
            onPlayDemo={onPlayDemo}
            t={t}
          />
        )) : (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center border border-dashed theme-border rounded-[2rem] theme-bg-secondary">
            <Music className="w-12 h-12 theme-text-secondary mb-4 opacity-50" />
            <p className="theme-text-secondary text-sm font-bold uppercase tracking-[0.2em]">{t.game.noSongs}</p>
            <button 
              onClick={() => { setFilter('all'); setDifficultyFilter('all'); }}
              className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 underline underline-offset-8 decoration-indigo-500/30"
            >
              {t.game.clearFilters}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
