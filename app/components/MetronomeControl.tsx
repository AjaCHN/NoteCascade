// app/components/MetronomeControl.tsx v2.3.1
import React from 'react';
import { useMetronomeEnabled, useMetronomeBpm, useAppActions } from '../lib/store';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function MetronomeControl() {
  const enabled = useMetronomeEnabled();
  const bpm = useMetronomeBpm();
  const { setMetronomeEnabled, setMetronomeBpm } = useAppActions();

  return (
    <div className="flex items-center gap-2 p-2 bg-slate-800 rounded-md">
      <Button 
        variant={enabled ? 'default' : 'outline'} 
        onClick={() => setMetronomeEnabled(!enabled)}
      >
        {enabled ? 'Stop' : 'Start'}
      </Button>
      <Input 
        type="number" 
        value={bpm} 
        onChange={(e) => setMetronomeBpm(Number(e.target.value))}
        className="w-16"
      />
      <span className="text-white">BPM</span>
    </div>
  );
}
