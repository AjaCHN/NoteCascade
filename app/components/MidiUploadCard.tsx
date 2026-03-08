'use client';

import React, { useRef, useState } from 'react';
import { Upload, Music, FileMusic } from 'lucide-react';
import { useLocale } from '../lib/store';
import { translations, Translation } from '../lib/translations';
import { type Song } from '../lib/songs';
import { parseMidiFile } from '../lib/songs/midi';

interface MidiUploadCardProps {
  onUpload: (song: Song) => void;
}

export function MidiUploadCard({ onUpload }: MidiUploadCardProps) {
  const locale = useLocale();
  const t: Translation = translations[locale];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.mid') && !file.name.toLowerCase().endsWith('.midi')) {
      alert(t.game.midiParseError || 'Invalid file format. Please upload a .mid or .midi file.');
      return;
    }

    setIsProcessing(true);
    try {
      const song = await parseMidiFile(file);
      onUpload(song);
    } catch (error) {
      console.error('Failed to parse MIDI:', error);
      alert(t.game.midiParseError || 'Failed to parse MIDI file.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`
        relative group cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300
        flex flex-col items-center justify-center p-6 h-[180px]
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]' 
          : 'theme-border theme-bg-secondary hover:border-indigo-500/50 hover:bg-white/5'
        }
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        accept=".mid,.midi"
        className="hidden"
      />

      <div className={`
        w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300
        ${isDragging ? 'bg-indigo-500 text-white rotate-12 scale-110' : 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white'}
      `}>
        {isProcessing ? (
          <Music className="w-8 h-8 animate-spin" />
        ) : (
          <Upload className="w-8 h-8" />
        )}
      </div>

      <h3 className="text-sm font-black uppercase tracking-widest theme-text-primary mb-1">
        {isProcessing ? 'Processing...' : t.common.uploadMidi || 'Import MIDI'}
      </h3>
      
      <p className="text-[10px] font-bold uppercase tracking-wider theme-text-secondary text-center opacity-60 group-hover:opacity-100 transition-opacity">
        {isDragging ? 'Drop to upload' : 'Drag & Drop or Click'}
      </p>

      {/* Decorative background icon */}
      <FileMusic className="absolute -bottom-8 -right-8 w-32 h-32 text-indigo-500/5 rotate-[-15deg] pointer-events-none transition-transform duration-500 group-hover:rotate-0 group-hover:scale-110" />
    </div>
  );
}
