// app/components/BackgroundEffects.tsx v2.3.2
'use client';
export function BackgroundEffects({ theme }: { theme: string }) {
  return <div className={`fixed inset-0 pointer-events-none z-[-1] ${theme === 'cyber' ? 'bg-black' : 'bg-white dark:bg-zinc-950'}`} />;
}
