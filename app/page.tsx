// app/page.tsx v2.2.2
'use client';

import dynamic from 'next/dynamic';

const AppRoot = dynamic(() => import('./components/AppRoot'), {
  ssr: false,
  loading: () => <div className="flex h-dvh w-full items-center justify-center bg-slate-950 text-slate-500">Loading...</div>
});

export default function MidiPlayApp() {
  return <AppRoot />;
}
