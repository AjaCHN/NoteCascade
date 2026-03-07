// app/components/InfoModals.tsx v2.0.4
'use client';

import { motion, AnimatePresence } from 'motion/react';
import { X, Github, BookOpen } from 'lucide-react';
import Image from 'next/image';
import { useLocale } from '../lib/store';
import { translations } from '../lib/translations';
import pkg from '../../package.json';
import { ChangelogContent } from './info/ChangelogContent';

const { version } = pkg;

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'about' | 'changelog' | 'guide' | null;
}

export function InfoModals({ isOpen, onClose, type }: InfoModalProps) {
  const locale = useLocale();
  const t = translations[locale] || translations.en;

  // if (!isOpen || !type) return null; // Removed early return to allow AnimatePresence to work

  const renderContent = () => {
    switch (type) {
      case 'about':
        return (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg flex items-center justify-center relative overflow-hidden">
                <Image src="/logo.svg" alt="Logo" fill className="object-cover p-2" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold theme-text-primary">NoteCascade</h2>
                <p className="text-sm font-mono text-indigo-400">v{version}</p>
              </div>
            </div>
            
            <p className="text-center theme-text-secondary leading-relaxed">
              {t.ui.appDescription}
            </p>

            <div className="flex justify-center gap-4">
              <a 
                href="https://github.com/sutchan/notecascade" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors theme-text-primary text-sm font-medium"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </div>

            <div className="pt-6 border-t theme-border text-center">
              <p className="text-xs theme-text-secondary opacity-60">
                {t.ui.copyright}
              </p>
            </div>
          </div>
        );

      case 'changelog':
        return <ChangelogContent t={t} />;

      case 'guide':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl font-bold theme-text-primary">{t.game.guideTitle}</h2>
            </div>

            <div className="grid gap-4">
              <div className="p-4 rounded-xl bg-white/5 border theme-border flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400 font-bold">1</div>
                <div>
                  <h3 className="font-bold theme-text-primary mb-1">Connect</h3>
                  <p className="text-sm theme-text-secondary">{t.game.guideConnect}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border theme-border flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400 font-bold">2</div>
                <div>
                  <h3 className="font-bold theme-text-primary mb-1">Select</h3>
                  <p className="text-sm theme-text-secondary">{t.game.guideSelect}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border theme-border flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400 font-bold">3</div>
                <div>
                  <h3 className="font-bold theme-text-primary mb-1">Play</h3>
                  <p className="text-sm theme-text-secondary">{t.game.guidePlay}</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && type && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-[#1a1b26] border theme-border rounded-2xl shadow-2xl overflow-hidden z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b theme-border bg-white/5">
              <span className="text-xs font-bold uppercase tracking-widest theme-text-secondary">
                {type === 'about' ? t.ui.about : type === 'changelog' ? t.ui.changelog : t.ui.guide}
              </span>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors theme-text-secondary hover:theme-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {renderContent()}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
