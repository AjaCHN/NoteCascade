// app/hooks/use-app-initialization.ts v2.0.1
'use client';

import { useState, useEffect } from 'react';
import { setVolume, setAudioInstrument } from '../lib/audio';

export function useAppInitialization(volume: number, instrument: string) {
  const [mounted, setMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
    setVolume(volume);
    setAudioInstrument(instrument);
  }, [instrument, volume]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => setWindowWidth(window.innerWidth);
      setTimeout(() => setWindowWidth(window.innerWidth), 0);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return { mounted, windowWidth };
}
