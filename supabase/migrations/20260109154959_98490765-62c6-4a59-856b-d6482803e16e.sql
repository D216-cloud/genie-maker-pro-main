-- Add new columns for enhanced AutoDM features
ALTER TABLE public.instagram_automations 
ADD COLUMN IF NOT EXISTS comment_responses text[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS ask_follow boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS follow_opening_message text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS follow_check_message text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS follow_button_text text DEFAULT 'Send me the access',
ADD COLUMN IF NOT EXISTS follow_retry_action text DEFAULT 'send_anyway',
ADD COLUMN IF NOT EXISTS ask_email boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS dm_type text DEFAULT 'text',
ADD COLUMN IF NOT EXISTS dm_button_text text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS dm_button_url text DEFAULT NULL;