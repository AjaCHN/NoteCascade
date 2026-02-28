'use client';

import React from 'react';
import { Cpu, Zap, Check, AlertCircle, Sliders } from 'lucide-react';
import { useMidi } from '../../hooks/use-midi';

interface MidiSettingsProps {
  t: Record<string, string>;
}

export function MidiSettings({ t }: MidiSettingsProps) {
  const { 
    isSupported, inputs, selectedInputId, setSelectedInputId,
    midiChannel, setMidiChannel, velocityCurve, setVelocityCurve, transpose, setTranspose
  } = useMidi();

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Cpu className="h-4 w-4 text-indigo-400" />
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] theme-text-secondary">{t.midiInput}</label>
        </div>
        {!isSupported ? (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-xs font-bold leading-tight">{t.midiNotSupported}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {inputs.length === 0 ? (
              <div className="p-4 rounded-2xl theme-bg-secondary border theme-border text-center">
                <p className="text-xs font-bold theme-text-secondary">{t.noMidiDevices}</p>
              </div>
            ) : (
              inputs.map((input) => (
                <button
                  key={input.id}
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
              ))
            )}
            <div className="flex items-center gap-2 px-2">
              <Zap className="h-3 w-3 text-amber-400" />
              <span className="text-[10px] theme-text-secondary font-bold italic">{t.midiAutoConnect}</span>
            </div>
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
