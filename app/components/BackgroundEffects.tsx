// app/components/BackgroundEffects.tsx v2.0.1
'use client';

export function BackgroundEffects({ theme }: { theme: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <div className={`absolute -top-[20%] -left-[10%] w-[60%] h-[60%] blur-[120px] rounded-full transition-colors duration-1000 ${
        theme === 'cyber' ? 'bg-green-500/10' : theme === 'classic' ? 'bg-amber-500/10' : 'bg-indigo-500/10'
      }`} />
      <div className={`absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] blur-[120px] rounded-full transition-colors duration-1000 ${
        theme === 'cyber' ? 'bg-fuchsia-500/10' : theme === 'classic' ? 'bg-orange-500/10' : 'bg-purple-500/10'
      }`} />
      <div className="scanline-effect opacity-30" />
    </div>
  );
}
