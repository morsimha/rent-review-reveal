
-- Create a table for storing collaborative drawings
CREATE TABLE public.drawings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  drawing_data TEXT NOT NULL, -- JSON string of the drawing data
  current_turn TEXT NOT NULL DEFAULT 'player1', -- whose turn it is (player1 or player2)
  is_completed BOOLEAN NOT NULL DEFAULT false,
  drawing_name TEXT, -- Add the drawing_name column that was missing
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add trigger for updated_at
CREATE TRIGGER update_drawings_updated_at 
    BEFORE UPDATE ON public.drawings 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS (making it public for simplicity as it's a game feature)
ALTER TABLE public.drawings ENABLE ROW LEVEL SECURITY;

-- Allow all operations for everyone (it's a collaborative game)
CREATE POLICY "Allow all operations on drawings" 
  ON public.drawings 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
