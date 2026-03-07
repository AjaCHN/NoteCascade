// app/hooks/useWakeLock.ts v2.4.0
'use client';

import { useEffect, useRef } from 'react';

interface WakeLockSentinel {
  release(): Promise<void>;
  onrelease: ((this: WakeLockSentinel, ev: Event) => void) | null;
  readonly released: boolean;
  readonly type: 'screen';
}

export function useWakeLock(enabled: boolean) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    const requestWakeLock = async () => {
      if (!enabled) {
        if (wakeLockRef.current) {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        }
        return;
      }

      if ('wakeLock' in navigator) {
        try {
          // @ts-expect-error - wakeLock is a relatively new API
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          console.log('Wake Lock is active');
        } catch (err: unknown) {
          if (err instanceof Error) {
            console.error(`${err.name}, ${err.message}`);
          }
        }
      }
    };

    requestWakeLock();

    const handleVisibilityChange = async () => {
      if (wakeLockRef.current !== null && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
      }
    };
  }, [enabled]);
}
