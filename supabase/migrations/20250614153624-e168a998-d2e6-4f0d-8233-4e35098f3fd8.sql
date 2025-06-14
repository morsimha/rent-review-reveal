
-- Create apartments table for shared apartment listings
CREATE TABLE public.apartments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fb_url TEXT,
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER,
  location TEXT,
  image_url TEXT,
  rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  note TEXT,
  apartment_link TEXT,
  contact_phone TEXT,
  contact_name TEXT,
  status TEXT DEFAULT 'not_spoke' CHECK (status IN ('spoke', 'not_spoke', 'no_answer')),
  pets_allowed TEXT DEFAULT 'unknown' CHECK (pets_allowed IN ('yes', 'no', 'unknown')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS but make it public for all users to read and write
ALTER TABLE public.apartments ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view all apartments
CREATE POLICY "Anyone can view apartments" 
  ON public.apartments 
  FOR SELECT 
  USING (true);

-- Allow everyone to insert apartments
CREATE POLICY "Anyone can create apartments" 
  ON public.apartments 
  FOR INSERT 
  WITH CHECK (true);

-- Allow everyone to update apartments
CREATE POLICY "Anyone can update apartments" 
  ON public.apartments 
  FOR UPDATE 
  USING (true);

-- Allow everyone to delete apartments
CREATE POLICY "Anyone can delete apartments" 
  ON public.apartments 
  FOR DELETE 
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_apartments_updated_at 
    BEFORE UPDATE ON public.apartments 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
