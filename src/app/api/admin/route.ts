import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = createClient();
        
        // Check authentication
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if admin
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', authUser.id)
            .single();

        const userRole = (profile as { role: string } | null)?.role;
        if (userRole !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Get all leads with user info
        const { data: leads, error: leadsError } = await supabase
            .from('leads')
            .select(`
                *,
                submitted_by_profile:user_profiles!leads_submitted_by_fkey(first_name, last_name, reference_code),
                business:clients(business_name, contact_name)
            `)
            .order('submitted_at', { ascending: false });

        if (leadsError) {
            return NextResponse.json({ error: leadsError.message }, { status: 500 });
        }

        // Get all users
        const { data: users, error: usersError } = await supabase
            .from('user_profiles')
            .select('*');

        if (usersError) {
            return NextResponse.json({ error: usersError.message }, { status: 500 });
        }

        return NextResponse.json({ leads: leads || [], users: users || [] });
    } catch {
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const supabase = createClient();
        
        // Check authentication
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if admin
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', authUser.id)
            .single();

        const userRole = (profile as { role: string } | null)?.role;
        if (userRole !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { leadId, status, note } = await request.json();
        
        if (!leadId || !status) {
            return NextResponse.json({ error: 'leadId and status are required.' }, { status: 400 });
        }

        // Get current lead to build status history
        const { data: currentLead } = await supabase
            .from('leads')
            .select('current_status, status_history')
            .eq('id', leadId)
            .single();

        if (!currentLead) {
            return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
        }

        // Build new status history entry
        const historyEntry = {
            status,
            timestamp: new Date().toISOString(),
            note,
            updated_by: authUser.id,
        };

        const newStatusHistory = [...(currentLead.status_history as unknown[] || []), historyEntry];

        // Update lead
        const { data: lead, error } = await supabase
            .from('leads')
            .update({
                current_status: status,
                status_history: newStatusHistory,
                updated_at: new Date().toISOString(),
            })
            .eq('id', leadId)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ lead });
    } catch {
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
