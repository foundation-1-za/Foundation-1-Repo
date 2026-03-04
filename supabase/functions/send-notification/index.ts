// ============================================
// SEND NOTIFICATION - Edge Function
// ============================================
// Sends emails and in-app notifications for various events

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// Email templates
const emailTemplates: Record<string, (data: Record<string, unknown>) => { subject: string; body: string }> = {
  welcome: (data) => ({
    subject: `Welcome to Foundation-1, ${data.firstName}!`,
    body: `
      <h1>Welcome to Foundation-1</h1>
      <p>Hi ${data.firstName},</p>
      <p>Your account has been created successfully.</p>
      ${data.referenceCode ? `<p>Your Sales Reference Code: <strong>${data.referenceCode}</strong></p>` : ''}
      <p>Login to get started: <a href="${data.siteUrl}/auth">Click here</a></p>
    `,
  }),
  
  document_requested: (data) => ({
    subject: 'Document Requested - Action Required',
    body: `
      <h1>Document Requested</h1>
      <p>Hi ${data.contactName},</p>
      <p>We've requested the following document from you:</p>
      <h3>${data.documentName}</h3>
      <p>${data.description || ''}</p>
      <p>Please upload it through your client portal.</p>
      <p><a href="${data.siteUrl}/dashboard/documents" style="padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 8px;">Upload Document</a></p>
    `,
  }),
  
  document_approved: (data) => ({
    subject: 'Document Approved',
    body: `
      <h1>Document Approved ✓</h1>
      <p>Hi ${data.contactName},</p>
      <p>Your document "${data.documentName}" has been approved.</p>
      <p>${data.adminNotes ? `Admin notes: ${data.adminNotes}` : ''}</p>
    `,
  }),
  
  document_rejected: (data) => ({
    subject: 'Document Needs Revision',
    body: `
      <h1>Document Needs Revision</h1>
      <p>Hi ${data.contactName},</p>
      <p>Your document "${data.documentName}" needs some changes.</p>
      <p><strong>Reason:</strong> ${data.adminNotes || 'Please resubmit with clearer information.'}</p>
      <p><a href="${data.siteUrl}/dashboard/documents" style="padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 8px;">Re-upload Document</a></p>
    `,
  }),
  
  new_message: (data) => ({
    subject: 'New Message from Foundation-1',
    body: `
      <h1>New Message</h1>
      <p>Hi ${data.contactName},</p>
      <p>You have a new message from ${data.senderName}:</p>
      <blockquote style="border-left: 4px solid #000; padding-left: 16px; margin: 16px 0;">
        ${data.messageContent}
      </blockquote>
      <p><a href="${data.siteUrl}/dashboard/messages" style="padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 8px;">View Message</a></p>
    `,
  }),
  
  lead_status_update: (data) => ({
    subject: `Lead Status Update: ${data.newStatus}`,
    body: `
      <h1>Lead Status Update</h1>
      <p>Hi ${data.contactName},</p>
      <p>Your lead for <strong>${data.businessName}</strong> has been updated:</p>
      <p>Status: <strong style="text-transform: capitalize;">${data.newStatus}</strong></p>
      ${data.note ? `<p>Note: ${data.note}</p>` : ''}
      <p><a href="${data.siteUrl}/dashboard" style="padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 8px;">View Dashboard</a></p>
    `,
  }),
};

Deno.serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { type, userId, email, clientId, data = {} } = await req.json();

    // Get email from user profile if not provided
    let targetEmail = email;
    let targetUserId = userId;
    
    if (clientId && !targetEmail) {
      const { data: client } = await supabase
        .from('clients')
        .select('user_id, contact_email, contact_name')
        .eq('id', clientId)
        .single();
      
      if (client) {
        targetEmail = client.contact_email;
        targetUserId = client.user_id;
        data.contactName = client.contact_name;
      }
    }

    // Add site URL to data
    data.siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:3000';

    // Get template
    const template = emailTemplates[type];
    if (!template) {
      return new Response(
        JSON.stringify({ error: 'Unknown notification type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { subject, body } = template(data);

    // Send email via Supabase Auth (requires SMTP setup)
    const { error: emailError } = await supabase.auth.admin.sendEmail(targetUserId || '', {
      email: targetEmail || '',
      subject,
      html: body,
    });

    if (emailError) {
      console.error('Email send failed:', emailError);
      // Fallback: Log to in-app notifications
    }

    // Create in-app notification
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: targetUserId,
        type,
        title: subject,
        content: body.replace(/<[^>]*>/g, ''), // Strip HTML
        metadata: data,
        read: false,
      });

    if (notifError) {
      console.error('Notification creation failed:', notifError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification sent',
        email: targetEmail,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Notification error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send notification' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
