// app/components/settings/MidiSettings.tsx v1.3.5
'use client';

import React from 'react';
import { Cpu, Zap, Check, AlertCircle, Sliders, RefreshCw } from 'lucide-react';
import { MidiDevice, VelocityCurve, MidiMessage } from '../../hooks/use-midi';

interface MidiSettingsProps {
  t: Record<string, string>;
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
    lastMessage: MidiMessage | null;
  };
}

export function MidiSettings({ t, midiProps }: MidiSettingsProps) {
  const { 
    isSupported, inputs, selectedInputId, setSelectedInputId,
    midiChannel, setMidiChannel, velocityCurve, setVelocityCurve, transpose, setTranspose, connectMidi
  } = midiProps;

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-indigo-400" />
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] theme-text-secondary">{t.midiInput}</label>
          </div>
          <button 
            onClick={() => connectMidi()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors text-xs font-bold"
          >
            <RefreshCw className="h-3 w-3" />
            <span>{t.refresh || 'Connect / Refresh'}</span>
          </button>
        </div>
        {!isSupported ? (
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-xs font-bold leading-tight">{t.midiNotSupported || 'MIDI is not supported or access was denied.'}</p>
            </div>
            {typeof navigator !== 'undefined' && !navigator.requestMIDIAccess && (
              <p className="text-[10px] opacity-80">
                Your browser does not support Web MIDI API. Please use Chrome, Edge, or Opera.
              </p>
            )}
            {typeof navigator !== 'undefined' && !!navigator.requestMIDIAccess && (
              <p className="text-[10px] opacity-80">
                Please ensure you have granted MIDI permissions to this site and your device is connected properly.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {inputs.length === 0 ? (
              <div className="p-4 rounded-2xl theme-bg-secondary border theme-border text-center">
                <p className="text-xs font-bold theme-text-secondary">{t.noMidiDevices}</p>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setSelectedInputId('all')}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    selectedInputId === 'all' || !selectedInputId
                      ? 'border-indigo-500 bg-indigo-500/10 theme-text-primary shadow-lg shadow-indigo-500/10' 
                      : 'theme-border theme-bg-secondary theme-text-secondary hover:theme-border-primary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${selectedInputId === 'all' || !selectedInputId ? 'bg-indigo-400 animate-pulse' : 'bg-slate-600'}`} />
                    <span className="text-xs font-bold truncate max-w-[200px]">{t.allDevices || 'All Devices'}</span>
                  </div>
                  {(selectedInputId === 'all' || !selectedInputId) && <Check className="h-4 w-4 text-indigo-400" />}
                </button>
                {inputs.map((input: MidiDevice, idx: number) => (
                  <button
                    key={`${input.id}-${idx}`}
                    onClick={() => setSelectedInputId(input.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      selectedInputId === input.id 
                        ? 'border-indigo-500 bg-indigo-500/10 theme-text-primary shadow-lg shadow-indigo-500/10' 
                        : 'theme-border theme-bg-secondary theme-text-secondary hover:theme-border-primary'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${selectedInputId === input.id ? 'bg-indigo-400 animate-pulse' : 'bg-slate-600'}`} />
                      <span className="text-xs font-bold truncate max-w-[200px]">{input.name}</span>
                    </div>
                    {selectedInputId === input.id && <Check className="h-4 w-4 text-indigo-400" />}
                  </button>
                ))}
              </>
            )}
            <div className="flex items-center gap-2 px-2">
              <Zap className="h-3 w-3 text-amber-400" />
              <span className="text-[10px] theme-text-secondary font-bold italic">{t.midiAutoConnect}</span>
            </div>
            {midiProps.lastMessage && (
              <div className="mt-4 p-3 rounded-xl bg-slate-500/10 border border-slate-500/20">
                <p className="text-[10px] font-mono text-slate-400">
                  Last Msg: Cmd {midiProps.lastMessage.command.toString(16)} | Note {midiProps.lastMessage.note} | Vel {midiProps.lastMessage.velocity}
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="h-4 w-4 text-indigo-400" />
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] theme-text-secondary">{t.midiConfig || 'MIDI Configuration'}</label>
        </div>
        <div className="space-y-4 p-4 rounded-2xl theme-bg-secondary border theme-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold theme-text-primary">{t.channel || 'Channel'}</span>
            <select 
              value={midiChannel}
              onChange={(e) => setMidiChannel(parseInt(e.target.value))}
              className="bg-transparent text-xs font-bold theme-text-secondary focus:outline-none"
            >
              <option value={-1}>All</option>
              {Array.from({ length: 16 }, (_, i) => (
                <option key={i} value={i}>{i + 1}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold theme-text-primary">{t.velocityCurve || 'Velocity Curve'}</span>
            <select 
              value={velocityCurve}
              onChange={(e) => setVelocityCurve(e.target.value as 'linear' | 'log' | 'exp' | 'fixed')}
              className="bg-transparent text-xs font-bold theme-text-secondary focus:outline-none"
            >
              <option value="linear">Linear</option>
              <option value="log">Easy (Log)</option>
              <option value="exp">Hard (Exp)</option>
              <option value="fixed">Fixed (100)</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold theme-text-primary">{t.transpose || 'Transpose'}</span>
            <div className="flex items-center gap-3">
              <button onClick={() => setTranspose(transpose - 1)} className="theme-text-secondary hover:theme-text-primary">-</button>
              <span className="text-xs font-bold theme-text-primary w-4 text-center">{transpose}</span>
              <button onClick={() => setTranspose(transpose + 1)} className="theme-text-secondary hover:theme-text-primary">+</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
