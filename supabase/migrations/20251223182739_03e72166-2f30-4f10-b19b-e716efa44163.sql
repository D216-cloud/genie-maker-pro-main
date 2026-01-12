-- Create table for Instagram connections
CREATE TABLE public.instagram_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  instagram_account_id TEXT NOT NULL,
  instagram_username TEXT,
  access_token TEXT NOT NULL,
  page_access_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create table for Instagram automations
CREATE TABLE public.instagram_automations (
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
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for automation logs
CREATE TABLE public.automation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  automation_id UUID REFERENCES public.instagram_automations(id) ON DELETE CASCADE,
  comment_id TEXT,
  commenter_id TEXT,
  comment_text TEXT,
  dm_sent BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.instagram_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for instagram_connections
CREATE POLICY "Users can view their own connections"
ON public.instagram_connections FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own connections"
ON public.instagram_connections FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connections"
ON public.instagram_connections FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connections"
ON public.instagram_connections FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for instagram_automations
CREATE POLICY "Users can view their own automations"
ON public.instagram_automations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own automations"
ON public.instagram_automations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own automations"
ON public.instagram_automations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own automations"
ON public.instagram_automations FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for automation_logs (users can view logs for their automations)
CREATE POLICY "Users can view logs for their automations"
ON public.automation_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.instagram_automations
    WHERE instagram_automations.id = automation_logs.automation_id
    AND instagram_automations.user_id = auth.uid()
  )
);

-- Add triggers for updated_at
CREATE TRIGGER update_instagram_connections_updated_at
BEFORE UPDATE ON public.instagram_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_instagram_automations_updated_at
BEFORE UPDATE ON public.instagram_automations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();