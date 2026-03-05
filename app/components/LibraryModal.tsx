'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Music } from 'lucide-react';
import { AchievementList } from './AchievementList';
import { SongSelector } from './SongSelector';
import { useLocale } from '../lib/store';
import { translations } from '../lib/translations';
import type { Song } from '../lib/songs';

interface LibraryModalProps {
  show: boolean;
  onClose: () => void;
  onPlayPractice: (song: Song) => void;
  onPlayDemo: (song: Song) => void;
  selectedSongId: string;
}

export function LibraryModal({ show, onClose, onPlayPractice, onPlayDemo, selectedSongId }: LibraryModalProps) {
  const locale = useLocale();
  const t: Translation = translations[locale];
  const [activeTab, setActiveTab] = useState<'songs' | 'achievements'>('songs');

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-4xl h-[85vh] flex flex-col rounded-3xl theme-bg-secondary border theme-border shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 md:p-6 border-b theme-border bg-white/5 shrink-0">
              <div className="flex items-center gap-2 md:gap-6">
                <div className="flex bg-black/20 rounded-xl p-1 border theme-border">
                  <button
                    onClick={() => setActiveTab('songs')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      activeTab === 'songs'
                        ? 'bg-indigo-500 text-white shadow-lg'
                        : 'theme-text-secondary hover:theme-text-primary hover:bg-white/5'
                    }`}
                  >
                    <Music className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">{t.ui.library || 'Songs'}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('achievements')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      activeTab === 'achievements'
                        ? 'bg-amber-500 text-white shadow-lg'
                        : 'theme-text-secondary hover:theme-text-primary hover:bg-white/5'
                    }`}
                  >
                    <Trophy className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">{t.achievements.title}</span>
                  </button>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 theme-text-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-0 relative">
              {activeTab === 'songs' ? (
                <div className="h-full w-full bg-slate-50/50 dark:bg-slate-950/50">
                  <SongSelector 
                    onPlayPractice={(song) => {
                      onPlayPractice(song);
                      onClose();
                    }}
                    onPlayDemo={(song) => {
                      onPlayDemo(song);
                      onClose();
                    }}
                    selectedSongId={selectedSongId}
                  />
                </div>
              ) : (
                <div className="max-w-md mx-auto py-6">
                  <AchievementList />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
