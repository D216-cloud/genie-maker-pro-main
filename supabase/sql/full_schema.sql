-- Full schema for ReelyChat (run this in Supabase SQL editor)
-- Includes required tables, RLS policies, triggers, and helper functions

-- Make sure pgcrypto is enabled for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper: function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Helper: handle new auth.users -> create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone, email, provider)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'provider', COALESCE(NEW.app_metadata ->> 'provider', ''))
  );
  RETURN NEW;
END;
$$;

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,  email TEXT,
  provider TEXT,  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own profile') THEN
    EXECUTE 'CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id)';
  END IF;
END;
$do$; 

DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own profile') THEN
    EXECUTE 'CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id)';
  END IF;
END;
$do$; 

DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own profile') THEN
    EXECUTE 'CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
END;
$do$; 

-- Trigger for profiles timestamps
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Instagram connections (accounts)
CREATE TABLE IF NOT EXISTS public.instagram_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  instagram_account_id TEXT NOT NULL,
  instagram_username TEXT,
  access_token TEXT NOT NULL,
  page_access_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  profile_picture_url TEXT,
  account_type TEXT,
  media_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Instagram automations
CREATE TABLE IF NOT EXISTS public.instagram_automations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL DEFAULT 'comment',
  media_id TEXT,
  media_type TEXT,
  media_thumbnail TEXT,
  media_caption TEXT,
  apply_to_all BOOLEAN DEFAULT false,
  keywords TEXT[] DEFAULT '{}',
  dm_message TEXT NOT NULL,
  auto_reply_enabled BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  comment_responses text[] DEFAULT NULL,
  ask_follow boolean DEFAULT false,
  follow_opening_message text DEFAULT NULL,
  follow_check_message text DEFAULT NULL,
  follow_button_text text DEFAULT 'Send me the access',
  follow_retry_action text DEFAULT 'send_anyway',
  ask_email boolean DEFAULT false,
  dm_type text DEFAULT 'text',
  dm_button_text text DEFAULT NULL,
  dm_button_url text DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Constraint: media_id required when apply_to_all is false
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_media_id_required'
  ) THEN
    EXECUTE 'ALTER TABLE public.instagram_automations ADD CONSTRAINT check_media_id_required CHECK (apply_to_all = true OR media_id IS NOT NULL)';
  END IF;
END;
$$;

-- Automation logs
CREATE TABLE IF NOT EXISTS public.automation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  automation_id UUID REFERENCES public.instagram_automations(id) ON DELETE CASCADE,
  comment_id TEXT,
  commenter_id TEXT,
  comment_text TEXT,
  dm_sent BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS and policies
ALTER TABLE public.instagram_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own connections') THEN
    EXECUTE 'CREATE POLICY "Users can view their own connections" ON public.instagram_connections FOR SELECT USING (auth.uid() = user_id)';
  END IF;
END;
$do$; 

DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own connections') THEN
    EXECUTE 'CREATE POLICY "Users can insert their own connections" ON public.instagram_connections FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
END;
$do$; 

DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own connections') THEN
    EXECUTE 'CREATE POLICY "Users can update their own connections" ON public.instagram_connections FOR UPDATE USING (auth.uid() = user_id)';
  END IF;
END;
$do$; 

DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own connections') THEN
    EXECUTE 'CREATE POLICY "Users can delete their own connections" ON public.instagram_connections FOR DELETE USING (auth.uid() = user_id)';
  END IF;
END;
$do$; 

DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own automations') THEN
    EXECUTE 'CREATE POLICY "Users can view their own automations" ON public.instagram_automations FOR SELECT USING (auth.uid() = user_id)';
  END IF;
END;
$do$; 

DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own automations') THEN
    EXECUTE 'CREATE POLICY "Users can insert their own automations" ON public.instagram_automations FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
END;
$do$; 

DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own automations') THEN
    EXECUTE 'CREATE POLICY "Users can update their own automations" ON public.instagram_automations FOR UPDATE USING (auth.uid() = user_id)';
  END IF;
END;
$do$; 

DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own automations') THEN
    EXECUTE 'CREATE POLICY "Users can delete their own automations" ON public.instagram_automations FOR DELETE USING (auth.uid() = user_id)';
  END IF;
END;
$do$; 

DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view logs for their automations') THEN
    EXECUTE 'CREATE POLICY "Users can view logs for their automations" ON public.automation_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.instagram_automations WHERE instagram_automations.id = automation_logs.automation_id AND instagram_automations.user_id = auth.uid()))';
  END IF;
END;
$do$; 

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_instagram_connections_updated_at ON public.instagram_connections;
CREATE TRIGGER update_instagram_connections_updated_at
BEFORE UPDATE ON public.instagram_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_instagram_automations_updated_at ON public.instagram_automations;
CREATE TRIGGER update_instagram_automations_updated_at
BEFORE UPDATE ON public.instagram_automations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to create profile on auth.user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Optional: example index to speed lookups
CREATE INDEX IF NOT EXISTS idx_instagram_connections_user_id ON public.instagram_connections (user_id);
CREATE INDEX IF NOT EXISTS idx_instagram_automations_user_id ON public.instagram_automations (user_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_automation_id ON public.automation_logs (automation_id);

-- Done
COMMENT ON TABLE public.instagram_connections IS 'Stores Instagram account connections for users';
COMMENT ON TABLE public.instagram_automations IS 'Auto DM automations configuration for users';
COMMENT ON TABLE public.automation_logs IS 'Logs produced by automations for debugging and audit';

-- End of file
