/// <reference path="./deno-types.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, Authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => { // Request typed for editor using local deno-types.d.ts
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Authentication helpers — define headers and service key (sensitive actions will validate these)
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
  const serviceRoleHeader = req.headers.get('x-service-role-key') || req.headers.get('x-supabase-service-role-key');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  const INSTAGRAM_APP_ID = Deno.env.get('INSTAGRAM_APP_ID');
  const INSTAGRAM_APP_SECRET = Deno.env.get('INSTAGRAM_APP_SECRET');

  try {
    // Validate environment variables first
    if (!INSTAGRAM_APP_ID || !INSTAGRAM_APP_SECRET) {
      console.error('Missing environment variables:', {
        hasAppId: !!INSTAGRAM_APP_ID,
        hasAppSecret: !!INSTAGRAM_APP_SECRET
      });
      return new Response(JSON.stringify({ 
        error: 'Server configuration error: Missing Instagram credentials' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, redirectUri, code } = body;

    console.log('Instagram auth action:', action);
    console.log('Redirect URI:', redirectUri);
    console.log('Code provided:', !!code);

    // Require authentication only for sensitive actions (e.g. exchange-token)
    if (action === 'exchange-token') {
      if (!authHeader && (!serviceRoleHeader || serviceRoleHeader !== SUPABASE_SERVICE_ROLE_KEY)) {
        console.warn('Unauthorized exchange-token request to instagram-auth');
        return new Response(JSON.stringify({ error: 'Missing Authorization header or invalid service role key' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (!action) {
      return new Response(JSON.stringify({ error: 'Missing action parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate OAuth URL
    if (action === 'get-auth-url') {
      if (!redirectUri) {
        return new Response(JSON.stringify({ error: 'Missing redirectUri' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const scope = 'instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish';
      
      const authUrl = `https://www.instagram.com/oauth/authorize?` +
        `enable_fb_login=0` +
        `&force_authentication=1` +
        `&client_id=${INSTAGRAM_APP_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(scope)}`;

      console.log('Generated Instagram OAuth URL');

      return new Response(JSON.stringify({ authUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Exchange code for access token
    if (action === 'exchange-token') {
      if (!code) {
        return new Response(JSON.stringify({ error: 'Missing authorization code' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!redirectUri) {
        return new Response(JSON.stringify({ error: 'Missing redirectUri' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Exchanging code for Instagram token...');
      
      // Step 1: Exchange code for short-lived access token
      const tokenFormData = new URLSearchParams({
        client_id: INSTAGRAM_APP_ID,
        client_secret: INSTAGRAM_APP_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code: code,
      });

      console.log('Making token exchange request...');

      const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: tokenFormData.toString(),
      });

      const tokenText = await tokenResponse.text();
      console.log('Token exchange response status:', tokenResponse.status);
      console.log('Token exchange response:', tokenText);

      let tokenData;
      try {
        tokenData = JSON.parse(tokenText);
      } catch (e) {
        console.error('Failed to parse token response:', tokenText);
        return new Response(JSON.stringify({ 
          error: 'Invalid response from Instagram',
          details: tokenText.substring(0, 200)
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (tokenData.error_message || tokenData.error) {
        const errorMsg = tokenData.error_message || tokenData.error?.message || tokenData.error_description || 'Failed to exchange token';
        console.error('Token exchange error:', errorMsg);
        return new Response(JSON.stringify({ error: errorMsg }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const shortLivedToken = tokenData.access_token;
      // Use the user_id from token response - this is the correct Instagram account ID
      const userId = String(tokenData.user_id);
      
      if (!shortLivedToken || !userId) {
        console.error('Missing token or user_id in response:', tokenData);
        return new Response(JSON.stringify({ error: 'Invalid token response from Instagram' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      console.log('Got short-lived token for user ID:', userId);

      // Step 2: Try to exchange for long-lived token (60 days) - optional
      let accessToken = shortLivedToken;
      let expiresIn = 3600;
      
      try {
        const longLivedUrl = `https://graph.instagram.com/access_token?` +
          `grant_type=ig_exchange_token` +
          `&client_secret=${INSTAGRAM_APP_SECRET}` +
          `&access_token=${shortLivedToken}`;
          
        const longLivedResponse = await fetch(longLivedUrl, { method: 'GET' });
        const longLivedText = await longLivedResponse.text();
        console.log('Long-lived token response status:', longLivedResponse.status);
        
        if (longLivedResponse.ok) {
          const longLivedData = JSON.parse(longLivedText);
          if (longLivedData.access_token) {
            accessToken = longLivedData.access_token;
            expiresIn = longLivedData.expires_in || 5184000;
            console.log('Successfully got long-lived token');
          }
        } else {
          console.log('Long-lived token exchange failed, using short-lived token');
        }
      } catch (longLivedError) {
        console.log('Long-lived token exchange error (non-blocking):', longLivedError);
      }

      // Step 3: Get user profile info - try multiple approaches
      console.log('Fetching user profile for ID:', userId);
      
      let username = '';
      let profilePictureUrl = '';
      let accountType = 'BUSINESS';
      let mediaCount = 0;
      
      // Try the /me endpoint first (works for some account types)
      try {
        const meUrl = `https://graph.instagram.com/me?fields=id,username,account_type,media_count,profile_picture_url&access_token=${accessToken}`;
        const meResponse = await fetch(meUrl);
        const meText = await meResponse.text();
        console.log('Me endpoint response status:', meResponse.status);
        console.log('Me endpoint response:', meText);
        
        if (meResponse.ok) {
          const meData = JSON.parse(meText);
          if (meData.username) {
            username = meData.username;
            console.log('Got username from /me endpoint:', username);
          }
          if (meData.profile_picture_url) {
            profilePictureUrl = meData.profile_picture_url;
            console.log('Got profile picture URL');
          }
          if (meData.account_type) {
            accountType = meData.account_type;
          }
          if (meData.media_count !== undefined) {
            mediaCount = meData.media_count;
          }
        }
      } catch (meError) {
        console.log('Me endpoint failed:', meError);
      }
      
      // If /me didn't work, try getting username from media
      if (!username) {
        try {
          const mediaUrl = `https://graph.instagram.com/me/media?fields=username&limit=1&access_token=${accessToken}`;
          const mediaResponse = await fetch(mediaUrl);
          const mediaText = await mediaResponse.text();
          console.log('Media endpoint response status:', mediaResponse.status);
          
          if (mediaResponse.ok) {
            const mediaData = JSON.parse(mediaText);
            if (mediaData.data?.[0]?.username) {
              username = mediaData.data[0].username;
              console.log('Got username from media endpoint:', username);
            }
          }
        } catch (mediaError) {
          console.log('Media endpoint failed:', mediaError);
        }
      }

      console.log('Successfully connected Instagram user:', username || `ID: ${userId}`);

      return new Response(JSON.stringify({
        accessToken,
        instagramAccountId: String(userId),
        instagramUsername: username || null,
        profilePictureUrl: profilePictureUrl || null,
        accountType,
        mediaCount,
        expiresIn,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Instagram auth error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error ? error.stack : '';
    console.error('Error stack:', stack);
    
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
