// app/components/settings/MidiSettings.tsx v2.3.1
'use client';

import React from 'react';
import { Cpu, Zap, Check, AlertCircle, Sliders, RefreshCw, Bluetooth, MapPin, Trash2 } from 'lucide-react';
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
}

export function MidiSettings({ t, midiProps }: MidiSettingsProps) {
  const { 
    isSupported, inputs, selectedInputId, setSelectedInputId,
    midiChannel, setMidiChannel, velocityCurve, setVelocityCurve, transpose, setTranspose, 
    connectMidi, scanBluetoothMidi, isConnecting, midiMapping, setMidiMapping,
    isMappingMode, setIsMappingMode, mappingTarget, setMappingTarget
  } = midiProps;

  const getNoteName = (midi: number) => {
    const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return `${names[midi % 12]}${Math.floor(midi / 12) - 1}`;
  };

  return (
    <div className="space-y-8">
      {/* Bluetooth MIDI Section */}
      <section className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bluetooth className="h-4 w-4 text-indigo-400" />
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] theme-text-secondary">Bluetooth MIDI</label>
          </div>
          <button 
            onClick={() => scanBluetoothMidi()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 text-white hover:bg-indigo-400 transition-colors text-xs font-bold shadow-lg shadow-indigo-500/20"
          >
            <Bluetooth className="h-3 w-3" />
            <span>{t.scanBluetooth || 'Scan for Devices'}</span>
          </button>
        </div>
        <p className="text-[10px] theme-text-secondary leading-relaxed">
          {t.bluetoothTip || 'Connect your wireless MIDI keyboard via Bluetooth. Ensure Bluetooth is enabled on your device.'}
        </p>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-indigo-400" />
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] theme-text-secondary">{t.midiInput}</label>
          </div>
          <button 
            onClick={() => connectMidi()}
            disabled={isConnecting}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors text-xs font-bold ${isConnecting ? 'opacity-50 cursor-wait' : ''}`}
          >
            <RefreshCw className={`h-3 w-3 ${isConnecting ? 'animate-spin' : ''}`} />
            <span>{isConnecting ? 'Connecting...' : t.refresh || 'Connect / Refresh'}</span>
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
          </div>
        )}
      </section>

      {/* MIDI Mapping Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-4 w-4 text-indigo-400" />
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] theme-text-secondary">{t.midiMapping || 'MIDI Mapping'}</label>
        </div>
        <div className="space-y-4 p-4 rounded-2xl theme-bg-secondary border theme-border">
          {isMappingMode ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <p className="text-xs font-bold text-amber-400 animate-pulse">
                {mappingTarget === null 
                  ? (t.mappingSelectTarget || 'Click a key on the virtual keyboard to select mapping target...')
                  : (t.mappingWait || `Now press a key on your physical MIDI device to map it to ${getNoteName(mappingTarget)}`)}
              </p>
              <button 
                onClick={() => { setIsMappingMode(false); setMappingTarget(null); }}
                className="mt-2 text-[10px] font-bold text-slate-400 hover:text-white underline"
              >
                {t.cancel || 'Cancel'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[10px] theme-text-secondary italic">
                {t.mappingTip || 'Map physical MIDI keys to specific virtual keys. Click "Start Mapping" then follow the instructions.'}
              </p>
              
              {Object.keys(midiMapping).length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(midiMapping).map(([raw, target]) => (
                    <div key={raw} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border theme-border">
                      <span className="text-[10px] font-mono theme-text-primary">
                        {raw} → {getNoteName(target)}
                      </span>
                      <button 
                        onClick={() => {
                          const newMapping = { ...midiMapping };
                          delete newMapping[parseInt(raw)];
                          setMidiMapping(newMapping);
                        }}
                        className="p-1 text-rose-400 hover:bg-rose-500/10 rounded"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button 
                onClick={() => setIsMappingMode(true)}
                className="w-full px-3 py-3 rounded-lg bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/20"
              >
                {t.startMapping || 'Start Mapping'}
              </button>
            </div>
          )}
        </div>
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
              onChange={(e) => setMidiChannel(e.target.value === '-1' ? 'all' : parseInt(e.target.value))}
              className="bg-transparent text-xs font-bold theme-text-secondary focus:outline-none"
            >
              <option value="-1">All</option>
              {Array.from({ length: 16 }, (_, i) => (
                <option key={i} value={i + 1}>{i + 1}</option>
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
              <button onClick={() => setTranspose(transpose - 1)} className="theme-text-secondary hover:theme-text-primary px-2">-</button>
              <span className="text-xs font-bold theme-text-primary w-6 text-center">{transpose}</span>
              <button onClick={() => setTranspose(transpose + 1)} className="theme-text-secondary hover:theme-text-primary px-2">+</button>
            </div>
          </div>
        </div>
      </section>

      {midiProps.lastMessage && (
        <div className="p-3 rounded-xl bg-slate-500/10 border border-slate-500/20">
          <p className="text-[10px] font-mono text-slate-400">
            Last Msg: Cmd {midiProps.lastMessage.command.toString(16)} | Note {midiProps.lastMessage.note} | Vel {midiProps.lastMessage.velocity}
          </p>
        </div>
      )}
    </div>
  );
}
