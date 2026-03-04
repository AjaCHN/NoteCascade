// app/hooks/use-playback-logic.ts v2.0.1
import { useState, useCallback, useEffect } from 'react';
import * as Tone from 'tone';
import { Song } from '../lib/songs/types';
import { initAudio, startTransport, stopTransport, clearScheduledEvents, ensureAudioContext, scheduleNote, resetAudioEffects } from '../lib/audio';
import { usePracticeLogic } from './use-practice-logic';

export function usePlaybackLogic(
  selectedSong: Song,
  playMode: string,
  activeNotes: Map<number, number>,
  setActiveNotes: React.Dispatch<React.SetStateAction<Map<number, number>>>,
  handleSongEnd: () => void
) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const { handlePracticePause } = usePracticeLogic(playMode, selectedSong, activeNotes);

  const resetPlayback = useCallback(() => {
    setIsPlaying(false);
    stopTransport();
    resetAudioEffects();
    setCurrentTime(0);
  }, []);

  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      setIsPlaying(false);
      stopTransport();
      resetAudioEffects();
      clearScheduledEvents();
      setActiveNotes(new Map());
    } else {
      await initAudio();
      await ensureAudioContext();
      
      if (currentTime >= (selectedSong.duration || 0)) setCurrentTime(0);
      Tone.Transport.seconds = currentTime;

      if (playMode === 'demo') {
        clearScheduledEvents();
        selectedSong.notes?.forEach(note => {
          scheduleNote(
            note,
            () => setActiveNotes(prev => new Map(prev).set(note.midi, note.velocity)),
            () => setActiveNotes(prev => {
              const next = new Map(prev);
              next.delete(note.midi);
              return next;
            })
          );
        });
      }

      setIsPlaying(true);
      startTransport();
    }
  }, [isPlaying, currentTime, selectedSong, playMode, setActiveNotes]);

  useEffect(() => {
    let animationFrame: number;
    const updateTime = () => {
      if (isPlaying) {
        let time = Tone.Transport.seconds;
        time = handlePracticePause(time);
        setCurrentTime(time);
        
        if (time >= (selectedSong.duration || 0)) {
           setIsPlaying(false);
           stopTransport();
           resetAudioEffects();
           clearScheduledEvents();
           handleSongEnd();
           setActiveNotes(new Map());
           return;
        }
        animationFrame = requestAnimationFrame(updateTime);
      }
    };
    
    if (isPlaying) updateTime();
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, selectedSong, handleSongEnd, setActiveNotes, playMode, activeNotes, handlePracticePause]);

  return {
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    togglePlay,
    resetPlayback
  };
}
