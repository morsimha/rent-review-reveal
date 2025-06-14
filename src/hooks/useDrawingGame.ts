
import { useGameSession } from './useGameSession';
import { useDrawings } from './useDrawings';
import { useDraftCanvas } from './useDraftCanvas';

export const useDrawingGame = () => {
  // Game session management hook
  const {
    loading: sessionLoading,
    deviceId,
    currentSession,
    initializeSession,
    switchTurn,
    isMyTurn,
    getCurrentPlayerName,
    setCurrentSession
  } = useGameSession();

  // Drawing CRUD logic
  const {
    loading: drawingsLoading,
    saveDrawing,
    getDrawings,
    updateDrawingName,
    deleteDrawing
  } = useDrawings(deviceId, currentSession?.id || null);

  // Draft canvas logic
  const { saveDraftCanvas, getDraftCanvasData } = useDraftCanvas(currentSession, setCurrentSession);

  // Aggregate loading
  const loading = sessionLoading || drawingsLoading;

  return {
    loading,
    deviceId,
    currentSession,
    initializeSession,
    switchTurn,
    isMyTurn,
    getCurrentPlayerName,
    saveDrawing,
    getDrawings,
    updateDrawingName,
    deleteDrawing,
    saveDraftCanvas,
    getDraftCanvasData
  };
};
