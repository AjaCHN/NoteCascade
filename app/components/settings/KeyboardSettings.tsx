// app/components/settings/KeyboardSettings.tsx v1.3.5
'use client';

import React from 'react';
import { Keyboard as KeyboardIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface KeyboardSettingsProps {
  keyboardRange: { start: number; end: number };
  setKeyboardRange: (start: number, end: number) => void;
  showNoteNames: boolean;
  setShowNoteNames: (show: boolean) => void;
  showKeymap: boolean;
  setShowKeymap: (show: boolean) => void;
  t: Record<string, string>;
}

export function KeyboardSettings({
  keyboardRange,
  setKeyboardRange,
  showNoteNames,
  setShowNoteNames,
  showKeymap,
  setShowKeymap,
  t
}: KeyboardSettingsProps) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <KeyboardIcon className="h-4 w-4 text-indigo-400" />
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] theme-text-secondary">{t.keyboardRange}</label>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {[25, 49, 61, 88].map(keys => (
            <button
              key={keys}
              onClick={() => {
                if (keys === 25) setKeyboardRange(48, 72);
                if (keys === 49) setKeyboardRange(36, 84);
                if (keys === 61) setKeyboardRange(36, 96);
                if (keys === 88) setKeyboardRange(21, 108);
              }}
              className={`px-2 py-3 rounded-xl border text-[10px] font-bold transition-all ${
                (keys === 25 && keyboardRange.start === 48) ||
                (keys === 49 && keyboardRange.start === 36 && keyboardRange.end === 84) ||
                (keys === 61 && keyboardRange.start === 36 && keyboardRange.end === 96) ||
                (keys === 88 && keyboardRange.start === 21)
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                  : 'theme-border theme-bg-secondary theme-text-secondary hover:theme-text-primary'
              }`}
            >
              {keys}{t.keys}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between p-4 rounded-2xl theme-bg-secondary border theme-border">
            <span className="text-xs font-bold theme-text-primary">{t.showNoteNames}</span>
            <button 
              onClick={() => setShowNoteNames(!showNoteNames)}
              className={`w-12 h-6 rounded-full transition-all relative ${showNoteNames ? 'bg-indigo-500' : 'bg-slate-700'}`}
            >
              <motion.div 
                animate={{ x: showNoteNames ? 26 : 4 }}
                className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
              />
            </button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-2xl theme-bg-secondary border theme-border">
            <span className="text-xs font-bold theme-text-primary">{t.showKeymap || 'Show PC Keyboard Map'}</span>
            <button 
              onClick={() => setShowKeymap(!showKeymap)}
              className={`w-12 h-6 rounded-full transition-all relative ${showKeymap ? 'bg-indigo-500' : 'bg-slate-700'}`}
            >
              <motion.div 
                animate={{ x: showKeymap ? 26 : 4 }}
                className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
