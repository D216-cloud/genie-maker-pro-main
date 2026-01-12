import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { accessToken, instagramAccountId, action, mediaId } = body;

    console.log('Instagram posts action:', action);
    console.log('Instagram account ID:', instagramAccountId);
    console.log('Has access token:', !!accessToken);

    if (!accessToken || !instagramAccountId) {
      console.error('Missing credentials:', { hasToken: !!accessToken, hasId: !!instagramAccountId });
      return new Response(JSON.stringify({ error: 'Missing accessToken or instagramAccountId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user's media (posts/reels) using Instagram Graph API
    if (action === 'get-media') {
      console.log('Fetching media for user:', instagramAccountId);
      
      // Use /me/media endpoint - this is more reliable than using account ID directly
      const mediaUrl = `https://graph.instagram.com/v21.0/me/media?` +
        `fields=id,caption,media_type,media_url,thumbnail_url,timestamp,permalink` +
        `&access_token=${accessToken}`;
      
      console.log('Making /me/media request');
      
      const response = await fetch(mediaUrl);
      const responseText = await response.text();
      
      console.log('Media response status:', response.status);
      console.log('Media response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse media response');
        return new Response(JSON.stringify({ error: 'Invalid response from Instagram', media: [] }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (data.error) {
        console.error('Instagram API error:', data.error);
        // Return empty media array instead of throwing - this allows the UI to show "no posts"
        return new Response(JSON.stringify({ 
          media: [], 
          error: data.error.message,
          errorCode: data.error.code 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Found media count:', data.data?.length || 0);

      return new Response(JSON.stringify({ media: data.data || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get comments on a specific post
    if (action === 'get-comments') {
      if (!mediaId) {
        return new Response(JSON.stringify({ error: 'Missing mediaId' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const commentsUrl = `https://graph.instagram.com/v21.0/${mediaId}/comments?` +
        `fields=id,text,timestamp,from,like_count` +
        `&access_token=${accessToken}`;
      
      const response = await fetch(commentsUrl);
      const responseText = await response.text();
      
      console.log('Comments response status:', response.status);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        return new Response(JSON.stringify({ comments: [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (data.error) {
        console.error('Comments error:', data.error);
        return new Response(JSON.stringify({ comments: [], error: data.error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ comments: data.data || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Instagram posts error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message, media: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
