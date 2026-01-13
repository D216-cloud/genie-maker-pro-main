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
  const fetchConnection = useCallback(async () => {
    // Loading only while fetching data
    setLoading(true);

    if (!user) {
      setConnection(null);
      setLoading(false);
      return;
    }

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
      } else {
        setConnection(null);
      }
    } catch (err) {
      // Network or unexpected error
      console.error('Unexpected error fetching instagram connection:', err);
      setConnection(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConnection();

    // Listen for cross-tab storage changes to refresh connection
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'instagram_connection_refresh') {
        fetchConnection();
      }
    };

    // Listen for same-tab custom event to refresh immediately
    const onConnectionChanged = () => fetchConnection();

    window.addEventListener('storage', onStorage);
    window.addEventListener('instagram-connection-changed', onConnectionChanged as EventListener);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('instagram-connection-changed', onConnectionChanged as EventListener);
    };
  }, [fetchConnection]);

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
      
      const session = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('instagram-auth', {
        body: { 
          action: 'get-auth-url',
          redirectUri 
        },
        headers: {
          'Authorization': `Bearer ${session.data.session?.access_token || ''}`
        }
      });

      console.log('Auth URL response:', { data, error });

      // If the edge function returned a usable URL, use it
      if (!error && data?.authUrl) {
        localStorage.setItem('instagram_redirect_uri', redirectUri);
        // Navigate to Instagram OAuth URL
        window.location.href = data.authUrl;
        // We won't reach here if navigation succeeded, but return success for callers/tests
        return { success: true, authUrl: data.authUrl };
      }

      // Fallback: construct client-side auth URL if server didn't provide it
      const clientAppId = (import.meta.env.VITE_INSTAGRAM_APP_ID as string) || '';
      if (!clientAppId) {
        const msg = error?.message || 'Unable to start Instagram auth (no auth URL returned)';
        console.error(msg, error);
        setConnecting(false);
        return { success: false, error: msg };
      }

      const scope = 'instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish';
      const fallbackUrl = `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=${clientAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;

      localStorage.setItem('instagram_redirect_uri', redirectUri);
      window.location.href = fallbackUrl;
      return { success: true, authUrl: fallbackUrl };
    } catch (err) {
      console.error('Error starting Instagram auth:', err);
      setConnecting(false);
      return { success: false, error: err instanceof Error ? err.message : String(err) };
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
    // Wait for auth to finish loading with retries
    const waitForAuth = (timeout = 15000): Promise<string | null> => {
      return new Promise((resolve) => {
        // If already have user, return immediately
        if (user) {
          resolve(user.id);
          return;
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (session?.user) {
            subscription.unsubscribe();
            resolve(session.user.id);
          }
        });

        // Also check current session right away
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            subscription.unsubscribe();
            resolve(session.user.id);
          }
        });

        // Retry getSession a few times in case of slight delays
        const interval = setInterval(() => {
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
              clearInterval(interval);
              subscription.unsubscribe();
              resolve(session.user.id);
            }
          });
        }, 1000);

        // Timeout after given time
        const to = setTimeout(() => {
          clearInterval(interval);
          subscription.unsubscribe();
          // Try one last chance to parse session from URL fragment (works for providers that return tokens in hash)
          if (typeof supabase.auth.getSessionFromUrl === 'function') {
            supabase.auth.getSessionFromUrl().then(({ data, error }) => {
              if (data?.session?.user) {
                resolve(data.session.user.id);
              } else {
                resolve(null);
              }
            }).catch(() => resolve(null));
          } else {
            resolve(null);
          }
        }, timeout);
      });
    };

    const userId = await waitForAuth();
    
    if (!userId) {
      return { success: false, error: 'Not authenticated. Please log in first.' };
    }

    try {
      const redirectUri = localStorage.getItem('instagram_redirect_uri') || 
        `${window.location.origin}/dashboard/instagram-callback`;

      const session = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('instagram-auth', {
        body: { 
          action: 'exchange-token',
          code, 
          redirectUri 
        },
        headers: {
          'Authorization': `Bearer ${session.data.session?.access_token || ''}`
        }
      });

      if (error) throw error;

      // Save connection to database and return the saved row so UI updates immediately
      const { data: savedConnection, error: saveError } = await supabase
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
        })
        .select()
        .maybeSingle();

      if (saveError) throw saveError;

      // Update local state so the UI immediately reflects the new connection
      setConnection(savedConnection as InstagramConnection);

      // Trigger media fetch by effect (connection changed), but we can also prefill media if available
      setMedia([]);

      // Notify other components/tabs to refresh their connection state
      try {
        localStorage.setItem('instagram_connection_refresh', String(Date.now()));
        window.dispatchEvent(new Event('instagram-connection-changed'));
      } catch (e) {
        // ignore storage failures
      }

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
