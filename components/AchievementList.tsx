'use client';

import React from 'react';
import { useAchievements, useLocale } from '../lib/store';
import { Trophy, Lock, CheckCircle2, Music, Star, Clock, Palette, LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { translations } from '../lib/i18n';

const iconMap: Record<string, LucideIcon> = {
  Music,
  Star,
  Clock,
  Trophy,
  Palette,
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

          return (
            <div
              key={achievement.id}
              className={`relative flex items-center gap-4 rounded-xl border p-4 transition-all ${
                isUnlocked
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-slate-800 bg-slate-900/30 opacity-60'
              }`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                isUnlocked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'
              }`}>
                {isUnlocked ? <Icon className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
              </div>
              <div className="flex flex-col">
                <span className={`font-semibold ${isUnlocked ? 'text-slate-100' : 'text-slate-400'}`}>
                  {achievement.title}
                </span>
                <span className="text-xs text-slate-500">{achievement.description}</span>
              </div>
              {isUnlocked && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
