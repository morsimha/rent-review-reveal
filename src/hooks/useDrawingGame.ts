
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GameSession {
  id: string;
  current_turn: string;
  last_player_device_id: string | null;
  session_name: string;
  drawing_id: string | null;
  draft_canvas_data: string | null; // <-- FIX: add this property
}

export const useDrawingGame = () => {
  const [loading, setLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [deviceId] = useState(() => {
    // Generate a unique device ID for this browser session
    let id = localStorage.getItem('drawing_game_device_id');
    if (!id) {
      id = `device_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
      localStorage.setItem('drawing_game_device_id', id);
    }
    return id;
  });

  // Get or create the default game session
  const initializeSession = async () => {
    try {
      // First try to get existing session
      const { data: existingSession, error: fetchError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('session_name', 'default_session')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching session:', fetchError);
        return { success: false, error: fetchError };
      }

      if (existingSession) {
        setCurrentSession(existingSession);
        return { success: true, data: existingSession };
      }

      // Create new session if none exists
      const { data: newSession, error: createError } = await supabase
        .from('game_sessions')
        .insert({
          session_name: 'default_session',
          current_turn: 'player1',
          last_player_device_id: null
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating session:', createError);
        return { success: false, error: createError };
      }

      setCurrentSession(newSession);
      return { success: true, data: newSession };
    } catch (error) {
      console.error('Error initializing session:', error);
      return { success: false, error };
    }
  };

  // Switch turn to the other player
  const switchTurn = async () => {
    if (!currentSession) return { success: false, error: 'No active session' };

    setLoading(true);
    try {
      const newTurn = currentSession.current_turn === 'player1' ? 'player2' : 'player1';
      
      const { data, error } = await supabase
        .from('game_sessions')
        .update({
          current_turn: newTurn,
          last_player_device_id: deviceId
        })
        .eq('id', currentSession.id)
        .select()
        .single();

      if (error) {
        console.error('Error switching turn:', error);
        return { success: false, error };
      }

      setCurrentSession(data);
      return { success: true, data };
    } catch (error) {
      console.error('Error in switchTurn:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Check if it's this device's turn
  const isMyTurn = () => {
    if (!currentSession) return false;
    
    // If no one has played yet, player1 can start
    if (!currentSession.last_player_device_id) {
      return currentSession.current_turn === 'player1';
    }
    
    // If someone else played last, it's my turn
    return currentSession.last_player_device_id !== deviceId;
  };

  // Get current player name
  const getCurrentPlayerName = () => {
    if (!currentSession) return 'מור';
    return currentSession.current_turn === 'player1' ? 'מור' : 'גבי';
  };

  const saveDrawing = async (
    drawingData: string,
    currentTurn: 'player1' | 'player2',
    isCompleted: boolean = false,
    drawingName?: string
  ) => {
    setLoading(true);
    try {
      console.log('Saving drawing with data:', { drawingData: drawingData.substring(0, 50) + '...', currentTurn, isCompleted, drawingName });

      const { data, error } = await supabase
        .from('drawings')
        .insert({
          drawing_data: drawingData,
          current_turn: currentTurn,
          is_completed: isCompleted,
          drawing_name: drawingName || null,
          device_id: deviceId,
          session_id: currentSession?.id || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving drawing:', error);
        throw error;
      }

      console.log('Drawing saved successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Error in saveDrawing:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const getDrawings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('drawings')
        .select('*')
        .eq('is_completed', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching drawings:', error);
        throw error;
      }

      console.log('Fetched drawings:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Error in getDrawings:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const updateDrawingName = async (drawingId: string, name: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('drawings')
        .update({ drawing_name: name })
        .eq('id', drawingId)
        .select()
        .single();

      if (error) {
        console.error('Error updating drawing name:', error);
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in updateDrawingName:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const deleteDrawing = async (drawingId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('drawings')
        .delete()
        .eq('id', drawingId);

      if (error) {
        console.error('Error deleting drawing:', error);
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deleteDrawing:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Save the draft canvas to the current session
  const saveDraftCanvas = async (draftCanvasData: string) => {
    if (!currentSession) return { success: false, error: "No active session" };
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .update({ draft_canvas_data: draftCanvasData })
        .eq('id', currentSession.id)
        .select()
        .single();

      if (error) {
        console.error('Error saving draft canvas:', error);
        return { success: false, error };
      }
      setCurrentSession(data);
      return { success: true };
    } catch (error) {
      console.error('Error in saveDraftCanvas:', error);
      return { success: false, error };
    }
  };

  // Fetch the current draft canvas from the session
  const getDraftCanvasData = () => currentSession?.draft_canvas_data || null;

  // Subscribe to real-time updates for the game session
  useEffect(() => {
    const channel = supabase
      .channel('game-session-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_sessions'
        },
        (payload) => {
          console.log('Game session updated:', payload);
          if (payload.new && typeof payload.new === 'object') {
            setCurrentSession(payload.new as GameSession);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
