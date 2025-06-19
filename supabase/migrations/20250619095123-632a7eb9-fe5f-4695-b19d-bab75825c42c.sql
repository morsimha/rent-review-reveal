
-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access to scanned apartments" ON public.scanned_apartments;
DROP POLICY IF EXISTS "Allow public insert access to scanned apartments" ON public.scanned_apartments;
DROP POLICY IF EXISTS "Allow public delete access to scanned apartments" ON public.scanned_apartments;

-- Create policy that allows public read access
CREATE POLICY "Allow public read access to scanned apartments" 
  ON public.scanned_apartments 
  FOR SELECT 
  USING (true);

-- Create policy that allows public insert access (for the scanner)
CREATE POLICY "Allow public insert access to scanned apartments" 
  ON public.scanned_apartments 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy that allows public delete access (for moving to main apartments)
CREATE POLICY "Allow public delete access to scanned apartments" 
  ON public.scanned_apartments 
  FOR DELETE 
  USING (true);
