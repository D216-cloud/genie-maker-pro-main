import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Automation {
  id: string;
  name: string;
  trigger_type: string;
  media_id: string | null;
  media_type: string | null;
  media_thumbnail: string | null;
  media_caption: string | null;
  apply_to_all: boolean;
  keywords: string[];
  dm_message: string;
  auto_reply_enabled: boolean;
  is_active: boolean;
  created_at: string;
}

interface CreateAutomationParams {
  name: string;
  triggerType: string;
  mediaId?: string;
  mediaType?: string;
  mediaThumbnail?: string;
  mediaCaption?: string;
  applyToAll?: boolean;
  keywords: string[];
  dmMessage: string;
  autoReplyEnabled?: boolean;
}

export const useAutomations = () => {
  const { user } = useAuth();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch automations
  const fetchAutomations = useCallback(async () => {
    if (!user) {
      setAutomations([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('instagram_automations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAutomations(data as Automation[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAutomations();
  }, [fetchAutomations]);

  // Create automation
  const createAutomation = useCallback(async (params: CreateAutomationParams) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    // VALIDATION: Either apply_to_all must be true OR media_id must be provided
    const isApplyToAll = params.applyToAll === true;
    if (!isApplyToAll && !params.mediaId) {
      return { success: false, error: 'You must select a specific post or choose "Apply to all posts"' };
    }

    console.log('Creating automation with params:', {
      mediaId: params.mediaId,
      applyToAll: isApplyToAll,
      triggerType: params.triggerType,
    });

    const { data, error } = await supabase
      .from('instagram_automations')
      .insert({
        user_id: user.id,
        name: params.name,
        trigger_type: params.triggerType,
        media_id: isApplyToAll ? null : params.mediaId,
        media_type: params.mediaType || null,
        media_thumbnail: params.mediaThumbnail || null,
        media_caption: params.mediaCaption || null,
        apply_to_all: isApplyToAll,
        keywords: params.keywords,
        dm_message: params.dmMessage,
        auto_reply_enabled: params.autoReplyEnabled ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create automation:', error);
      return { success: false, error: error.message };
    }

    console.log('Automation created successfully:', data);
    setAutomations(prev => [data as Automation, ...prev]);
    return { success: true, automation: data };
  }, [user]);

  // Update automation
  const updateAutomation = useCallback(async (id: string, updates: Partial<Automation>) => {
    const { error } = await supabase
      .from('instagram_automations')
      .update(updates)
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    setAutomations(prev => 
      prev.map(a => a.id === id ? { ...a, ...updates } : a)
    );
    return { success: true };
  }, []);

  // Toggle automation active status
  const toggleAutomation = useCallback(async (id: string) => {
    const automation = automations.find(a => a.id === id);
    if (!automation) return;

    return updateAutomation(id, { is_active: !automation.is_active });
  }, [automations, updateAutomation]);

  // Delete automation
  const deleteAutomation = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('instagram_automations')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    setAutomations(prev => prev.filter(a => a.id !== id));
    return { success: true };
  }, []);

  return {
    automations,
    loading,
    createAutomation,
    updateAutomation,
    toggleAutomation,
    deleteAutomation,
    refetch: fetchAutomations,
  };
};
