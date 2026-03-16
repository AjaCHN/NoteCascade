// app/components/ImportSongModal.tsx v2.3.2
'use client';
import React, { useState } from 'react';
import { Song, parseMidiFile } from '../lib/songs';
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
        <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-xl border theme-border">
          <h2 className="text-xl font-bold mb-4 theme-text-primary">Import MIDI File</h2>
          <input type="file" accept=".mid,.midi" onChange={handleFileChange} className="mb-4 theme-text-secondary" />
          <button onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl theme-text-primary hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">Close</button>
        </div>
      )}
    </div>
  );
}
