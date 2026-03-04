// ============================================
// AUTO-CREATE PROFILE - Edge Function
// ============================================
// Triggered on user signup via Supabase Auth hook
// Automatically creates user_profiles record with role and reference code

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

interface UserMetadata {
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: 'admin' | 'sales_rep' | 'business';
  business_name?: string;
  id_number?: string;
  home_address?: string;
}

// Generate unique reference code for sales reps
function generateReferenceCode(firstName: string, lastName: string): string {
  const prefix = (firstName[0] + lastName.slice(0, 3)).toUpperCase();
  const num = String(Math.floor(1000 + Math.random() * 9000));
  return `F1-${prefix}-${num}`;
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
    const { user, type } = await req.json();
    
    // Only process signup events
    if (type !== 'USER_CREATED' && type !== 'signup') {
      return new Response(
        JSON.stringify({ message: 'Ignored event type' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const metadata: UserMetadata = user.user_metadata || {};
    const role = metadata.role || 'business';
    
    // Build profile data
    const profileData: Record<string, unknown> = {
      id: user.id,
      role,
      first_name: metadata.first_name || user.email?.split('@')[0] || 'User',
      last_name: metadata.last_name || '',
      phone: metadata.phone || '',
      status: 'pending',
    };

    // Sales rep specific fields
    if (role === 'sales_rep') {
      profileData.reference_code = generateReferenceCode(
        profileData.first_name as string,
        profileData.last_name as string
      );
      profileData.referral_link = `/for-business/apply?ref=${profileData.reference_code}`;
      profileData.id_number = metadata.id_number || '';
      profileData.home_address = metadata.home_address || '';
    }

    // Business specific fields
    if (role === 'business') {
      profileData.business_name = metadata.business_name || '';
    }

    // Create profile
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) {
      console.error('Failed to create profile:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // If business role and business_name provided, create client record
    if (role === 'business' && metadata.business_name) {
      const { error: clientError } = await supabase
        .from('clients')
        .insert({
          user_id: user.id,
          business_name: metadata.business_name,
          registration_number: metadata.registration_number || `TEMP-${Date.now()}`,
          contact_name: `${metadata.first_name || ''} ${metadata.last_name || ''}`.trim() || metadata.business_name,
          contact_email: user.email,
          contact_phone: metadata.phone || '',
          physical_address: metadata.home_address || '',
          status: 'active',
        });

      if (clientError) {
        console.error('Failed to create client:', clientError);
      }
    }

    // Send welcome email via Supabase Edge Function
    await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({
        type: 'welcome',
        userId: user.id,
        email: user.email,
        data: {
          firstName: profileData.first_name,
          role: role,
          referenceCode: profileData.reference_code,
        },
      }),
    }).catch(err => console.error('Failed to send welcome email:', err));

    return new Response(
      JSON.stringify({ 
        success: true, 
        profile,
        message: 'Profile created successfully' 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
