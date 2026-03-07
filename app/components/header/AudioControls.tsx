// app/components/header/AudioControls.tsx v2.0.0
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Clock, Monitor, Keyboard as KeyboardIcon } from 'lucide-react';

interface AudioControlsProps {
  show: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  keyboardType: string;
  setKeyboardType: (type: 'virtual' | 'physical') => void;
  metronomeEnabled: boolean;
  setMetronomeEnabled: (enabled: boolean) => void;
  metronomeBpm: number;
  setMetronomeBpm: (bpm: number) => void;
  metronomeBeats: number;
  setMetronomeBeats: (beats: number) => void;
  volume: number;
  setVolume: (volume: number) => void;
}

export function AudioControls({
  show, t, keyboardType, setKeyboardType,
  metronomeEnabled, setMetronomeEnabled,
  metronomeBpm, setMetronomeBpm,
  metronomeBeats, setMetronomeBeats,
  volume, setVolume
}: AudioControlsProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="absolute top-full right-0 mt-2 p-4 rounded-2xl theme-bg-secondary border theme-border shadow-2xl w-64 z-50 flex flex-col gap-4"
        >
          {/* Keyboard Type Toggle */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-widest theme-text-secondary">{t.settings.keyboardType || 'Keyboard Type'}</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setKeyboardType('virtual')}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl border text-[10px] font-bold transition-all ${
                  keyboardType === 'virtual'
                    ? 'border-indigo-500 bg-indigo-500/10 theme-text-primary shadow-lg shadow-indigo-500/10'
                    : 'theme-border theme-bg-secondary theme-text-secondary hover:theme-text-primary'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                {t.settings.virtualKeyboard || 'Virtual'}
              </button>
              <button
                onClick={() => setKeyboardType('physical')}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl border text-[10px] font-bold transition-all ${
                  keyboardType === 'physical'
                    ? 'border-indigo-500 bg-indigo-500/10 theme-text-primary shadow-lg shadow-indigo-500/10'
                    : 'theme-border theme-bg-secondary theme-text-secondary hover:theme-text-primary'
                }`}
              >
                <KeyboardIcon className="w-3.5 h-3.5" />
                {t.settings.physicalKeyboard || 'Physical'}
              </button>
            </div>
          </div>

          <div className="h-px bg-white/10 w-full" />

          {/* Metronome */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest theme-text-secondary">{t.settings.metronome || 'Metronome'}</span>
              <button 
                onClick={() => setMetronomeEnabled(!metronomeEnabled)}
                className={`p-1.5 rounded-lg transition-all ${metronomeEnabled ? 'bg-indigo-500 text-white' : 'bg-white/5 theme-text-secondary'}`}
              >
                <Clock className="h-3 w-3" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                value={metronomeBpm}
                onChange={(e) => setMetronomeBpm(parseInt(e.target.value) || 120)}
                className="w-16 bg-white/5 rounded px-2 py-1 theme-text-primary text-xs font-bold focus:outline-none border theme-border"
              />
              <span className="text-[10px] theme-text-secondary font-bold">{t.common.bpm || 'BPM'}</span>
              <select
                value={metronomeBeats}
                onChange={(e) => setMetronomeBeats(parseInt(e.target.value))}
                className="ml-auto bg-white/5 rounded px-2 py-1 text-[10px] font-bold theme-text-secondary focus:outline-none border theme-border"
              >
                {[2, 3, 4, 6].map(b => <option key={b} value={b}>{b}/4</option>)}
              </select>
            </div>
          </div>

          <div className="h-px bg-white/10 w-full" />

          {/* Volume */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest theme-text-secondary">{t.common.volume || 'Volume'}</span>
              <span className="text-xs font-bold theme-text-primary">{volume}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="theme-text-secondary">
                {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
