import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';

type Tables = Database['public']['Tables'];
type ClientRow = Tables['clients']['Row'];
type ClientDocumentRow = Tables['client_documents']['Row'];
type ClientMessageRow = Tables['client_messages']['Row'];

// GET /api/admin/clients - Get all clients or specific client with details
export async function GET(request: NextRequest) {
    try {
        const supabase = createClient();
        
        // Check if user is authenticated and is admin
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check admin role
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', authUser.id)
            .single();

        const userRole = (profile as { role: string } | null)?.role;
        if (userRole !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get('id');
        const includeDocuments = searchParams.get('documents') === 'true';
        const includeMessages = searchParams.get('messages') === 'true';

        if (clientId) {
            // Get single client with details
            const { data: client, error: clientError } = await supabase
                .from('clients')
                .select('*')
                .eq('id', clientId)
                .single();

            if (clientError || !client) {
                return NextResponse.json({ error: 'Client not found.' }, { status: 404 });
            }

            const response: Record<string, unknown> = { client };

            if (includeDocuments) {
                const { data: documents } = await supabase
                    .from('client_documents')
                    .select('*')
                    .eq('client_id', clientId)
                    .order('requested_at', { ascending: false });
                response.documents = documents || [];
            }

            if (includeMessages) {
                const { data: messages } = await supabase
                    .from('client_messages')
                    .select('*')
                    .eq('client_id', clientId)
                    .order('created_at', { ascending: true });
                response.messages = messages || [];
            }

            return NextResponse.json(response);
        }

        // Get all clients with unread message counts
        const { data: clients, error: clientsError } = await supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false });

        if (clientsError) {
            return NextResponse.json({ error: clientsError.message }, { status: 500 });
        }

        // Get unread counts for each client
        const clientsWithCounts = await Promise.all(
            (clients || []).map(async (client: { id: string; [key: string]: unknown }) => {
                const { count } = await supabase
                    .from('client_messages')
                    .select('*', { count: 'exact', head: true })
                    .eq('client_id', client.id)
                    .eq('is_read', false)
                    .eq('sender_type', 'client');
                
                return {
                    ...client,
                    unreadMessages: count || 0,
                };
            })
        );

        return NextResponse.json({ clients: clientsWithCounts });
    } catch {
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}

// POST /api/admin/clients - Create new client, document, or message
export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();
        
        // Check authentication and admin role
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role, first_name, last_name')
            .eq('id', authUser.id)
            .single();

        const userRole = (profile as { role: string; first_name: string; last_name: string } | null)?.role;
        if (userRole !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { action } = body;

        // Create new document request
        if (action === 'createDocument') {
            const { clientId, type, name, description } = body;
            
            if (!clientId || !type || !name) {
                return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
            }

            const insertData: Tables['client_documents']['Insert'] = {
                client_id: clientId,
                type: type as 'id_document' | 'proof_of_address' | 'financial_statement' | 'company_registration' | 'tax_certificate' | 'contract' | 'other',
                name,
                description: description || '',
                status: 'pending',
                requested_by: authUser.id,
            };
            
            const { data: document, error } = await supabase
                .from('client_documents')
                .insert(insertData)
                .select()
                .single();

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 400 });
            }

            return NextResponse.json({ document });
        }

        // Send message to client
        if (action === 'sendMessage') {
            const { clientId, content } = body;
            
            if (!clientId || !content) {
                return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
            }

            const senderName = `${(profile as { first_name?: string; last_name?: string }).first_name || ''} ${(profile as { first_name?: string; last_name?: string }).last_name || ''}`.trim() || 'Admin';

            const messageData: Tables['client_messages']['Insert'] = {
                client_id: clientId,
                sender_type: 'admin',
                sender_id: authUser.id,
                sender_name: senderName,
                content,
                status: 'delivered',
                is_read: false,
            };
            
            const { data: message, error } = await supabase
                .from('client_messages')
                .insert(messageData)
                .select()
                .single();

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 400 });
            }

            return NextResponse.json({ message });
        }

        // Create new client
        if (action === 'createClient' || !action) {
            const { businessName, registrationNumber, industry, contactName, contactEmail, contactPhone, physicalAddress, notes, tags } = body;
            
            if (!businessName || !registrationNumber || !contactName || !contactEmail) {
                return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
            }

            const clientData: Tables['clients']['Insert'] = {
                business_name: businessName,
                registration_number: registrationNumber,
                industry: industry || '',
                contact_name: contactName,
                contact_email: contactEmail,
                contact_phone: contactPhone || '',
                physical_address: physicalAddress || '',
                status: 'active',
                notes: notes || '',
                tags: tags || [],
                assigned_admin_id: authUser.id,
            };
            
            const { data: client, error } = await supabase
                .from('clients')
                .insert(clientData)
                .select()
                .single();

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 400 });
            }

            return NextResponse.json({ client });
        }

        return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
    } catch {
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}

// PATCH /api/admin/clients - Update client, document, or message
export async function PATCH(request: NextRequest) {
    try {
        const supabase = createClient();
        
        // Check authentication and admin role
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', authUser.id)
            .single();

        const userRole = (profile as { role: string } | null)?.role;
        if (userRole !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { action, clientId, documentId, messageId } = body;

        // Update client
        if (clientId && !documentId && !messageId) {
            const updates: Record<string, unknown> = {};
            if (body.businessName) updates.business_name = body.businessName;
            if (body.status) updates.status = body.status;
            if (body.notes !== undefined) updates.notes = body.notes;
            if (body.tags) updates.tags = body.tags;

            const { data: client, error } = await supabase
                .from('clients')
                .update(updates as Tables['clients']['Update'])
                .eq('id', clientId)
                .select()
                .single();

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 404 });
            }
            return NextResponse.json({ client });
        }

        // Update document status
        if (documentId) {
            const updates: Record<string, unknown> = {};
            
            if (action === 'approve') {
                updates.status = 'approved';
            } else if (action === 'reject') {
                updates.status = 'rejected';
            }
            
            if (body.adminNotes !== undefined) {
                updates.admin_notes = body.adminNotes;
            }

            const { data: document, error } = await supabase
                .from('client_documents')
                .update(updates as Tables['client_documents']['Update'])
                .eq('id', documentId)
                .select()
                .single();

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 404 });
            }
            return NextResponse.json({ document });
        }

        // Mark message as read
        if (messageId) {
            const messageUpdate: Tables['client_messages']['Update'] = {
                is_read: true,
                read_at: new Date().toISOString(),
                status: 'read',
            };
            
            const { data: message, error } = await supabase
                .from('client_messages')
                .update(messageUpdate)
                .eq('id', messageId)
                .select()
                .single();

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 404 });
            }
            return NextResponse.json({ message });
        }

        return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    } catch {
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}

// DELETE /api/admin/clients - Delete client or document
export async function DELETE(request: NextRequest) {
    try {
        const supabase = createClient();
        
        // Check authentication and admin role
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', authUser.id)
            .single();

        const userRole = (profile as { role: string } | null)?.role;
        if (userRole !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get('clientId');
        const documentId = searchParams.get('documentId');

        if (clientId) {
            // Deleting a client will cascade delete related documents and messages
            const { error } = await supabase
                .from('clients')
                .delete()
                .eq('id', clientId);

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 404 });
            }
            return NextResponse.json({ success: true });
        }

        if (documentId) {
            const { error } = await supabase
                .from('client_documents')
                .delete()
                .eq('id', documentId);

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 404 });
            }
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    } catch {
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
