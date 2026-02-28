'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Music as MusicIcon, Trophy, RotateCcw, RefreshCw, Play, Pause, SkipForward } from 'lucide-react';
import { SongSelector } from './SongSelector';
import { AchievementList } from './AchievementList';
import { Song } from '../lib/songs';

interface AppSidebarProps {
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  activeTab: 'songs' | 'achievements';
  setActiveTab: (tab: 'songs' | 'achievements') => void;
  selectedSong: Song;
  setSelectedSong: (song: Song) => void;
  resetSong: () => void;
  togglePlay: () => void;
  isPlaying: boolean;
  currentTime: number;
  handleNextSong: () => void;
  t: Record<string, string>;
}

export function AppSidebar({
  showSidebar,
  setShowSidebar,
  activeTab,
  setActiveTab,
  selectedSong,
  setSelectedSong,
  resetSong,
  togglePlay,
  isPlaying,
  currentTime,
  handleNextSong,
  t
}: AppSidebarProps) {
  return (
    <aside 
      id="sidebar" 
      className={`
        absolute inset-y-0 left-0 z-40 w-full md:w-80 theme-bg-primary md:bg-transparent
        flex flex-col border-r theme-border transition-transform duration-300 ease-in-out
        ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:relative'}
      `}
    >
      <div className="flex border-b theme-border bg-white/2 backdrop-blur-md">
        <button
          id="tab-songs"
          onClick={() => setActiveTab('songs')}
          className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
            activeTab === 'songs' ? 'text-indigo-400 border-b-2 border-indigo-400 bg-indigo-400/5' : 'theme-text-secondary hover:theme-text-primary'
          }`}
        >
          <MusicIcon className="h-4 w-4" />
          {t.songs}
        </button>
        <button
          id="tab-achievements"
          onClick={() => setActiveTab('achievements')}
          className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
            activeTab === 'achievements' ? 'text-indigo-400 border-b-2 border-indigo-400 bg-indigo-400/5' : 'theme-text-secondary hover:theme-text-primary'
          }`}
        >
          <Trophy className="h-4 w-4" />
          {t.awards}
        </button>
      </div>
      
      <div id="song-selector-container" className="flex-1 overflow-y-auto custom-scrollbar p-0">
        {activeTab === 'songs' ? (
          <SongSelector 
            onSelect={(song) => { 
              setSelectedSong(song); 
              resetSong(); 
              setShowSidebar(false); // Close sidebar on selection (mobile)
            }} 
            selectedSongId={selectedSong.id} 
          />
        ) : (
          <AchievementList />
        )}
      </div>
      
      <div className="shrink-0 border-t theme-border p-4 theme-bg-secondary/50 backdrop-blur-md flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button onClick={resetSong} className="p-2 theme-text-secondary hover:theme-text-primary rounded-full hover:bg-white/5 transition-colors" title={t.reset}>
              <RotateCcw className="w-4 h-4" />
            </button>
            <button onClick={() => { resetSong(); togglePlay(); }} className="p-2 theme-text-secondary hover:theme-text-primary rounded-full hover:bg-white/5 transition-colors" title={t.retry}>
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <button onClick={togglePlay} className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg shadow-indigo-500/40 hover:bg-indigo-400 hover:scale-105 active:scale-95 transition-all">
            {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-1" />}
          </button>
          <button onClick={handleNextSong} className="p-2 theme-text-secondary hover:theme-text-primary rounded-full hover:bg-white/5 transition-colors" title={t.nextSong}>
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-col w-full">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest theme-text-secondary mb-1">
            <span>{Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')}</span>
            <span>{Math.floor((selectedSong.duration || 0) / 60)}:{((selectedSong.duration || 0) % 60).toFixed(0).padStart(2, '0')}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden border theme-border">
            <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${(currentTime / (selectedSong.duration || 1)) * 100}%` }} />
          </div>
        </div>
      </div>
    </aside>
  );
}
