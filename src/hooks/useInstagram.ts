import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface InstagramConnection {
  id: string;
  instagram_account_id: string;
  instagram_username: string | null;
  access_token: string;
  page_access_token: string | null;
  expires_at: string | null;
  profile_picture_url?: string | null;
  account_type?: string | null;
  media_count?: number | null;
}

interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: string;
  media_url?: string;
  thumbnail_url?: string;
  timestamp: string;
  permalink: string;
  like_count?: number;
  comments_count?: number;
}

export const useInstagram = () => {
  const { user, loading: authLoading } = useAuth();
  const [connection, setConnection] = useState<InstagramConnection | null>(null);
  const [media, setMedia] = useState<InstagramMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  // Fetch existing connection
  useEffect(() => {
    if (!user) {
      setConnection(null);
      setLoading(false);
      return;
    }

    const fetchConnection = async () => {
      try {
        const { data, error, status } = await supabase
          .from('instagram_connections')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        // Table or endpoint not found (404) - do not spam console with errors
        if (status === 404) {
          console.warn('instagram_connections table not found (404) - skipping connection fetch');
          setConnection(null);
          setLoading(false);
          return;
        }

        if (error) {
          console.error('Error fetching instagram connection:', error);
          setConnection(null);
        } else if (data) {
          setConnection(data as InstagramConnection);
        }
      } catch (err) {
        // Network or unexpected error
        console.error('Unexpected error fetching instagram connection:', err);
        setConnection(null);
      } finally {
        setLoading(false);
      }
    };

    fetchConnection();
  }, [user]);

  // Fetch media when connected
  useEffect(() => {
    if (!connection) return;

    const fetchMedia = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('instagram-posts', {
          body: {
            accessToken: connection.page_access_token || connection.access_token,
            instagramAccountId: connection.instagram_account_id,
            action: 'get-media',
          },
        });

        if (!error && data?.media) {
          setMedia(data.media);
        }
      } catch (err) {
        console.error('Error fetching media:', err);
      }
    };

    fetchMedia();
  }, [connection]);

  // Start OAuth flow
  const connectInstagram = useCallback(async () => {
    setConnecting(true);
    try {
      const redirectUri = `${window.location.origin}/dashboard/instagram-callback`;
      console.log('Starting Instagram OAuth with redirect URI:', redirectUri);
      
      const { data, error } = await supabase.functions.invoke('instagram-auth', {
        body: { 
          action: 'get-auth-url',
          redirectUri 
        },
      });

      console.log('Auth URL response:', { data, error });

      if (error) throw error;
      if (data?.authUrl) {
        // Store redirect URI for callback
        localStorage.setItem('instagram_redirect_uri', redirectUri);
        // Redirect in same window for proper OAuth flow
        window.location.href = data.authUrl;
      }
    } catch (err) {
      console.error('Error starting Instagram auth:', err);
      setConnecting(false);
    }
  }, []);

  // Handle OAuth callback - waits for auth to be ready
  const handleCallback = useCallback(async (code: string): Promise<{
    success: boolean;
    error?: string;
    username?: string;
    profilePictureUrl?: string;
    accountType?: string;
    mediaCount?: number;
  }> => {
    // Wait for auth to finish loading
    const waitForAuth = (): Promise<string | null> => {
      return new Promise((resolve) => {
        // If already have user, return immediately
        if (user) {
          resolve(user.id);
          return;
        }
        
        // Otherwise listen for auth state
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (session?.user) {
            subscription.unsubscribe();
            resolve(session.user.id);
          }
        });
        
        // Also check current session
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            subscription.unsubscribe();
            resolve(session.user.id);
          }
        });
        
        // Timeout after 5 seconds
        setTimeout(() => {
          subscription.unsubscribe();
          resolve(null);
        }, 5000);
      });
    };

    const userId = await waitForAuth();
    
    if (!userId) {
      return { success: false, error: 'Not authenticated. Please log in first.' };
    }

    try {
      const redirectUri = localStorage.getItem('instagram_redirect_uri') || 
        `${window.location.origin}/dashboard/instagram-callback`;

      const { data, error } = await supabase.functions.invoke('instagram-auth', {
        body: { 
          action: 'exchange-token',
          code, 
          redirectUri 
        },
      });

      if (error) throw error;

      // Save connection to database
      const { error: saveError } = await supabase
        .from('instagram_connections')
        .upsert({
          user_id: userId,
          instagram_account_id: data.instagramAccountId,
          instagram_username: data.instagramUsername,
          access_token: data.accessToken,
          page_access_token: data.pageAccessToken || null,
          profile_picture_url: data.profilePictureUrl || null,
          account_type: data.accountType || null,
          media_count: data.mediaCount || 0,
          expires_at: data.expiresIn 
            ? new Date(Date.now() + data.expiresIn * 1000).toISOString()
            : null,
        });

      if (saveError) throw saveError;

      localStorage.removeItem('instagram_redirect_uri');
      return { 
        success: true, 
        username: data.instagramUsername,
        profilePictureUrl: data.profilePictureUrl,
        accountType: data.accountType,
        mediaCount: data.mediaCount,
      };
    } catch (err) {
      console.error('Error handling callback:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, [user]);

  // Disconnect Instagram (return success/error so callers can provide feedback)
  const disconnectInstagram = useCallback(async () => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('instagram_connections')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting instagram connection:', error);
        return { success: false, error: error.message || String(error) };
      }

      setConnection(null);
      setMedia([]);
      return { success: true };
    } catch (err) {
      console.error('Unexpected error deleting connection:', err);
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }, [user]);

  return {
    connection,
    media,
    loading,
    authLoading,
    connecting,
    isConnected: !!connection,
    connectInstagram,
    handleCallback,
    disconnectInstagram,
  };
};
