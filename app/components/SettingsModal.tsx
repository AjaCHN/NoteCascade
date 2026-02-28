'use client';

import React from 'react';
import { motion } from 'motion/react';
import { 
  Settings, X, Globe, Palette, Mic2, Keyboard as KeyboardIcon, 
  Volume2, Music as MusicIcon, Monitor, ChevronDown, Check, Info, ExternalLink 
} from 'lucide-react';
import { useAppActions, useLocale, useTheme, useInstrument, useKeyboardRange, useShowNoteNames, useShowKeymap, useMetronomeEnabled, useMetronomeBpm, useMetronomeBeats, Theme, Instrument } from '../lib/store';
import { useMidi } from '../hooks/use-midi';
import { translations, Locale } from '../lib/translations';
import pkg from '../../package.json';

const { version } = pkg;

interface SettingsModalProps {
  show: boolean;
  onClose: () => void;
  volume: number;
  setVolume: (val: number) => void;
}

export function SettingsModal({ show, onClose, volume, setVolume }: SettingsModalProps) {
  const { 
    setLocale, setTheme, setInstrument, setKeyboardRange, setShowNoteNames, setShowKeymap,
    setMetronomeEnabled, setMetronomeBpm, setMetronomeBeats
  } = useAppActions();
  
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
    inputs, outputs, selectedInputId, setSelectedInputId,
    midiChannel, setMidiChannel, velocityCurve, setVelocityCurve, transpose, setTranspose
  } = useMidi();

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
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Settings className="h-6 w-6" />
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 overflow-y-auto custom-scrollbar pr-4 pb-4">
          {/* Left Column: General Settings */}
          <div className="space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-4 w-4 text-indigo-400" />
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] theme-text-secondary">{t.language}</label>
              </div>
              <div className="relative group">
                <select 
                  value={locale}
                  onChange={(e) => setLocale(e.target.value as Locale)}
                  className="w-full appearance-none theme-bg-secondary border theme-border rounded-2xl px-5 py-4 theme-text-primary font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
                >
                  {(Object.keys(translations) as Locale[]).map((lang) => (
                    <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 theme-text-secondary pointer-events-none group-hover:theme-text-primary transition-colors" />
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Palette className="h-4 w-4 text-indigo-400" />
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] theme-text-secondary">{t.theme}</label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(['dark', 'light', 'cyber', 'classic'] as Theme[]).map((tName) => (
                  <button
                    key={tName}
                    onClick={() => setTheme(tName)}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all ${
                      theme === tName 
                        ? 'border-indigo-500 bg-indigo-500/10 theme-text-primary shadow-lg shadow-indigo-500/10' 
                        : 'theme-border theme-bg-secondary theme-text-secondary hover:theme-border-primary'
                    }`}
                  >
                    <span className="text-xs font-bold capitalize">{t[`theme_${tName}`] || tName}</span>
                    {theme === tName && <Check className="h-4 w-4 text-indigo-400" />}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Mic2 className="h-4 w-4 text-indigo-400" />
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] theme-text-secondary">{t.instrument}</label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(['piano', 'synth', 'epiano', 'strings'] as Instrument[]).map((inst) => (
                  <button
                    key={inst}
                    onClick={() => setInstrument(inst)}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all ${
                      instrument === inst 
                        ? 'border-indigo-500 bg-indigo-500/10 theme-text-primary shadow-lg shadow-indigo-500/10' 
                        : 'theme-border theme-bg-secondary theme-text-secondary hover:theme-border-primary'
                    }`}
                  >
                    <span className="text-xs font-bold capitalize">{t[`inst_${inst}`] || inst}</span>
                    {instrument === inst && <Check className="h-4 w-4 text-indigo-400" />}
                  </button>
                ))}
              </div>
            </section>

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
          </div>

          {/* Right Column: MIDI & Info */}
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

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Monitor className="h-4 w-4 text-indigo-400" />
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] theme-text-secondary">{t.midiDevice}</label>
              </div>
              <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-2">
                {inputs.length > 0 ? inputs.map(input => (
                  <button
                    key={input.id}
                    onClick={() => setSelectedInputId(input.id)}
                    className={`w-full flex items-center justify-between rounded-2xl p-4 border transition-all ${
                      selectedInputId === input.id 
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' 
                        : 'theme-border theme-bg-secondary theme-text-secondary hover:theme-border-primary'
                    }`}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-bold text-sm">{input.name}</span>
                      <span className="text-[10px] uppercase tracking-widest opacity-50">{input.manufacturer || 'Unknown'}</span>
                    </div>
                    {selectedInputId === input.id && <Check className="h-4 w-4" />}
                  </button>
                )) : (
                  <div className="rounded-2xl border border-dashed theme-border p-8 text-center theme-text-secondary text-xs italic">
                    {t.noDevice}
                  </div>
                )}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-4 w-4 text-indigo-400" />
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] theme-text-secondary">MIDI Configuration</label>
              </div>
              <div className="space-y-4 p-4 rounded-2xl theme-bg-secondary border theme-border">
                {/* Channel */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold theme-text-primary">Channel</span>
                  <div className="relative">
                    <select 
                      value={midiChannel}
                      onChange={(e) => setMidiChannel(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                      className="appearance-none bg-slate-700 text-white text-xs font-bold rounded-lg pl-3 pr-8 py-2 border-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="all">All Channels</option>
                      {Array.from({length: 16}, (_, i) => i + 1).map(ch => (
                        <option key={ch} value={ch}>Channel {ch}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Velocity Curve */}
                <div className="space-y-2">
                  <span className="text-xs font-bold theme-text-primary">Velocity Curve</span>
                  <div className="grid grid-cols-4 gap-2">
                    {(['linear', 'log', 'exp', 'fixed'] as const).map(curve => (
                      <button
                        key={curve}
                        onClick={() => setVelocityCurve(curve)}
                        className={`px-2 py-2 rounded-xl text-[10px] font-bold uppercase transition-all border ${
                          velocityCurve === curve
                            ? 'bg-indigo-500 border-indigo-400 text-white shadow-md'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                        }`}
                      >
                        {curve}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transpose */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold theme-text-primary">Transpose</span>
                  <div className="flex items-center gap-3 bg-slate-800 rounded-xl p-1">
                    <button 
                      onClick={() => setTranspose(Math.max(-12, transpose - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-sm font-mono font-bold w-8 text-center text-white">
                      {transpose > 0 ? `+${transpose}` : transpose}
                    </span>
                    <button 
                      onClick={() => setTranspose(Math.min(12, transpose + 1))}
                      className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Monitor className="h-4 w-4 text-indigo-400" />
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] theme-text-secondary">{t.midiOutputDevice || 'MIDI Output'}</label>
              </div>
              <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-2">
                {outputs.length > 0 ? outputs.map(output => (
                  <div
                    key={output.id}
                    className="w-full flex items-center justify-between rounded-2xl p-4 border theme-border theme-bg-secondary theme-text-secondary"
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-bold text-sm">{output.name}</span>
                      <span className="text-[10px] uppercase tracking-widest opacity-50">{output.manufacturer || 'Unknown'}</span>
                    </div>
                  </div>
                )) : (
                  <div className="rounded-2xl border border-dashed theme-border p-8 text-center theme-text-secondary text-xs italic">
                    {t.noDevice}
                  </div>
                )}
              </div>
            </section>

            <section className="p-6 rounded-3xl theme-bg-secondary border theme-border">
              <div className="flex items-center gap-2 mb-4">
                <Info className="h-4 w-4 text-indigo-400" />
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] theme-text-secondary">{t.appInfo}</label>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs theme-text-secondary">{t.version}</span>
                  <span className="text-xs font-mono font-bold theme-text-primary">v{version}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs theme-text-secondary">{t.developer}</span>
                  <span className="text-xs font-bold theme-text-primary">Sut</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs theme-text-secondary">{t.midiStatus}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${selectedInputId ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {selectedInputId ? t.connected : t.disconnected}
                  </span>
                </div>
                <div className="pt-3 mt-3 border-t theme-border flex justify-center">
                  <a 
                    href="https://github.com/sutchan" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                  >
                    {t.github} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="mt-10 flex justify-end">
          <button 
            onClick={onClose}
            className="px-10 py-4 rounded-2xl bg-indigo-500 font-bold text-white hover:bg-indigo-400 transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98]"
          >
            {t.done}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
