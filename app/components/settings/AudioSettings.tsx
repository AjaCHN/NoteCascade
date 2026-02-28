'use client';

import React from 'react';
import { Volume2, Music as MusicIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface AudioSettingsProps {
  volume: number;
  setVolume: (val: number) => void;
  metronomeEnabled: boolean;
  setMetronomeEnabled: (enabled: boolean) => void;
  metronomeBpm: number;
  setMetronomeBpm: (bpm: number) => void;
  metronomeBeats: number;
  setMetronomeBeats: (beats: number) => void;
  t: Record<string, string>;
}

export function AudioSettings({
  volume,
  setVolume,
  metronomeEnabled,
  setMetronomeEnabled,
  metronomeBpm,
  setMetronomeBpm,
  metronomeBeats,
  setMetronomeBeats,
  t
}: AudioSettingsProps) {
  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Volume2 className="h-4 w-4 text-indigo-400" />
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] theme-text-secondary">{t.volume || 'Volume'}</label>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-2xl theme-bg-secondary border theme-border">
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={volume} 
            onChange={(e) => setVolume(parseInt(e.target.value))}
            className="w-full accent-indigo-500"
          />
          <span className="text-xs font-bold theme-text-primary w-8 text-right">{volume}%</span>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <MusicIcon className="h-4 w-4 text-indigo-400" />
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] theme-text-secondary">Metronome</label>
        </div>
        <div className="space-y-4 p-4 rounded-2xl theme-bg-secondary border theme-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold theme-text-primary">Enable Metronome</span>
            <button 
              onClick={() => setMetronomeEnabled(!metronomeEnabled)}
              className={`w-12 h-6 rounded-full transition-all relative ${metronomeEnabled ? 'bg-indigo-500' : 'bg-slate-700'}`}
            >
              <motion.div 
                animate={{ x: metronomeEnabled ? 26 : 4 }}
                className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
              />
            </button>
          </div>
          
          <div className={`space-y-4 transition-opacity ${metronomeEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <div>
              <div className="flex justify-between text-[10px] theme-text-secondary font-bold mb-2">
                <span>BPM</span>
                <span>{metronomeBpm}</span>
              </div>
              <input 
                type="range" 
                min="60" 
                max="240" 
                value={metronomeBpm} 
                onChange={(e) => setMetronomeBpm(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
            
            <div>
              <div className="flex justify-between text-[10px] theme-text-secondary font-bold mb-2">
                <span>Beats per Measure</span>
                <span>{metronomeBeats}</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[2, 3, 4, 6].map(beats => (
                  <button
                    key={beats}
                    onClick={() => setMetronomeBeats(beats)}
                    className={`px-2 py-2 rounded-xl border text-[10px] font-bold transition-all ${
                      metronomeBeats === beats 
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' 
                        : 'theme-border theme-bg-secondary theme-text-secondary hover:theme-text-primary'
                    }`}
                  >
                    {beats}/4
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
