
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GameSession {
  id: string;
  current_turn: string;
  last_player_device_id: string | null;
  session_name: string;
  drawing_id: string | null;
  draft_canvas_data: string | null;
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

  // Whose turn?
  const isMyTurn = () => {
    if (!currentSession) return false;
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
    setCurrentSession
  };
};
