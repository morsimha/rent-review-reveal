
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GameSession {
  id: string;
  current_turn: string;
  last_player_device_id: string | null;
  session_name: string;
  drawing_id: string | null;
  draft_canvas_data: string | null;
  player1_ready: boolean;
  player2_ready: boolean;
  player1_device_id: string | null;
  player2_device_id: string | null;
}

export const useGameSession = () => {
  const [loading, setLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [deviceId] = useState(() => {
    let id = localStorage.getItem('drawing_game_device_id');
    if (!id) {
      id = `device_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
      localStorage.setItem('drawing_game_device_id', id);
    }
    return id;
  });

  // Initialize (get or create) default session
  const initializeSession = async () => {
    try {
      const { data: existingSession, error: fetchError } = await supabase
        .from('game_sessions')
        .select(`
          id,
          current_turn,
          last_player_device_id,
          session_name,
          drawing_id,
          draft_canvas_data,
          player1_ready,
          player2_ready,
          player1_device_id,
          player2_device_id
        `)
        .eq('session_name', 'default_session')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching session:', fetchError);
        return { success: false, error: fetchError };
      }
      if (existingSession) {
        setCurrentSession(existingSession as GameSession);
        return { success: true, data: existingSession };
      }
      const { data: newSession, error: createError } = await supabase
        .from('game_sessions')
        .insert({
          session_name: 'default_session',
          current_turn: 'player1',
          last_player_device_id: null,
          player1_ready: false,
          player2_ready: false,
          player1_device_id: null,
          player2_device_id: null
        })
        .select(`
          id,
          current_turn,
          last_player_device_id,
          session_name,
          drawing_id,
          draft_canvas_data,
          player1_ready,
          player2_ready,
          player1_device_id,
          player2_device_id
        `)
        .single();

      if (createError) {
        console.error('Error creating session:', createError);
        return { success: false, error: createError };
      }
      setCurrentSession(newSession as GameSession);
      return { success: true, data: newSession };
    } catch (error) {
      console.error('Error initializing session:', error);
      return { success: false, error };
    }
  };

  // Join game as a player
  const joinGame = async () => {
    if (!currentSession) return { success: false, error: 'No active session' };
    setLoading(true);
    try {
      let updateData: any = {};
      
      // Determine which player slot to take
      if (!currentSession.player1_device_id) {
        updateData = {
          player1_device_id: deviceId,
          player1_ready: true
        };
      } else if (!currentSession.player2_device_id && currentSession.player1_device_id !== deviceId) {
        updateData = {
          player2_device_id: deviceId,
          player2_ready: true
        };
      } else if (currentSession.player1_device_id === deviceId) {
        updateData = { player1_ready: true };
      } else if (currentSession.player2_device_id === deviceId) {
        updateData = { player2_ready: true };
      } else {
        return { success: false, error: 'Game is full' };
      }

      const { data, error } = await supabase
        .from('game_sessions')
        .update(updateData)
        .eq('id', currentSession.id)
        .select(`
          id,
          current_turn,
          last_player_device_id,
          session_name,
          drawing_id,
          draft_canvas_data,
          player1_ready,
          player2_ready,
          player1_device_id,
          player2_device_id
        `)
        .single();

      if (error) {
        console.error('Error joining game:', error);
        return { success: false, error };
      }
      setCurrentSession(data as GameSession);
      return { success: true, data };
    } catch (error) {
      console.error('Error in joinGame:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Leave game
  const leaveGame = async () => {
    if (!currentSession) return { success: false, error: 'No active session' };
    setLoading(true);
    try {
      let updateData: any = {};
      
      if (currentSession.player1_device_id === deviceId) {
        updateData = {
          player1_device_id: null,
          player1_ready: false
        };
      } else if (currentSession.player2_device_id === deviceId) {
        updateData = {
          player2_device_id: null,
          player2_ready: false
        };
      }

      const { data, error } = await supabase
        .from('game_sessions')
        .update(updateData)
        .eq('id', currentSession.id)
        .select(`
          id,
          current_turn,
          last_player_device_id,
          session_name,
          drawing_id,
          draft_canvas_data,
          player1_ready,
          player2_ready,
          player1_device_id,
          player2_device_id
        `)
        .single();

      if (error) {
        console.error('Error leaving game:', error);
        return { success: false, error };
      }
      setCurrentSession(data as GameSession);
      return { success: true, data };
    } catch (error) {
      console.error('Error in leaveGame:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Switch player turn logic
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
        .select(`
          id,
          current_turn,
          last_player_device_id,
          session_name,
          drawing_id,
          draft_canvas_data,
          player1_ready,
          player2_ready,
          player1_device_id,
          player2_device_id
        `)
        .single();

      if (error) {
        console.error('Error switching turn:', error);
        return { success: false, error };
      }
      setCurrentSession(data as GameSession);
      return { success: true, data };
    } catch (error) {
      console.error('Error in switchTurn:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Check if game is ready (both players joined)
  const isGameReady = () => {
    return currentSession?.player1_ready && currentSession?.player2_ready;
  };

  // Check if current device is a player
  const isPlayer = () => {
    return currentSession?.player1_device_id === deviceId || currentSession?.player2_device_id === deviceId;
  };

  // Check if current device is ready
  const isReady = () => {
    if (currentSession?.player1_device_id === deviceId) {
      return currentSession?.player1_ready;
    }
    if (currentSession?.player2_device_id === deviceId) {
      return currentSession?.player2_ready;
    }
    return false;
  };

  // Whose turn?
  const isMyTurn = () => {
    if (!currentSession || !isGameReady()) return false;
    if (!currentSession.last_player_device_id) {
      return currentSession.current_turn === 'player1';
    }
    return currentSession.last_player_device_id !== deviceId;
  };

  // Get current player
  const getCurrentPlayerName = () => {
    if (!currentSession) return 'מור';
    return currentSession.current_turn === 'player1' ? 'מור' : 'גבי';
  };

  // Subscribe to realtime changes
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
          if (payload.new && typeof payload.new === 'object') {
            // Ensure the payload has all required fields
            const sessionData = payload.new as any;
            const completeSession: GameSession = {
              id: sessionData.id,
              current_turn: sessionData.current_turn,
              last_player_device_id: sessionData.last_player_device_id,
              session_name: sessionData.session_name,
              drawing_id: sessionData.drawing_id,
              draft_canvas_data: sessionData.draft_canvas_data,
              player1_ready: sessionData.player1_ready || false,
              player2_ready: sessionData.player2_ready || false,
              player1_device_id: sessionData.player1_device_id || null,
              player2_device_id: sessionData.player2_device_id || null,
            };
            setCurrentSession(completeSession);
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
    joinGame,
    leaveGame,
    switchTurn,
    isMyTurn,
    getCurrentPlayerName,
    setCurrentSession,
    isGameReady,
    isPlayer,
    isReady
  };
};
