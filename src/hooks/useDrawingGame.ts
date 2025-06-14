
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
      // First insert the basic drawing data
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

      // If there's a drawing name, update the record with it
      if (drawingName && data) {
        const { error: updateError } = await supabase
          .from('drawings')
          .update({ drawing_name: drawingName } as any)
          .eq('id', data.id);
        
        if (updateError) {
          console.error('Error updating drawing name:', updateError);
        }
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
        .eq('is_completed', true)
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

  const updateDrawingName = async (drawingId: string, name: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('drawings')
        .update({ drawing_name: name } as any)
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

  return {
    loading,
    saveDrawing,
    getDrawings,
    updateDrawingName
  };
};
