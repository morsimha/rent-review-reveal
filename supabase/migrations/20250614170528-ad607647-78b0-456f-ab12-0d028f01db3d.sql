
-- Create a table for high scores
CREATE TABLE public.cat_game_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT,
  score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create an index on score for faster queries when fetching high scores
CREATE INDEX idx_cat_game_scores_score ON public.cat_game_scores(score DESC);

-- Enable Row Level Security (but allow public access for this game)
ALTER TABLE public.cat_game_scores ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read scores (for leaderboard)
CREATE POLICY "Anyone can view cat game scores" 
  ON public.cat_game_scores 
  FOR SELECT 
  TO public
  USING (true);

-- Create policy to allow anyone to insert scores
CREATE POLICY "Anyone can insert cat game scores" 
  ON public.cat_game_scores 
  FOR INSERT 
  TO public
  WITH CHECK (true);
