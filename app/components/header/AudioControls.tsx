// app/components/header/AudioControls.tsx v2.3.2
'use client';
export function AudioControls({ show, t, keyboardType, setKeyboardType, metronomeEnabled, setMetronomeEnabled, metronomeBpm, setMetronomeBpm, metronomeBeats, setMetronomeBeats }: any) {
  if (!show) return null;
  return (
    <div className="absolute top-full right-0 mt-2 p-4 bg-white dark:bg-zinc-900 border theme-border rounded-xl shadow-xl z-50 w-64">
      <p className="text-[10px] uppercase font-bold opacity-50">{t.settings.audioSettings}</p>
    </div>
  );
}
