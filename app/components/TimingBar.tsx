// app/components/TimingBar.tsx v1.0.0
'use client';

import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Translation } from '../lib/translations';

interface TimingBarProps {
  recentHits: { timeDiff: number; timestamp: number; type: string }[];
  perfectThreshold: number;
  goodThreshold: number;
  t: Translation;
  theme: string;
}

export function TimingBar({ recentHits, perfectThreshold, goodThreshold, t, theme }: TimingBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-64 h-16 relative" ref={containerRef}>
      <div className={`w-full h-3 rounded-full ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-800'} relative`}>
        <div className="absolute left-1/2 top-0 bottom-0 w-1 -ml-0.5 bg-slate-500/50" />
        <div 
          className="absolute top-0 bottom-0 bg-emerald-500/20"
          style={{
            left: `${50 - (perfectThreshold / goodThreshold) * 50}%`,
            right: `${50 - (perfectThreshold / goodThreshold) * 50}%`
          }}
        />
        {recentHits.map((hit, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className={`absolute top-0 bottom-0 w-2 -ml-1 rounded-full ${
              hit.type === 'perfect' ? 'bg-emerald-400' : hit.type === 'good' ? 'bg-blue-400' : 'bg-amber-400'
            }`}
            style={{
              left: `${50 + (Math.max(-1, Math.min(1, hit.timeDiff / goodThreshold)) * 50)}%`
            }}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest theme-text-secondary mt-2">
        <span>{t.game.early?.toUpperCase() || ''}</span>
        <span className="text-emerald-400">{t.common.perfect?.toUpperCase() || ''}</span>
        <span>{t.game.late?.toUpperCase() || ''}</span>
      </div>
    </div>
  );
}
