// ============================================
// DOCUMENT WEBHOOK - Edge Function
// ============================================
// Handles document status changes and triggers notifications
// Called via database trigger/webhook

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: {
    id: string;
    client_id: string;
    status: string;
    name: string;
    type: string;
    file_name?: string;
    file_url?: string;
    admin_notes?: string;
    client_notes?: string;
    requested_by?: string;
    uploaded_at?: string;
    old_status?: string;
  };
  old_record?: {
    status: string;
  };
}

Deno.serve(async (req) => {
  // Verify webhook secret
  const authHeader = req.headers.get('Authorization');
  const webhookSecret = Deno.env.get('WEBHOOK_SECRET');
  
  if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const payload: WebhookPayload = await req.json();
    
    // Only handle client_documents table
    if (payload.table !== 'client_documents') {
      return new Response(
        JSON.stringify({ message: 'Ignored' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { record, old_record, type } = payload;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Handle different events
    if (type === 'INSERT') {
      // New document requested - notify client
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
        body: JSON.stringify({
          type: 'document_requested',
          clientId: record.client_id,
          data: {
            documentName: record.name,
            description: record.type.replace(/_/g, ' '),
            documentType: record.type,
          },
        }),
      });
    }

    if (type === 'UPDATE' && old_record) {
      const oldStatus = old_record.status;
      const newStatus = record.status;

      // Status changed to submitted (client uploaded)
      if (oldStatus === 'pending' && newStatus === 'submitted') {
        // Notify admin - document needs review
        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/notify-client`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          },
          body: JSON.stringify({
            type: 'admin_alert',
            alertType: 'document_submitted',
            clientId: record.client_id,
            documentId: record.id,
            documentName: record.name,
            fileUrl: record.file_url,
          }),
        });
      }

      // Status changed to approved
      if (newStatus === 'approved' && oldStatus !== 'approved') {
        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          },
          body: JSON.stringify({
            type: 'document_approved',
            clientId: record.client_id,
            data: {
              documentName: record.name,
              adminNotes: record.admin_notes,
            },
          }),
        });
      }

      // Status changed to rejected
      if (newStatus === 'rejected' && oldStatus !== 'rejected') {
        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          },
          body: JSON.stringify({
            type: 'document_rejected',
            clientId: record.client_id,
            data: {
              documentName: record.name,
              adminNotes: record.admin_notes || 'Please resubmit with clearer information.',
            },
          }),
        });
      }
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      table_name: 'client_documents',
      record_id: record.id,
      action: type,
      old_data: old_record || null,
      new_data: record,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: type,
        documentId: record.id,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Document webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
