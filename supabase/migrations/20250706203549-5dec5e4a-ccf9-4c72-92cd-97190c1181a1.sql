
-- Update existing apartments to belong to the specific user email
-- First, we need to enable authentication and create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Add user_id column to apartments table if it doesn't exist
ALTER TABLE public.apartments ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies for apartments to be user-specific
DROP POLICY IF EXISTS "Anyone can view apartments" ON public.apartments;
DROP POLICY IF EXISTS "Anyone can create apartments" ON public.apartments;
DROP POLICY IF EXISTS "Anyone can update apartments" ON public.apartments;
DROP POLICY IF EXISTS "Anyone can delete apartments" ON public.apartments;

-- Create new user-specific policies for apartments
CREATE POLICY "Users can view their own apartments" ON public.apartments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own apartments" ON public.apartments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own apartments" ON public.apartments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own apartments" ON public.apartments
  FOR DELETE USING (auth.uid() = user_id);

-- Update scanned_apartments table to be user-specific as well
ALTER TABLE public.scanned_apartments ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies for scanned_apartments
DROP POLICY IF EXISTS "Allow public read access to scanned apartments" ON public.scanned_apartments;
DROP POLICY IF EXISTS "Allow public insert access to scanned apartments" ON public.scanned_apartments;
DROP POLICY IF EXISTS "Allow public delete access to scanned apartments" ON public.scanned_apartments;
DROP POLICY IF EXISTS "Authenticated users can select scanned apartments" ON public.scanned_apartments;
DROP POLICY IF EXISTS "Authenticated users can insert scanned apartments" ON public.scanned_apartments;
DROP POLICY IF EXISTS "Authenticated users can update scanned apartments" ON public.scanned_apartments;
DROP POLICY IF EXISTS "Authenticated users can delete scanned apartments" ON public.scanned_apartments;

CREATE POLICY "Users can view their own scanned apartments" ON public.scanned_apartments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scanned apartments" ON public.scanned_apartments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scanned apartments" ON public.scanned_apartments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scanned apartments" ON public.scanned_apartments
  FOR DELETE USING (auth.uid() = user_id);

-- Note: We'll set the user_id for existing apartments after user registration in the application code
