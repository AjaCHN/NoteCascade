// app/components/SongEditor.tsx v2.3.2
'use client';
import React, { useState } from 'react';
import { Song, Note } from '../lib/songs';

interface SongEditorProps {
  song: Song;
  onSave: (song: Song) => void;
  onCancel: () => void;
}

export function SongEditor({ song, onSave, onCancel }: SongEditorProps) {
  const [editedSong, setEditedSong] = useState<Song>(song);

  const updateNote = (index: number, field: keyof Note, value: number) => {
    const newNotes = [...(editedSong.notes || [])];
    newNotes[index] = { ...newNotes[index], [field]: value };
    setEditedSong({ ...editedSong, notes: newNotes });
  };

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-xl border theme-border max-w-2xl w-full max-h-[90vh] flex flex-col">
      <h2 className="text-xl font-bold mb-4 theme-text-primary">Edit Song: {editedSong.title}</h2>
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {editedSong.notes?.map((note, index) => (
          <div key={index} className="flex gap-4 mb-3 items-center p-3 bg-white dark:bg-slate-800 rounded-xl border theme-border">
            <span className="w-20 font-mono text-sm theme-text-secondary">Note: {note.midi}</span>
            <div className="flex items-center gap-2">
              <label className="text-xs theme-text-secondary">Time:</label>
              <input 
                type="number" 
                value={note.time} 
                onChange={(e) => updateNote(index, 'time', parseFloat(e.target.value))} 
                className="w-24 px-3 py-1.5 bg-slate-100 dark:bg-slate-950 border theme-border rounded-lg text-sm theme-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                step="0.1"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs theme-text-secondary">Dur:</label>
              <input 
                type="number" 
                value={note.duration} 
                onChange={(e) => updateNote(index, 'duration', parseFloat(e.target.value))} 
                className="w-24 px-3 py-1.5 bg-slate-100 dark:bg-slate-950 border theme-border rounded-lg text-sm theme-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                step="0.1"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex gap-3 justify-end pt-4 border-t theme-border">
        <button 
          onClick={onCancel}
          className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl theme-text-primary hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors font-medium"
        >
          Cancel
        </button>
        <button 
          onClick={() => onSave(editedSong)}
          className="px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors font-medium shadow-sm"
        >
          Save
        </button>
      </div>
    </div>
  );
}
