// app/components/SheetMusicView.tsx v2.4.2
'use client';
import type { Song } from '../lib/songs/types';

interface SheetMusicViewProps {
  song: Song;
  width: number;
  height: number;
}

export function SheetMusicView({ song, width, height }: SheetMusicViewProps) {
  return <div className="w-full h-full flex items-center justify-center">Sheet Music View for {song.title}</div>;
}
