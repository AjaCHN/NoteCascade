// app/hooks/use-app-initialization.ts v2.3.2
'use client';
import { useState, useEffect } from 'react';

export function useAppInitialization(volume: number, instrument: string) {
  const [mounted, setMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    setMounted(true);
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { mounted, windowWidth };
}
