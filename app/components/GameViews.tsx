// app/components/GameViews.tsx v2.4.2
import { GameCanvas } from './GameCanvas';
import { SheetMusicView } from './SheetMusicView';
import { NumberedNotationView } from './NumberedNotationView';
import { MusicTheoryModule } from './MusicTheoryModule';
import type { Song } from '../lib/songs/types';
import type { PlayMode } from '../lib/store';

interface GameViewsProps {
  viewMode: 'waterfall' | 'sheet' | 'numbered' | 'theory';
  selectedSong: Song | null;
  currentTime: number;
  activeNotes: Map<number, number>;
  isPlaying: boolean;
  onScoreUpdate: (score: { perfect: number; good: number; miss: number; wrong: number; currentScore: number }) => void;
  keyboardRange: { start: number; end: number };
  showNoteNames: boolean;
  theme: string;
  containerSize: { width: number; height: number };
  playMode: PlayMode;
}

export function GameViews({
  viewMode,
  selectedSong,
  currentTime,
  activeNotes,
  isPlaying,
  onScoreUpdate,
  keyboardRange,
  showNoteNames,
  theme,
  containerSize,
  playMode
}: GameViewsProps) {
  if (!selectedSong && viewMode !== 'theory') {
    return <div className="flex-1 relative min-h-0 flex items-center justify-center text-white/50">Select a song to start playing</div>;
  }

  return (
    <div className="flex-1 relative min-h-0">
      {viewMode === 'theory' && (
        <MusicTheoryModule activeNotes={activeNotes} />
      )}
      {viewMode === 'waterfall' && selectedSong && (
        <GameCanvas 
          song={selectedSong}
          currentTime={currentTime}
          activeNotes={activeNotes}
          isPlaying={isPlaying}
          onScoreUpdate={onScoreUpdate}
          keyboardRange={keyboardRange}
          showNoteNames={showNoteNames}
          theme={theme}
          dimensions={containerSize}
          playMode={playMode}
        />
      )}
      {viewMode === 'sheet' && selectedSong && (
        <SheetMusicView 
          song={selectedSong}
          width={containerSize.width}
          height={containerSize.height}
        />
      )}
      {viewMode === 'numbered' && selectedSong && (
        <NumberedNotationView 
          song={selectedSong}
          currentTime={currentTime}
          height={containerSize.height}
          isPlaying={isPlaying}
        />
      )}
    </div>
  );
}
