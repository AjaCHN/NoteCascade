'use client';

import React from 'react';
import { useAchievements, useLocale } from '@/lib/store';
import { Trophy, Lock, CheckCircle2, Music, Star, Clock, Palette, LucideIcon, Flame, Zap, Crown, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { translations } from '@/lib/translations';

const iconMap: Record<string, LucideIcon> = {
  Music,
  Star,
  Clock,
  Trophy,
  Palette,
  Flame,
  Zap,
  Crown,
  Sun,
  Moon,
};

export function AchievementList() {
  const achievements = useAchievements();
  const locale = useLocale();
  const t = translations[locale] || translations.en;

  return (
    <div className="flex flex-col space-y-6 p-6">
      <h2 className="text-xl font-black text-white flex items-center gap-3 text-glow">
        <Trophy className="w-6 h-6 text-amber-400" />
        {t.achievements}
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {achievements.map((achievement) => {
          const Icon = iconMap[achievement.icon] || Trophy;
          const isUnlocked = !!achievement.unlockedAt;
          const progress = achievement.progress || 0;
          const maxProgress = achievement.maxProgress;
          const percentage = maxProgress ? Math.min(100, (progress / maxProgress) * 100) : 0;

          return (
            <div
              key={achievement.id}
              className={`relative flex flex-col gap-4 rounded-2xl border p-5 transition-all overflow-hidden ${
                isUnlocked
                  ? 'border-emerald-500/30 bg-emerald-500/5 shadow-lg shadow-emerald-500/5'
                  : 'border-white/5 bg-white/5 opacity-80'
              }`}
            >
              {isUnlocked && (
                <div className="absolute top-0 right-0 p-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                  isUnlocked ? 'bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-slate-600'
                }`}>
                  {isUnlocked ? <Icon className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={`font-black text-sm uppercase tracking-widest truncate ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                    {t[`ach_${achievement.id}_title`] || achievement.title}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate mt-0.5">
                    {t[`ach_${achievement.id}_desc`] || achievement.description}
                  </span>
                </div>
              </div>
              
              {!isUnlocked && maxProgress !== undefined && (
                <div className="space-y-2">
                  <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.2em] text-slate-600">
                    <span>Progress</span>
                    <span>{Math.floor(progress)} / {maxProgress}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden border border-white/5">
                    <motion.div 
                      className="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, ease: "circOut" }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
