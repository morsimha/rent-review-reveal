
-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  couple_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create couples table for shared apartment access
CREATE TABLE public.couples (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner2_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(partner1_id)
);

-- Create invitations table for partner invites
CREATE TABLE public.invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days')
);

-- Add couple_id to apartments table to associate apartments with couples
ALTER TABLE public.apartments ADD COLUMN couple_id UUID REFERENCES public.couples(id);

-- Add couple_id to scanned_apartments table
ALTER TABLE public.scanned_apartments ADD COLUMN couple_id UUID REFERENCES public.couples(id);

-- Enable RLS on new tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile and their partner's profile" 
  ON public.profiles 
  FOR SELECT 
  USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM public.couples c 
      WHERE (c.partner1_id = auth.uid() AND (c.partner2_id = id OR c.partner1_id = id))
         OR (c.partner2_id = auth.uid() AND (c.partner1_id = id OR c.partner2_id = id))
    )
  );

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- RLS Policies for couples
CREATE POLICY "Users can view their own couple" 
  ON public.couples 
  FOR SELECT 
  USING (partner1_id = auth.uid() OR partner2_id = auth.uid());

CREATE POLICY "Users can create couples" 
  ON public.couples 
  FOR INSERT 
  WITH CHECK (partner1_id = auth.uid());

CREATE POLICY "Users can update their own couple" 
  ON public.couples 
  FOR UPDATE 
  USING (partner1_id = auth.uid() OR partner2_id = auth.uid());

-- RLS Policies for invitations
CREATE POLICY "Users can view invitations they sent or received" 
  ON public.invitations 
  FOR SELECT 
  USING (
    inviter_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = invitee_email)
  );

CREATE POLICY "Users can create invitations" 
  ON public.invitations 
  FOR INSERT 
  WITH CHECK (inviter_id = auth.uid());

CREATE POLICY "Users can update invitations they received" 
  ON public.invitations 
  FOR UPDATE 
  USING (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = invitee_email)
  );

-- Update RLS policies for apartments to use couple_id
DROP POLICY IF EXISTS "Enable read access for all users" ON public.apartments;
CREATE POLICY "Users can view apartments from their couple" 
  ON public.apartments 
  FOR SELECT 
  USING (
    couple_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.couples c 
      WHERE c.id = couple_id AND (c.partner1_id = auth.uid() OR c.partner2_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert apartments to their couple" 
  ON public.apartments 
  FOR INSERT 
  WITH CHECK (
    couple_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.couples c 
      WHERE c.id = couple_id AND (c.partner1_id = auth.uid() OR c.partner2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update apartments from their couple" 
  ON public.apartments 
  FOR UPDATE 
  USING (
    couple_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.couples c 
      WHERE c.id = couple_id AND (c.partner1_id = auth.uid() OR c.partner2_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete apartments from their couple" 
  ON public.apartments 
  FOR DELETE 
  USING (
    couple_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.couples c 
      WHERE c.id = couple_id AND (c.partner1_id = auth.uid() OR c.partner2_id = auth.uid())
    )
  );

-- Update RLS policies for scanned_apartments
CREATE POLICY "Users can view scanned apartments from their couple" 
  ON public.scanned_apartments 
  FOR SELECT 
  USING (
    couple_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.couples c 
      WHERE c.id = couple_id AND (c.partner1_id = auth.uid() OR c.partner2_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert scanned apartments to their couple" 
  ON public.scanned_apartments 
  FOR INSERT 
  WITH CHECK (
    couple_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.couples c 
      WHERE c.id = couple_id AND (c.partner1_id = auth.uid() OR c.partner2_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete scanned apartments from their couple" 
  ON public.scanned_apartments 
  FOR DELETE 
  USING (
    couple_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.couples c 
      WHERE c.id = couple_id AND (c.partner1_id = auth.uid() OR c.partner2_id = auth.uid())
    )
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  invitation_record RECORD;
  couple_record RECORD;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );

  -- Check if user was invited
  SELECT * INTO invitation_record 
  FROM public.invitations 
  WHERE invitee_email = NEW.email 
    AND status = 'pending' 
    AND expires_at > NOW()
  ORDER BY created_at DESC 
  LIMIT 1;

  IF invitation_record IS NOT NULL THEN
    -- Accept the invitation
    UPDATE public.invitations 
    SET status = 'accepted' 
    WHERE id = invitation_record.id;
    
    -- Add user as partner2 to the couple
    UPDATE public.couples 
    SET partner2_id = NEW.id 
    WHERE id = invitation_record.couple_id;
    
    -- Update user's couple_id
    UPDATE public.profiles 
    SET couple_id = invitation_record.couple_id 
    WHERE id = NEW.id;
  ELSE
    -- Create new couple for the user
    INSERT INTO public.couples (partner1_id)
    VALUES (NEW.id)
    RETURNING * INTO couple_record;
    
    -- Update user's couple_id
    UPDATE public.profiles 
    SET couple_id = couple_record.id 
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_couples_updated_at BEFORE UPDATE ON public.couples FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
