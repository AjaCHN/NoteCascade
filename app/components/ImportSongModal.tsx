// app/components/ImportSongModal.tsx v2.3.1
'use client';
import React, { useState } from 'react';
import { Song, parseMidiFile } from '../lib/songs';
import { Button } from './ui/button';
import { SongEditor } from './SongEditor';

interface ImportSongModalProps {
  onImport: (song: Song) => void;
  onClose: () => void;
}

export function ImportSongModal({ onImport, onClose }: ImportSongModalProps) {
  const [importedSong, setImportedSong] = useState<Song | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const song = await parseMidiFile(file);
      setImportedSong(song);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {importedSong ? (
        <SongEditor 
          song={importedSong} 
          onSave={(song) => { onImport(song); onClose(); }} 
          onCancel={() => setImportedSong(null)} 
        />
      ) : (
        <div className="p-6 bg-background rounded-lg shadow-xl">
          <h2 className="text-xl font-bold mb-4">Import MIDI File</h2>
          <input type="file" accept=".mid" onChange={handleFileChange} className="mb-4" />
          <Button onClick={onClose}>Close</Button>
        </div>
      )}
    </div>
  );
}
