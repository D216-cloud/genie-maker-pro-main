import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body = await req.json();
    const { action } = body;

    // Send DM to a user
    if (action === 'send-dm') {
      const { accessToken, recipientId, message, instagramAccountId } = body;
      
      if (!accessToken || !recipientId || !message || !instagramAccountId) {
        throw new Error('Missing required fields: accessToken, recipientId, message, instagramAccountId');
      }

      console.log('Sending DM to:', recipientId, 'from account:', instagramAccountId);

      // Instagram Graph API for sending DMs
      const response = await fetch(
        `https://graph.instagram.com/v21.0/${instagramAccountId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipient: { id: recipientId },
            message: { text: message },
            access_token: accessToken,
          }),
        }
      );

      const data = await response.json();
      console.log('Send DM response:', JSON.stringify(data, null, 2));

      if (data.error) {
        throw new Error(data.error.message);
      }

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Process webhook for comment triggers
    if (action === 'process-comment-webhook') {
      const { commentId, commentText, commenterId, mediaId, automationId, accessToken } = body;
      
      // Get automation settings from database
      const { data: automation, error: automationError } = await supabase
        .from('instagram_automations')
        .select('*')
        .eq('id', automationId)
        .single();

      if (automationError || !automation) {
        throw new Error('Automation not found');
      }

      // Check if comment matches keywords
      const keywords = automation.keywords || [];
      const matchesKeyword = keywords.length === 0 || 
        keywords.some((keyword: string) => 
          commentText.toLowerCase().includes(keyword.toLowerCase())
        );

      if (!matchesKeyword) {
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Comment does not match keywords' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Send DM to commenter
      const dmResponse = await fetch(
        `https://graph.facebook.com/v19.0/me/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipient: { id: commenterId },
            message: { text: automation.dm_message },
            access_token: accessToken,
          }),
        }
      );

      const dmData = await dmResponse.json();
      console.log('Auto DM response:', dmData);

      // Log the automation execution
      await supabase.from('automation_logs').insert({
        automation_id: automationId,
        comment_id: commentId,
        commenter_id: commenterId,
        dm_sent: !dmData.error,
        error_message: dmData.error?.message,
      });

      return new Response(JSON.stringify({ 
        success: true, 
        dmSent: !dmData.error 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Instagram AutoDM error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
