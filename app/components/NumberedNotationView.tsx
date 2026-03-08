// app/components/NumberedNotationView.tsx v2.4.3
'use client';
import type { Song } from '../lib/songs/types';

interface NumberedNotationViewProps {
  song: Song;
  currentTime: number;
  height: number;
  isPlaying: boolean;
}

export function NumberedNotationView({ song, currentTime: _currentTime, height: _height, isPlaying: _isPlaying }: NumberedNotationViewProps) {
  return <div className="w-full h-full flex items-center justify-center">Numbered Notation View for {song.title}</div>;
}
