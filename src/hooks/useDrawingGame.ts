
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useDrawingGame = () => {
  const [loading, setLoading] = useState(false);

  const saveDrawing = async (
    drawingData: string,
    currentTurn: 'player1' | 'player2',
    isCompleted: boolean = false
  ) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('drawings')
        .insert({
          drawing_data: drawingData,
          current_turn: currentTurn,
          is_completed: isCompleted
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving drawing:', error);
        throw error;
      }

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
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching drawings:', error);
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in getDrawings:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    saveDrawing,
    getDrawings
  };
};
