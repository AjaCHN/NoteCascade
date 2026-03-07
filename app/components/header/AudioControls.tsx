// app/components/header/AudioControls.tsx v2.3.2
'use client';
import { Volume2 } from 'lucide-react';
export function AudioControls({ show, t, volume, setVolume }: any) {
  if (!show) return null;
  return (
    <div className="absolute top-full right-0 mt-2 p-4 bg-white dark:bg-zinc-900 border theme-border rounded-xl shadow-xl z-50 w-64">
      <div className="flex items-center gap-3 mb-4">
        <Volume2 className="w-4 h-4 opacity-50" />
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={volume} 
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="flex-1 accent-indigo-500"
        />
      </div>
      <p className="text-[10px] uppercase font-bold opacity-50">{t.settings.audioSettings}</p>
    </div>
  );
}
