
-- Add columns to track player readiness
ALTER TABLE public.game_sessions ADD COLUMN IF NOT EXISTS player1_ready BOOLEAN DEFAULT false;
ALTER TABLE public.game_sessions ADD COLUMN IF NOT EXISTS player2_ready BOOLEAN DEFAULT false;
ALTER TABLE public.game_sessions ADD COLUMN IF NOT EXISTS player1_device_id TEXT;
ALTER TABLE public.game_sessions ADD COLUMN IF NOT EXISTS player2_device_id TEXT;
