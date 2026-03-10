'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy } from 'lucide-react';
import { AchievementList } from './AchievementList';
import { useLocale } from '../lib/store';
import { translations } from '../lib/translations';

interface AchievementModalProps {
  show: boolean;
  onClose: () => void;
}

export function AchievementModal({ show, onClose }: AchievementModalProps) {
  const locale = useLocale();
  const t = translations[locale] || translations.en;

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md max-h-[80vh] flex flex-col rounded-3xl theme-bg-secondary border theme-border shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b theme-border bg-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold theme-text-primary tracking-tight">{t.achievements}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 theme-text-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
              <AchievementList />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
