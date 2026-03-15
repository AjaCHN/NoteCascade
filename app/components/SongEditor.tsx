// app/components/SongEditor.tsx v2.3.1
'use client';
import React, { useState } from 'react';
import { Song, Note } from '../lib/songs';
import { Button } from './ui/button';
import { Input } from './ui/input';

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
    <div className="p-4 bg-background rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Edit Song: {editedSong.title}</h2>
      <div className="max-h-96 overflow-y-auto">
        {editedSong.notes?.map((note, index) => (
          <div key={index} className="flex gap-2 mb-2 items-center">
            <span className="w-16">Note: {note.midi}</span>
            <Input type="number" value={note.time} onChange={(e) => updateNote(index, 'time', parseFloat(e.target.value))} className="w-20" />
            <Input type="number" value={note.duration} onChange={(e) => updateNote(index, 'duration', parseFloat(e.target.value))} className="w-20" />
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <Button onClick={() => onSave(editedSong)}>Save</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
