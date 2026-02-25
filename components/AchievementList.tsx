'use client';

import React from 'react';
import { useAchievements, useLocale } from '../lib/store';
import { Trophy, Lock, CheckCircle2, Music, Star, Clock, Palette, LucideIcon, Flame, Zap, Crown, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { translations } from '../lib/i18n';

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
    <div className="flex flex-col space-y-4 p-4">
      <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-amber-400" />
        {t.achievements}
      </h2>
      <div className="grid grid-cols-1 gap-3">
        {achievements.map((achievement) => {
          const Icon = iconMap[achievement.icon] || Trophy;
          const isUnlocked = !!achievement.unlockedAt;
          const progress = achievement.progress || 0;
          const maxProgress = achievement.maxProgress;
          const percentage = maxProgress ? Math.min(100, (progress / maxProgress) * 100) : 0;

          return (
            <div
              key={achievement.id}
              className={`relative flex items-center gap-4 rounded-xl border p-4 transition-all ${
                isUnlocked
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-slate-800 bg-slate-900/30 opacity-80'
              }`}
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                isUnlocked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'
              }`}>
                {isUnlocked ? <Icon className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`font-semibold truncate pr-2 ${isUnlocked ? 'text-slate-100' : 'text-slate-400'}`}>
                    {t[`ach_${achievement.id}_title`] || achievement.title}
                  </span>
                  {isUnlocked && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </motion.div>
                  )}
                </div>
                <span className="text-xs text-slate-500 truncate">{t[`ach_${achievement.id}_desc`] || achievement.description}</span>
                
                {!isUnlocked && maxProgress !== undefined && (
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>Progress</span>
                      <span>{Math.floor(progress)} / {maxProgress}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <motion.div 
                        className="h-full bg-indigo-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
