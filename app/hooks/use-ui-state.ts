// app/hooks/use-ui-state.ts v2.3.2
'use client';
import { useState } from 'react';

export function useUiState() {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);

  const toggleFullScreen = () => setIsFullScreen(!isFullScreen);

  return { 
    isFullScreen, 
    toggleFullScreen,
    showSettings,
    setShowSettings,
    showLibrary,
    setShowLibrary
  };
}

export const useUIState = useUiState;
