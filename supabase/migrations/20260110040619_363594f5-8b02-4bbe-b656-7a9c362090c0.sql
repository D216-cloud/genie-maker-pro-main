-- Add constraint: media_id required when apply_to_all is false
ALTER TABLE public.instagram_automations
ADD CONSTRAINT check_media_id_required 
CHECK (apply_to_all = true OR media_id IS NOT NULL);