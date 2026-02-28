'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, X } from 'lucide-react';
import { 
  useLocale, useTheme, useInstrument, useAppActions, 
  useKeyboardRange, useShowNoteNames, useShowKeymap,
  useMetronomeEnabled, useMetronomeBpm, useMetronomeBeats
} from '../lib/store';
import { translations } from '../lib/translations';

// Sub-components
import { GeneralSettings } from './settings/GeneralSettings';
import { KeyboardSettings } from './settings/KeyboardSettings';
import { AudioSettings } from './settings/AudioSettings';
import { MidiSettings } from './settings/MidiSettings';
import { AppInfoSection } from './settings/AppInfoSection';

interface SettingsModalProps {
  show: boolean;
  onClose: () => void;
  volume: number;
  setVolume: (val: number) => void;
}

export function SettingsModal({ show, onClose, volume, setVolume }: SettingsModalProps) {
  const locale = useLocale();
  const theme = useTheme();
  const instrument = useInstrument();
  const keyboardRange = useKeyboardRange();
  const showNoteNames = useShowNoteNames();
  const showKeymap = useShowKeymap();
  const metronomeEnabled = useMetronomeEnabled();
  const metronomeBpm = useMetronomeBpm();
  const metronomeBeats = useMetronomeBeats();

  const { 
    setLocale, setTheme, setInstrument, 
    setKeyboardRange, setShowNoteNames, setShowKeymap,
    setMetronomeEnabled, setMetronomeBpm, setMetronomeBeats
  } = useAppActions();

  const t = translations[locale] || translations.en;

  if (!show) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm md:p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-4xl h-full md:h-auto md:max-h-[90vh] md:rounded-[2.5rem] theme-bg-primary border theme-border p-6 md:p-10 shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <SettingsIcon className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold theme-text-primary">{t.settings}</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-white/5 theme-text-secondary hover:theme-text-primary transition-all"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 overflow-y-auto custom-scrollbar pr-4 pb-4">
          <div className="space-y-8">
            <GeneralSettings 
              locale={locale}
              setLocale={setLocale}
              theme={theme}
              setTheme={setTheme}
              instrument={instrument}
              setInstrument={setInstrument}
              t={t}
            />
            <AudioSettings 
              volume={volume}
              setVolume={setVolume}
              metronomeEnabled={metronomeEnabled}
              setMetronomeEnabled={setMetronomeEnabled}
              metronomeBpm={metronomeBpm}
              setMetronomeBpm={setMetronomeBpm}
              metronomeBeats={metronomeBeats}
              setMetronomeBeats={setMetronomeBeats}
              t={t}
            />
          </div>

          <div className="space-y-8">
            <KeyboardSettings 
              keyboardRange={keyboardRange}
              setKeyboardRange={setKeyboardRange}
              showNoteNames={showNoteNames}
              setShowNoteNames={setShowNoteNames}
              showKeymap={showKeymap}
              setShowKeymap={setShowKeymap}
              t={t}
            />
            <MidiSettings t={t} />
          </div>
          
          <div className="md:col-span-2">
            <AppInfoSection t={t} />
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 mt-8 pt-6 border-t theme-border flex justify-end">
          <button 
            onClick={onClose}
            className="px-10 py-4 rounded-2xl bg-indigo-500 font-black text-white hover:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            {t.done}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
