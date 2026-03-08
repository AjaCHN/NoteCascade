// app/components/SheetMusicView.tsx v2.4.3
'use client';
import type { Song } from '../lib/songs/types';

interface SheetMusicViewProps {
  song: Song;
  width: number;
  height: number;
}

export function SheetMusicView({ song, width: _width, height: _height }: SheetMusicViewProps) {
  return <div className="w-full h-full flex items-center justify-center">Sheet Music View for {song.title}</div>;
}
