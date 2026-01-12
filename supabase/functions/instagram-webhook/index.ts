import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Webhook verification token - should match what you set in Meta Developer Console
// Read from env (recommended) and fallback to the original token for compatibility
const VERIFY_TOKEN = Deno.env.get('INSTAGRAM_VERIFY_TOKEN') || 'reelychat_webhook_verify_token';

serve(async (req: Request) => {
  const url = new URL(req.url);
  
  // Handle GET request for webhook verification
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    console.log('Webhook verification request:', { mode, token, challenge });

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verified successfully');
      return new Response(challenge, { status: 200 });
    } else {
      console.log('Webhook verification failed', { mode, token, expected: VERIFY_TOKEN });
      const errorMessage = "The callback URL or verify token couldn't be validated. Please verify the provided information or try again later.";
      return new Response(errorMessage, {
        status: 403,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  }

  // Handle POST request for webhook events
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      console.log('Webhook event received:', JSON.stringify(body, null, 2));

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // Handle Data Deletion Requests from Meta / Instagram
      // Meta may send a user data deletion request containing a `user_id` and `confirmation_code` (or nested under `data_deletion_request`).
      // We attempt to remove app data tied to this user (profiles, instagram_connections, automations, logs) and return a confirmation.
      const userId = body.user_id || body.data_deletion_request?.user_id || body.deletionRequest?.user_id || null;
      const confirmationCode = body.confirmation_code || body.data_deletion_request?.confirmation_code || body.deletionRequest?.confirmation_code || null;

      if (userId) {
        console.log('Received data deletion request for user:', userId, 'confirmationCode:', confirmationCode);
        try {
          // Delete any instagram_connections that reference this Instagram account id
          const { error: delByInstagramIdError } = await supabase
            .from('instagram_connections')
            .delete()
            .eq('instagram_account_id', String(userId));
          if (delByInstagramIdError) console.error('Error deleting instagram_connections by instagram_account_id:', delByInstagramIdError);

          // Delete any connections that reference this auth user id
          const { error: delByUserIdError } = await supabase
            .from('instagram_connections')
            .delete()
            .eq('user_id', userId);
          if (delByUserIdError) console.error('Error deleting instagram_connections by user_id:', delByUserIdError);

          // Delete automations and associated logs for this user
          const { error: delAutomationsError } = await supabase
            .from('instagram_automations')
            .delete()
            .eq('user_id', userId);
          if (delAutomationsError) console.error('Error deleting instagram_automations:', delAutomationsError);

          const { error: delLogsError } = await supabase
            .from('automation_logs')
            .delete()
            .eq('commenter_id', userId);
          if (delLogsError) console.error('Error deleting automation_logs by commenter_id:', delLogsError);

          // Delete the profile row for this user if it exists
          const { error: delProfilesError } = await supabase
            .from('profiles')
            .delete()
            .eq('user_id', userId);
          if (delProfilesError) console.error('Error deleting profiles:', delProfilesError);

          // NOTE: We intentionally do NOT delete auth.users here; deletion of auth accounts is a separate action.

          // Respond to Meta with success and include the confirmation code if present
          const responsePayload: Record<string, unknown> = { success: true };
          if (confirmationCode) responsePayload.confirmation_code = confirmationCode;

          return new Response(JSON.stringify(responsePayload), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (err) {
          console.error('Error processing data deletion request:', err);
          return new Response(JSON.stringify({ error: 'Error processing deletion' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }

      // Process Instagram comment events
      if (body.object === 'instagram') {
        for (const entry of body.entry || []) {
          const instagramAccountId = entry.id;
          
          for (const change of entry.changes || []) {
            if (change.field === 'comments') {
              const comment = change.value;
              console.log('New comment received:', JSON.stringify(comment, null, 2));

              const mediaId = comment.media?.id;
              const commenterId = comment.from?.id;
              const commenterUsername = comment.from?.username;
              const commentText = comment.text || '';
              const commentId = comment.id;

              if (!commenterId) {
                console.log('No commenter ID found, skipping');
                continue;
              }

              // Find the user who owns this Instagram account
              const { data: connection, error: connectionError } = await supabase
                .from('instagram_connections')
                .select('*')
                .eq('instagram_account_id', instagramAccountId)
                .single();

              if (connectionError || !connection) {
                console.error('No connection found for Instagram account:', instagramAccountId);
                continue;
              }

              console.log('Found connection for user:', connection.user_id);
              console.log('Incoming webhook mediaId:', mediaId);

              // Find active automations for this user
              const { data: automations, error: automationsError } = await supabase
                .from('instagram_automations')
                .select('*')
                .eq('user_id', connection.user_id)
                .eq('is_active', true);

              if (automationsError) {
                console.error('Error fetching automations:', automationsError);
                continue;
              }

              console.log('Found total active automations:', automations?.length || 0);

              // Process each automation and check if it matches
              for (const automation of automations || []) {
                console.log('Checking automation:', {
                  id: automation.id,
                  name: automation.name,
                  stored_media_id: automation.media_id,
                  apply_to_all: automation.apply_to_all,
                  incoming_media_id: mediaId,
                });

                // STRICT MATCHING: Either apply_to_all is true OR media_id matches exactly
                const matchesPost = 
                  automation.apply_to_all === true || 
                  (automation.media_id !== null && automation.media_id === mediaId);

                if (!matchesPost) {
                  console.log(`Automation ${automation.id} does NOT match post. Stored: ${automation.media_id}, Incoming: ${mediaId}, ApplyToAll: ${automation.apply_to_all}`);
                  continue;
                }

                console.log(`Automation ${automation.id} MATCHES post!`);

                // Check keyword match
                const keywords: string[] = automation.keywords || [];
                const matchesKeyword = keywords.length === 0 || 
                  keywords.some((keyword: string) => 
                    commentText.toLowerCase().includes(keyword.toLowerCase())
                  );

                if (!matchesKeyword) {
                  console.log(`Comment "${commentText}" does not match keywords: ${keywords.join(', ')}`);
                  continue;
                }

                console.log('Comment matches keywords! Proceeding to send DM...');

                // Use the access token (prefer page_access_token if available)
                const accessToken = connection.page_access_token || connection.access_token;

                // 1. Auto-reply to comment (if enabled)
                if (automation.auto_reply_enabled && automation.comment_responses?.length > 0) {
                  const responses: string[] = automation.comment_responses;
                  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                  
                  try {
                    console.log('Sending comment reply:', randomResponse);
                    const replyResponse = await fetch(
                      `https://graph.instagram.com/v21.0/${commentId}/replies`,
                      {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          message: randomResponse,
                          access_token: accessToken,
                        }),
                      }
                    );
                    const replyData = await replyResponse.json();
                    console.log('Comment reply response:', JSON.stringify(replyData, null, 2));
                  } catch (replyError) {
                    console.error('Error sending comment reply:', replyError);
                  }
                }

                // 2. Send DM to commenter
                try {
                  console.log('Sending DM to commenter:', commenterId);
                  
                  // Instagram Graph API for sending DMs
                  // First, we need to get the Instagram-scoped user ID (IGSID) for the commenter
                  // The DM is sent via the Instagram account, not Facebook Page
                  
                  const dmMessage = automation.dm_message;
                  
                  // Use Instagram Graph API messaging endpoint
                  const dmResponse = await fetch(
                    `https://graph.instagram.com/v21.0/${instagramAccountId}/messages`,
                    {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        recipient: { id: commenterId },
                        message: { text: dmMessage },
                        access_token: accessToken,
                      }),
                    }
                  );

                  const dmData = await dmResponse.json();
                  console.log('DM response:', JSON.stringify(dmData, null, 2));

                  // Log the automation execution
                  await supabase.from('automation_logs').insert({
                    automation_id: automation.id,
                    comment_id: commentId,
                    commenter_id: commenterId,
                    comment_text: commentText,
                    dm_sent: !dmData.error,
                    error_message: dmData.error?.message || null,
                  });

                  console.log('Automation log saved');

                } catch (dmError) {
                  console.error('Error sending DM:', dmError);
                  
                  // Log the error
                  await supabase.from('automation_logs').insert({
                    automation_id: automation.id,
                    comment_id: commentId,
                    commenter_id: commenterId,
                    comment_text: commentText,
                    dm_sent: false,
                    error_message: dmError instanceof Error ? dmError.message : 'Unknown error',
                  });
                }
              }
            }

            // Handle messaging events (for conversation flow)
            if (change.field === 'messages') {
              const message = change.value;
              console.log('New message received:', JSON.stringify(message, null, 2));
              // Future: Handle follow-up message flows here
            }
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    } catch (error: unknown) {
      console.error('Webhook error:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response('Method not allowed', { status: 405 });
});
