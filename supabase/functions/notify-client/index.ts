// ============================================
// NOTIFY CLIENT - Edge Function
// ============================================
// Sends real-time notifications to clients via Supabase Realtime
// Also handles admin alerts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

interface NotificationPayload {
  type: 'message' | 'document_update' | 'admin_alert' | 'lead_update';
  clientId?: string;
  userId?: string;
  messageId?: string;
  documentId?: string;
  leadId?: string;
  alertType?: string;
  content?: string;
  data?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const payload: NotificationPayload = await req.json();
    const { type, clientId, userId, content, data = {} } = payload;

    let broadcastChannel = '';
    let notificationTitle = '';
    let notificationData: Record<string, unknown> = { ...data };

    switch (type) {
      case 'message':
        broadcastChannel = `messages:${clientId}`;
        notificationTitle = 'New Message';
        notificationData = {
          ...notificationData,
          type: 'message',
          content: content || 'You have a new message',
          timestamp: new Date().toISOString(),
        };
        break;

      case 'document_update':
        broadcastChannel = `documents:${clientId}`;
        notificationTitle = 'Document Update';
        notificationData = {
          ...notificationData,
          type: 'document_update',
          documentId: payload.documentId,
          status: data.status,
          timestamp: new Date().toISOString(),
        };
        break;

      case 'admin_alert':
        // Alerts go to all admins
        broadcastChannel = 'admin_alerts';
        notificationTitle = 'Admin Alert';
        notificationData = {
          ...notificationData,
          type: 'admin_alert',
          alertType: payload.alertType,
          clientId,
          documentId: payload.documentId,
          timestamp: new Date().toISOString(),
        };
        break;

      case 'lead_update':
        broadcastChannel = `leads:${payload.leadId}`;
        notificationTitle = 'Lead Update';
        notificationData = {
          ...notificationData,
          type: 'lead_update',
          leadId: payload.leadId,
          newStatus: data.newStatus,
          timestamp: new Date().toISOString(),
        };
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown notification type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Broadcast via Supabase Realtime
    const { error: broadcastError } = await supabase
      .channel(broadcastChannel)
      .send({
        type: 'broadcast',
        event: 'notification',
        payload: notificationData,
      });

    if (broadcastError) {
      console.error('Broadcast error:', broadcastError);
    }

    // If admin alert, notify specific admins
    if (type === 'admin_alert') {
      // Get all admin IDs
      const { data: admins } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('role', 'admin');

      // Create in-app notifications for each admin
      if (admins) {
        const notifications = admins.map(admin => ({
          user_id: admin.id,
          type: 'admin_alert',
          title: notificationTitle,
          content: `${payload.alertType}: ${content || 'Action required'}`,
          metadata: notificationData,
          read: false,
        }));

        await supabase.from('notifications').insert(notifications);
      }
    } else if (clientId) {
      // Get client user_id
      const { data: client } = await supabase
        .from('clients')
        .select('user_id')
        .eq('id', clientId)
        .single();

      if (client?.user_id) {
        // Create in-app notification for client
        await supabase.from('notifications').insert({
          user_id: client.user_id,
          type,
          title: notificationTitle,
          content: content || 'Update available',
          metadata: notificationData,
          read: false,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        broadcastChannel,
        notificationType: type,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Notify error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
