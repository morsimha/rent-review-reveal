
-- Create a table to track the current game session and whose turn it is
CREATE TABLE public.game_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_name TEXT NOT NULL DEFAULT 'default_session',
  current_turn TEXT NOT NULL DEFAULT 'player1',
  last_player_device_id TEXT,
  drawing_id UUID REFERENCES public.drawings(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add a device_id column to track which device made the last move
ALTER TABLE public.drawings ADD COLUMN IF NOT EXISTS device_id TEXT;
ALTER TABLE public.drawings ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.game_sessions(id);

-- Add trigger for updated_at on game_sessions
CREATE TRIGGER update_game_sessions_updated_at 
    BEFORE UPDATE ON public.game_sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- Allow all operations for the game (it's a collaborative game)
CREATE POLICY "Allow all operations on game_sessions" 
  ON public.game_sessions 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Add realtime support for game sessions
ALTER TABLE public.game_sessions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_sessions;
