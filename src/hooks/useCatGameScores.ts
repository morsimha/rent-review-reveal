
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CatGameScore {
  id: string;
  player_name: string | null;
  score: number;
  created_at: string;
}

export const useCatGameScores = () => {
  const [scores, setScores] = useState<CatGameScore[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTopScores = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cat_game_scores')
        .select('*')
        .order('score', { ascending: false })
        .limit(5);

      if (error) throw error;
      setScores(data || []);
    } catch (error) {
      console.error('Error fetching scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveScore = async (score: number, playerName?: string) => {
    try {
      const { error } = await supabase
        .from('cat_game_scores')
        .insert({
          score,
          player_name: playerName || null
        });

      if (error) throw error;
      
      // Refresh scores after saving
      await fetchTopScores();
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  useEffect(() => {
    fetchTopScores();
  }, []);

  return {
    scores,
    loading,
    saveScore,
    fetchTopScores
  };
};
