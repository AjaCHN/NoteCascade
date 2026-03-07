// app/components/GameViews.tsx v2.0.0
import { GameCanvas } from './GameCanvas';
import { SheetMusicView } from './SheetMusicView';
import { NumberedNotationView } from './NumberedNotationView';
import type { Song } from '../lib/songs/types';

interface GameViewsProps {
  viewMode: 'waterfall' | 'sheet' | 'numbered';
  selectedSong: Song;
  currentTime: number;
  activeNotes: Map<number, number>;
  isPlaying: boolean;
  setLastScore: (scoreData: { perfect: number; good: number; miss: number; wrong: number; currentScore: number }) => void;
  keyboardRange: { start: number; end: number };
  showNoteNames: boolean;
  theme: string;
  containerSize: { width: number; height: number };
}

export function GameViews({
  viewMode,
  selectedSong,
  currentTime,
  activeNotes,
  isPlaying,
  setLastScore,
  keyboardRange,
  showNoteNames,
  theme,
  containerSize
}: GameViewsProps) {
  return (
    <>
      {viewMode === 'waterfall' && (
        <GameCanvas
          song={selectedSong}
          currentTime={currentTime}
          activeNotes={activeNotes}
          isPlaying={isPlaying}
          onScoreUpdate={setLastScore}
          keyboardRange={keyboardRange}
          showNoteNames={showNoteNames}
          theme={theme}
        />
      )}
      
      {viewMode === 'sheet' && (
        <SheetMusicView 
          song={selectedSong} 
          width={containerSize.width} 
          height={containerSize.height} 
        />
      )}

      {viewMode === 'numbered' && (
        <NumberedNotationView 
          song={selectedSong} 
          currentTime={currentTime}
          height={containerSize.height}
          isPlaying={isPlaying}
        />
      )}
    </>
  );
}
