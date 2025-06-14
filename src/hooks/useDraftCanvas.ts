
import { supabase } from '@/integrations/supabase/client';
import { GameSession } from './useGameSession';

export const useDraftCanvas = (
  currentSession: GameSession | null,
  setCurrentSession: (session: GameSession) => void
) => {
  // Save draft canvas for session
  const saveDraftCanvas = async (draftCanvasData: string) => {
    if (!currentSession) return { success: false, error: "No active session" };
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .update({ draft_canvas_data: draftCanvasData })
        .eq('id', currentSession.id)
        .select('*')
        .single();
      if (error) {
        console.error('Error saving draft canvas:', error);
        return { success: false, error };
      }
      setCurrentSession(data as GameSession);
      return { success: true };
    } catch (error) {
      console.error('Error in saveDraftCanvas:', error);
      return { success: false, error };
    }
  };

  // Get current draft
  const getDraftCanvasData = () => currentSession?.draft_canvas_data || null;

  return { saveDraftCanvas, getDraftCanvasData };
};
