import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If the URL contains an OAuth session fragment, parse it and store session
    const parseSessionFromUrl = async () => {
      try {
        if (typeof window !== 'undefined' && (window.location.hash.includes('access_token') || window.location.hash.includes('refresh_token'))) {
          if (typeof supabase.auth.getSessionFromUrl === 'function') {
            const { data, error } = await supabase.auth.getSessionFromUrl();
            if (error) console.error('getSessionFromUrl error', error);
            // Remove fragment from URL to keep things clean
            const cleanUrl = window.location.href.split('#')[0];
            window.history.replaceState({}, document.title, cleanUrl);
          }
        }
      } catch (err) {
        console.error('Error parsing session from URL:', err);
      }
    };

    parseSessionFromUrl();

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata: { full_name: string; phone: string }) => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: metadata
        }
      });
      // Log for debugging in dev
      console.debug('signUp result', { data, error });
      return { data, error };
    } catch (err) {
      console.error('signUp unexpected error', err);
      return { data: null, error: err as Error };
    }
  };

  const signInWithPhoneOtp = async (phone: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        shouldCreateUser: false,
      }
    });
    return { data, error };
  };

  const sendPhoneOtp = async (phone: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
    });
    return { data, error };
  };

  const verifyPhoneOtp = async (phone: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms'
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.debug('signIn result', { data, error });
      return { data, error };
    } catch (err) {
      console.error('signIn unexpected error', err);
      return { data: null, error: err as Error };
    }
  };

  const signInWithGoogle = async () => {
    // Redirect to Google OAuth flow; after sign-in Supabase will redirect back to the app
    const redirectUrl = `${window.location.origin}/dashboard`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        // Force Google to show account chooser so users pick/select account instead of silently reusing an existing session
        queryParams: {
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      // Normalize common provider errors to give actionable guidance
      const msg = String(error.message || '').toLowerCase();
      if (msg.includes('unsupported provider') || msg.includes('provider is not enabled') || msg.includes('validation_failed')) {
        // Replace with clearer instruction for developers/users
        error.message = 'Google sign-in is not enabled in Supabase. Enable it at Supabase Dashboard → Authentication → Settings → External OAuth Providers and add the Google Client ID & Secret.';
      }
      // Log original error to console for diagnosis
      console.debug('signInWithGoogle error:', error);
    }

    return { data, error };
  };

  const resetPassword = async (email: string, redirectTo?: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      console.debug('resetPasswordForEmail', { data, error });
      return { data, error };
    } catch (err) {
      console.error('resetPassword unexpected error', err);
      return { data: null, error: err as Error };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithPhoneOtp,
    sendPhoneOtp,
    verifyPhoneOtp,
    resetPassword,
    signOut,
  };
};
