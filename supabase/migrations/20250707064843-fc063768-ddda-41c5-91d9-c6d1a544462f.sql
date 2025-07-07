
-- Remove couple_id column from apartments table
ALTER TABLE public.apartments DROP COLUMN IF EXISTS couple_id;

-- Add user_id column to apartments table if it doesn't exist
ALTER TABLE public.apartments ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing apartments to belong to moroy9@gmail.com
UPDATE public.apartments 
SET user_id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'moroy9@gmail.com' 
  LIMIT 1
)
WHERE user_id IS NULL;

-- Make user_id NOT NULL after setting values
ALTER TABLE public.apartments ALTER COLUMN user_id SET NOT NULL;

-- Remove couple_id column from scanned_apartments table
ALTER TABLE public.scanned_apartments DROP COLUMN IF EXISTS couple_id;

-- Add user_id column to scanned_apartments table if it doesn't exist
ALTER TABLE public.scanned_apartments ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing scanned apartments to belong to moroy9@gmail.com
UPDATE public.scanned_apartments 
SET user_id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'moroy9@gmail.com' 
  LIMIT 1
)
WHERE user_id IS NULL;

-- Make user_id NOT NULL after setting values
ALTER TABLE public.scanned_apartments ALTER COLUMN user_id SET NOT NULL;

-- Drop all existing policies for apartments
DROP POLICY IF EXISTS "Users can view apartments from their couple" ON public.apartments;
DROP POLICY IF EXISTS "Users can insert apartments to their couple" ON public.apartments;
DROP POLICY IF EXISTS "Users can update apartments from their couple" ON public.apartments;
DROP POLICY IF EXISTS "Users can delete apartments from their couple" ON public.apartments;
DROP POLICY IF EXISTS "Anyone can view apartments" ON public.apartments;
DROP POLICY IF EXISTS "Anyone can create apartments" ON public.apartments;
DROP POLICY IF EXISTS "Anyone can update apartments" ON public.apartments;
DROP POLICY IF EXISTS "Anyone can delete apartments" ON public.apartments;

-- Create simple user-based policies for apartments
CREATE POLICY "Users can view their own apartments" ON public.apartments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own apartments" ON public.apartments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own apartments" ON public.apartments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own apartments" ON public.apartments
  FOR DELETE USING (auth.uid() = user_id);

-- Drop all existing policies for scanned_apartments
DROP POLICY IF EXISTS "Users can view scanned apartments from their couple" ON public.scanned_apartments;
DROP POLICY IF EXISTS "Users can insert scanned apartments to their couple" ON public.scanned_apartments;
DROP POLICY IF EXISTS "Users can update scanned apartments from their couple" ON public.scanned_apartments;
DROP POLICY IF EXISTS "Users can delete scanned apartments from their couple" ON public.scanned_apartments;
DROP POLICY IF EXISTS "Allow public read access to scanned apartments" ON public.scanned_apartments;
DROP POLICY IF EXISTS "Allow public insert access to scanned apartments" ON public.scanned_apartments;
DROP POLICY IF EXISTS "Allow public delete access to scanned apartments" ON public.scanned_apartments;
DROP POLICY IF EXISTS "Authenticated users can select scanned apartments" ON public.scanned_apartments;
DROP POLICY IF EXISTS "Authenticated users can insert scanned apartments" ON public.scanned_apartments;
DROP POLICY IF EXISTS "Authenticated users can update scanned apartments" ON public.scanned_apartments;
DROP POLICY IF EXISTS "Authenticated users can delete scanned apartments" ON public.scanned_apartments;

-- Create simple user-based policies for scanned_apartments
CREATE POLICY "Users can view their own scanned apartments" ON public.scanned_apartments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scanned apartments" ON public.scanned_apartments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scanned apartments" ON public.scanned_apartments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scanned apartments" ON public.scanned_apartments
  FOR DELETE USING (auth.uid() = user_id);
