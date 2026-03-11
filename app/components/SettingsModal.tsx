// app/components/SettingsModal.tsx v1.3.6
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
import { MidiSettings } from './settings/MidiSettings';
import { AppInfoSection } from './settings/AppInfoSection';
import { AudioSettings } from './settings/AudioSettings';

import { MidiDevice, VelocityCurve, MidiMessage } from '../hooks/use-midi';

interface SettingsModalProps {
  show: boolean;
  onClose: () => void;
  activeSection?: 'general' | 'audio' | 'keyboard' | 'midi' | 'about';
  midiProps: {
    isSupported: boolean;
    inputs: MidiDevice[];
    selectedInputId: string | null;
    setSelectedInputId: (id: string | null) => void;
    midiChannel: number | 'all';
    setMidiChannel: (channel: number | 'all') => void;
    velocityCurve: VelocityCurve;
    setVelocityCurve: (curve: VelocityCurve) => void;
    transpose: number;
    setTranspose: (transpose: number) => void;
    connectMidi: () => void;
    scanBluetoothMidi: () => void;
    isConnecting: boolean;
    lastMessage: MidiMessage | null;
    midiMapping: Record<number, number>;
    setMidiMapping: (mapping: Record<number, number>) => void;
    isMappingMode: boolean;
    setIsMappingMode: (val: boolean) => void;
    mappingTarget: number | null;
    setMappingTarget: (val: number | null) => void;
  };
  setIsRangeManuallySet?: (val: boolean) => void;
  volume: number;
  setVolume: (val: number) => void;
}

export function SettingsModal({ onClose, activeSection = 'general', midiProps, setIsRangeManuallySet, volume, setVolume }: SettingsModalProps) {
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
        className="w-full max-w-xl h-full md:h-auto md:max-h-[90vh] md:rounded-[2.5rem] theme-bg-primary border theme-border p-6 md:p-10 shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <SettingsIcon className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold theme-text-primary">{t[activeSection] || t.settings}</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-white/5 theme-text-secondary hover:theme-text-primary transition-all"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto custom-scrollbar pr-4 pb-4">
          {(activeSection === 'general' || activeSection === 'audio') && (
            <div className="grid grid-cols-1 gap-y-8">
              {activeSection === 'general' && (
                <GeneralSettings 
                  locale={locale}
                  setLocale={setLocale}
                  theme={theme}
                  setTheme={setTheme}
                  instrument={instrument}
                  setInstrument={setInstrument}
                  t={t}
                />
              )}
              {activeSection === 'audio' && (
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
              )}
            </div>
          )}

          {(activeSection === 'keyboard' || activeSection === 'midi') && (
            <div className="grid grid-cols-1 gap-y-8">
              {activeSection === 'keyboard' && (
                <KeyboardSettings 
                  keyboardRange={keyboardRange}
                  setKeyboardRange={setKeyboardRange}
                  showNoteNames={showNoteNames}
                  setShowNoteNames={setShowNoteNames}
                  showKeymap={showKeymap}
                  setShowKeymap={setShowKeymap}
                  t={t}
                  setIsRangeManuallySet={setIsRangeManuallySet}
                />
              )}
              {activeSection === 'midi' && (
                <MidiSettings t={t} midiProps={midiProps} />
              )}
            </div>
          )}
          
          {activeSection === 'about' && (
            <div className="col-span-1">
              <AppInfoSection t={t} />
            </div>
          )}
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
