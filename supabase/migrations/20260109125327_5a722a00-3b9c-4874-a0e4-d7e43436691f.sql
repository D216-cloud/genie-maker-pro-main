-- Add profile_picture_url column to instagram_connections
ALTER TABLE public.instagram_connections 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Add account_type column
ALTER TABLE public.instagram_connections 
ADD COLUMN IF NOT EXISTS account_type TEXT;

-- Add media_count column  
ALTER TABLE public.instagram_connections 
ADD COLUMN IF NOT EXISTS media_count INTEGER;