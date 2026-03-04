-- ============================================
-- FOUNDATION-1 FUNCTIONS & STORED PROCEDURES
-- ============================================
-- Run after 002_rls_policies.sql

-- ============================================
-- STATISTICS & ANALYTICS FUNCTIONS
-- ============================================

-- Get admin dashboard statistics
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_clients', (SELECT COUNT(*) FROM clients),
        'active_clients', (SELECT COUNT(*) FROM clients WHERE status = 'active'),
        'total_leads', (SELECT COUNT(*) FROM leads),
        'pending_documents', (SELECT COUNT(*) FROM client_documents WHERE status = 'pending'),
        'submitted_documents', (SELECT COUNT(*) FROM client_documents WHERE status = 'submitted'),
        'unread_messages', (SELECT COUNT(*) FROM client_messages WHERE is_read = FALSE AND sender_type = 'client'),
        'approved_leads', (SELECT COUNT(*) FROM leads WHERE current_status IN ('approved', 'contract_signed', 'commission_earned')),
        'total_commission', (SELECT COALESCE(SUM(commission_amount), 0) FROM leads WHERE commission_paid = TRUE),
        'pending_commission', (SELECT COALESCE(SUM(commission_amount), 0) FROM leads WHERE commission_paid = FALSE AND commission_amount IS NOT NULL)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get sales rep statistics
CREATE OR REPLACE FUNCTION get_sales_rep_stats(rep_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_leads', (SELECT COUNT(*) FROM leads WHERE submitted_by = rep_id),
        'approved_leads', (SELECT COUNT(*) FROM leads WHERE submitted_by = rep_id AND current_status IN ('approved', 'contract_signed', 'commission_earned')),
        'rejected_leads', (SELECT COUNT(*) FROM leads WHERE submitted_by = rep_id AND current_status IN ('rejected', 'pre_validation_failed')),
        'conversion_rate', CASE 
            WHEN (SELECT COUNT(*) FROM leads WHERE submitted_by = rep_id) > 0 
            THEN ROUND(
                (SELECT COUNT(*) FROM leads WHERE submitted_by = rep_id AND current_status IN ('approved', 'contract_signed', 'commission_earned'))::numeric /
                (SELECT COUNT(*) FROM leads WHERE submitted_by = rep_id)::numeric * 100, 2
            )
            ELSE 0
        END,
        'total_commission', (SELECT COALESCE(SUM(commission_amount), 0) FROM leads WHERE submitted_by = rep_id AND commission_paid = TRUE),
        'pending_commission', (SELECT COALESCE(SUM(commission_amount), 0) FROM leads WHERE submitted_by = rep_id AND commission_paid = FALSE AND commission_amount IS NOT NULL)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get client statistics
CREATE OR REPLACE FUNCTION get_client_stats(client_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_documents', (SELECT COUNT(*) FROM client_documents WHERE client_id = client_uuid),
        'pending_documents', (SELECT COUNT(*) FROM client_documents WHERE client_id = client_uuid AND status = 'pending'),
        'approved_documents', (SELECT COUNT(*) FROM client_documents WHERE client_id = client_uuid AND status = 'approved'),
        'total_messages', (SELECT COUNT(*) FROM client_messages WHERE client_id = client_uuid),
        'unread_messages', (SELECT COUNT(*) FROM client_messages WHERE client_id = client_uuid AND is_read = FALSE AND sender_type = 'admin'),
        'lead_status', (SELECT current_status FROM leads WHERE business_id = client_uuid ORDER BY created_at DESC LIMIT 1)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- LEAD MANAGEMENT FUNCTIONS
-- ============================================

-- Update lead status with history tracking
CREATE OR REPLACE FUNCTION update_lead_status(
    lead_id UUID,
    new_status TEXT,
    note TEXT DEFAULT NULL,
    updated_by UUID DEFAULT auth.uid()
)
RETURNS JSONB AS $$
DECLARE
    old_status TEXT;
    status_entry JSONB;
BEGIN
    -- Get current status
    SELECT current_status INTO old_status FROM leads WHERE id = lead_id;
    
    -- Create history entry
    status_entry := jsonb_build_object(
        'status', new_status,
        'timestamp', NOW(),
        'note', note,
        'updated_by', updated_by
    );
    
    -- Update lead
    UPDATE leads
    SET 
        current_status = new_status,
        status_history = status_history || status_entry,
        updated_at = NOW(),
        paid_at = CASE WHEN new_status = 'commission_earned' AND commission_paid THEN NOW() ELSE paid_at END
    WHERE id = lead_id;
    
    RETURN jsonb_build_object(
        'success', TRUE,
        'lead_id', lead_id,
        'old_status', old_status,
        'new_status', new_status
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create lead with business relationship
CREATE OR REPLACE FUNCTION create_lead_with_business(
    business_data JSONB,
    lead_data JSONB
)
RETURNS JSONB AS $$
DECLARE
    new_client_id UUID;
    new_lead_id UUID;
    sales_rep_id UUID;
BEGIN
    -- Find sales rep if reference provided
    IF lead_data->>'sales_rep_ref' IS NOT NULL THEN
        SELECT id INTO sales_rep_id 
        FROM user_profiles 
        WHERE reference_code = lead_data->>'sales_rep_ref';
    END IF;
    
    -- Create client if not exists
    INSERT INTO clients (
        business_name,
        registration_number,
        industry,
        contact_name,
        contact_email,
        contact_phone,
        physical_address,
        status
    ) VALUES (
        business_data->>'business_name',
        business_data->>'registration_number',
        business_data->>'industry',
        business_data->>'contact_name',
        business_data->>'contact_email',
        business_data->>'contact_phone',
        business_data->>'physical_address',
        'active'
    )
    ON CONFLICT (registration_number) DO UPDATE SET
        updated_at = NOW()
    RETURNING id INTO new_client_id;
    
    -- Create lead
    INSERT INTO leads (
        business_id,
        submitted_by,
        business_name,
        registration_number,
        physical_address,
        contact_name,
        contact_role,
        contact_phone,
        contact_email,
        industry,
        confirmed_interest,
        current_status,
        sales_rep_id,
        sales_rep_ref
    ) VALUES (
        new_client_id,
        lead_data->>'submitted_by',
        business_data->>'business_name',
        business_data->>'registration_number',
        business_data->>'physical_address',
        business_data->>'contact_name',
        business_data->>'contact_role',
        business_data->>'contact_phone',
        business_data->>'contact_email',
        business_data->>'industry',
        COALESCE((lead_data->>'confirmed_interest')::boolean, TRUE),
        'submitted',
        sales_rep_id,
        lead_data->>'sales_rep_ref'
    )
    RETURNING id INTO new_lead_id;
    
    RETURN jsonb_build_object(
        'success', TRUE,
        'client_id', new_client_id,
        'lead_id', new_lead_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- DOCUMENT MANAGEMENT FUNCTIONS
-- ============================================

-- Request document from client
CREATE OR REPLACE FUNCTION request_document(
    p_client_id UUID,
    p_type TEXT,
    p_name TEXT,
    p_description TEXT DEFAULT NULL,
    p_requested_by UUID DEFAULT auth.uid()
)
RETURNS JSONB AS $$
DECLARE
    new_doc_id UUID;
BEGIN
    INSERT INTO client_documents (
        client_id,
        type,
        name,
        description,
        status,
        requested_by
    ) VALUES (
        p_client_id,
        p_type,
        p_name,
        p_description,
        'pending',
        p_requested_by
    )
    RETURNING id INTO new_doc_id;
    
    RETURN jsonb_build_object(
        'success', TRUE,
        'document_id', new_doc_id,
        'status', 'pending'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Approve or reject document
CREATE OR REPLACE FUNCTION review_document(
    p_document_id UUID,
    p_action TEXT, -- 'approve' or 'reject'
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    new_status TEXT;
    result JSONB;
BEGIN
    new_status := CASE 
        WHEN p_action = 'approve' THEN 'approved'
        WHEN p_action = 'reject' THEN 'rejected'
        ELSE p_action
    END;
    
    UPDATE client_documents
    SET 
        status = new_status,
        admin_notes = p_admin_notes,
        updated_at = NOW()
    WHERE id = p_document_id
    RETURNING jsonb_build_object(
        'document_id', id,
        'status', status,
        'client_id', client_id
    ) INTO result;
    
    RETURN jsonb_build_object(
        'success', TRUE,
        'result', result
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Upload document (client side)
CREATE OR REPLACE FUNCTION upload_document(
    p_document_id UUID,
    p_file_name TEXT,
    p_file_url TEXT,
    p_file_size INTEGER,
    p_mime_type TEXT DEFAULT 'application/pdf',
    p_client_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    doc_client_id UUID;
BEGIN
    -- Verify document belongs to calling user's client
    SELECT client_id INTO doc_client_id
    FROM client_documents
    WHERE id = p_document_id AND status = 'pending';
    
    IF doc_client_id IS NULL THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Document not found or already processed');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM clients 
        WHERE id = doc_client_id AND user_id = auth.uid()
    ) THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Unauthorized');
    END IF;
    
    UPDATE client_documents
    SET 
        file_name = p_file_name,
        file_url = p_file_url,
        file_size = p_file_size,
        mime_type = p_mime_type,
        status = 'submitted',
        uploaded_at = NOW(),
        uploaded_by = auth.uid(),
        client_notes = p_client_notes,
        updated_at = NOW()
    WHERE id = p_document_id;
    
    RETURN jsonb_build_object(
        'success', TRUE,
        'document_id', p_document_id,
        'status', 'submitted'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- MESSAGING FUNCTIONS
-- ============================================

-- Send message to client (admin)
CREATE OR REPLACE FUNCTION send_message_to_client(
    p_client_id UUID,
    p_content TEXT,
    p_sender_id UUID DEFAULT auth.uid()
)
RETURNS JSONB AS $$
DECLARE
    new_message_id UUID;
    sender_name TEXT;
BEGIN
    -- Get sender name
    SELECT first_name || ' ' || last_name INTO sender_name
    FROM user_profiles
    WHERE id = p_sender_id;
    
    INSERT INTO client_messages (
        client_id,
        sender_type,
        sender_id,
        sender_name,
        content,
        status,
        is_read
    ) VALUES (
        p_client_id,
        'admin',
        p_sender_id,
        COALESCE(sender_name, 'Admin'),
        p_content,
        'delivered',
        FALSE
    )
    RETURNING id INTO new_message_id;
    
    RETURN jsonb_build_object(
        'success', TRUE,
        'message_id', new_message_id,
        'client_id', p_client_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Send message to admin (client)
CREATE OR REPLACE FUNCTION send_message_to_admin(
    p_content TEXT,
    p_client_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    client_uuid UUID;
    new_message_id UUID;
    sender_name TEXT;
BEGIN
    -- Get user's client record
    SELECT id INTO client_uuid FROM clients WHERE user_id = auth.uid();
    
    IF client_uuid IS NULL THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'No client record found');
    END IF;
    
    -- Get sender name
    SELECT first_name || ' ' || last_name INTO sender_name
    FROM user_profiles
    WHERE id = auth.uid();
    
    INSERT INTO client_messages (
        client_id,
        sender_type,
        sender_id,
        sender_name,
        content,
        status,
        is_read
    ) VALUES (
        client_uuid,
        'client',
        auth.uid(),
        COALESCE(sender_name, 'Client'),
        p_content,
        'delivered',
        FALSE
    )
    RETURNING id INTO new_message_id;
    
    RETURN jsonb_build_object(
        'success', TRUE,
        'message_id', new_message_id,
        'client_id', client_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_read(
    p_client_id UUID,
    p_message_ids UUID[] DEFAULT NULL -- NULL = mark all as read
)
RETURNS JSONB AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    IF p_message_ids IS NOT NULL THEN
        UPDATE client_messages
        SET is_read = TRUE, read_at = NOW(), status = 'read'
        WHERE id = ANY(p_message_ids)
        AND client_id = p_client_id
        AND is_read = FALSE;
        
        GET DIAGNOSTICS updated_count = ROW_COUNT;
    ELSE
        UPDATE client_messages
        SET is_read = TRUE, read_at = NOW(), status = 'read'
        WHERE client_id = p_client_id
        AND is_read = FALSE
        AND sender_type = 'admin'; -- Only mark admin messages as read
        
        GET DIAGNOSTICS updated_count = ROW_COUNT;
    END IF;
    
    RETURN jsonb_build_object(
        'success', TRUE,
        'messages_marked_read', updated_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get unread message count
CREATE OR REPLACE FUNCTION get_unread_count(p_client_id UUID DEFAULT NULL)
RETURNS INTEGER AS $$
BEGIN
    IF p_client_id IS NOT NULL THEN
        RETURN (
            SELECT COUNT(*) 
            FROM client_messages 
            WHERE client_id = p_client_id 
            AND is_read = FALSE 
            AND sender_type = 'admin'
        );
    ELSE
        RETURN (
            SELECT COUNT(*) 
            FROM client_messages 
            WHERE is_read = FALSE 
            AND sender_type = 'client'
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- USER MANAGEMENT FUNCTIONS
-- ============================================

-- Generate unique reference code for sales rep
CREATE OR REPLACE FUNCTION generate_reference_code(p_first_name TEXT, p_last_name TEXT)
RETURNS TEXT AS $$
DECLARE
    prefix TEXT;
    num TEXT;
    code TEXT;
    exists_check BOOLEAN;
BEGIN
    prefix := UPPER(LEFT(p_first_name, 1) || LEFT(p_last_name, 3));
    
    LOOP
        num := LPAD(FLOOR(1000 + RANDOM() * 9000)::text, 4, '0');
        code := 'F1-' || prefix || '-' || num;
        
        -- Check if code exists
        SELECT EXISTS(SELECT 1 FROM user_profiles WHERE reference_code = code) INTO exists_check;
        
        EXIT WHEN NOT exists_check;
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create sales rep with generated reference code
CREATE OR REPLACE FUNCTION create_sales_rep(
    p_email TEXT,
    p_password TEXT,
    p_first_name TEXT,
    p_last_name TEXT,
    p_phone TEXT,
    p_id_number TEXT,
    p_home_address TEXT
)
RETURNS JSONB AS $$
DECLARE
    new_user_id UUID;
    ref_code TEXT;
BEGIN
    -- Generate reference code
    ref_code := generate_reference_code(p_first_name, p_last_name);
    
    -- Note: User creation should be done via Supabase Auth
    -- This function assumes user already exists and we're just creating the profile
    
    INSERT INTO user_profiles (
        id,
        role,
        first_name,
        last_name,
        phone,
        id_number,
        home_address,
        reference_code,
        referral_link,
        status
    ) VALUES (
        auth.uid(), -- This should be passed or determined from context
        'sales_rep',
        p_first_name,
        p_last_name,
        p_phone,
        p_id_number,
        p_home_address,
        ref_code,
        '/for-business/apply?ref=' || ref_code,
        'pending'
    )
    ON CONFLICT (id) DO UPDATE SET
        reference_code = ref_code,
        referral_link = '/for-business/apply?ref=' || ref_code,
        updated_at = NOW()
    RETURNING id INTO new_user_id;
    
    RETURN jsonb_build_object(
        'success', TRUE,
        'user_id', new_user_id,
        'reference_code', ref_code,
        'referral_link', '/for-business/apply?ref=' || ref_code
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SEARCH & FILTER FUNCTIONS
-- ============================================

-- Search clients with filters
CREATE OR REPLACE FUNCTION search_clients(
    p_search_term TEXT DEFAULT NULL,
    p_status TEXT DEFAULT NULL,
    p_assigned_admin UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    total_count INTEGER;
BEGIN
    SELECT jsonb_agg(c.*), COUNT(*) OVER()
    INTO result, total_count
    FROM clients c
    WHERE (
        p_search_term IS NULL OR
        business_name ILIKE '%' || p_search_term || '%' OR
        contact_name ILIKE '%' || p_search_term || '%' OR
        contact_email ILIKE '%' || p_search_term || '%' OR
        registration_number ILIKE '%' || p_search_term || '%'
    )
    AND (p_status IS NULL OR status = p_status)
    AND (p_assigned_admin IS NULL OR assigned_admin_id = p_assigned_admin)
    ORDER BY created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
    
    RETURN jsonb_build_object(
        'clients', COALESCE(result, '[]'::jsonb),
        'total', total_count,
        'limit', p_limit,
        'offset', p_offset
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Search leads with filters
CREATE OR REPLACE FUNCTION search_leads(
    p_search_term TEXT DEFAULT NULL,
    p_status TEXT DEFAULT NULL,
    p_submitted_by UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    total_count INTEGER;
BEGIN
    SELECT jsonb_agg(l.*), COUNT(*) OVER()
    INTO result, total_count
    FROM leads l
    WHERE (
        p_search_term IS NULL OR
        business_name ILIKE '%' || p_search_term || '%' OR
        contact_name ILIKE '%' || p_search_term || '%'
    )
    AND (p_status IS NULL OR current_status = p_status)
    AND (p_submitted_by IS NULL OR submitted_by = p_submitted_by)
    ORDER BY submitted_at DESC
    LIMIT p_limit
    OFFSET p_offset;
    
    RETURN jsonb_build_object(
        'leads', COALESCE(result, '[]'::jsonb),
        'total', total_count,
        'limit', p_limit,
        'offset', p_offset
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMPLETION
-- ============================================

DO $$
BEGIN
    RAISE NOTICE 'Foundation-1 functions migration completed successfully!';
    RAISE NOTICE 'Next: Run 004_seed_data.sql for initial test data';
END $$;
