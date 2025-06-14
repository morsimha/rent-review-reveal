
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useDrawingGame = () => {
  const [loading, setLoading] = useState(false);

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
          drawing_name: drawingName || null
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

  return {
    loading,
    saveDrawing,
    getDrawings,
    updateDrawingName,
    deleteDrawing
  };
};
