
-- First, let's find the user ID for moroy9@gmail.com (if they exist)
-- If they don't exist, we'll need to handle this differently

-- Update existing apartments to belong to the user with email moroy9@gmail.com
-- This assumes the user exists in auth.users
UPDATE public.apartments 
SET user_id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'moroy9@gmail.com' 
  LIMIT 1
)
WHERE user_id IS NULL;

-- Do the same for scanned_apartments
UPDATE public.scanned_apartments 
SET user_id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'moroy9@gmail.com' 
  LIMIT 1
)
WHERE user_id IS NULL;

-- Make sure user_id is not nullable for future inserts (optional but recommended)
ALTER TABLE public.apartments ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.scanned_apartments ALTER COLUMN user_id SET NOT NULL;
