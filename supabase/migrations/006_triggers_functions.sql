-- ============================================
-- DATABASE TRIGGERS & FUNCTIONS
-- ============================================
-- Run this after all other migrations

-- ============================================
-- 1. AUTO-GENERATE REFERENCE CODE FOR SALES REPS
-- ============================================

CREATE OR REPLACE FUNCTION generate_unique_reference_code(p_first_name TEXT, p_last_name TEXT)
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
        SELECT EXISTS(
            SELECT 1 FROM user_profiles WHERE reference_code = code
        ) INTO exists_check;
        
        EXIT WHEN NOT exists_check;
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-set reference code for sales reps
CREATE OR REPLACE FUNCTION set_sales_rep_reference_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'sales_rep' AND NEW.reference_code IS NULL THEN
        NEW.reference_code := generate_unique_reference_code(
            NEW.first_name,
            NEW.last_name
        );
        NEW.referral_link := '/for-business/apply?ref=' || NEW.reference_code;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_reference_code
    BEFORE INSERT ON user_profiles
    FOR EACH ROW
    WHEN (NEW.role = 'sales_rep')
    EXECUTE FUNCTION set_sales_rep_reference_code();

-- ============================================
-- 2. AUTO-CREATE CLIENT FOR BUSINESS USERS
-- ============================================

CREATE OR REPLACE FUNCTION auto_create_client_for_business()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'business' AND NEW.business_name IS NOT NULL THEN
        INSERT INTO clients (
            user_id,
            business_name,
            registration_number,
            industry,
            contact_name,
            contact_email,
            contact_phone,
            physical_address,
            status
        )
        VALUES (
            NEW.id,
            NEW.business_name,
            COALESCE(NEW.registration_number, 'TEMP-' || EXTRACT(EPOCH FROM NOW())::TEXT),
            NEW.industry,
            NEW.first_name || ' ' || NEW.last_name,
            '', -- Will be updated from auth
            NEW.phone,
            NEW.home_address,
            'active'
        )
        ON CONFLICT (registration_number) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_create_client
    AFTER INSERT ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_client_for_business();

-- ============================================
-- 3. LEAD STATUS HISTORY TRACKING
-- ============================================

CREATE OR REPLACE FUNCTION track_lead_status_changes()
RETURNS TRIGGER AS $$
DECLARE
    status_entry JSONB;
    old_status TEXT;
    new_status TEXT;
BEGIN
    -- Get current status from history
    SELECT current_status INTO old_status FROM leads WHERE id = NEW.id;
    new_status := NEW.current_status;
    
    -- Only proceed if status changed
    IF old_status IS DISTINCT FROM new_status THEN
        -- Create history entry
        status_entry := jsonb_build_object(
            'status', new_status,
            'timestamp', NOW(),
            'note', TG_ARGV[0]  -- Can be passed as trigger arg, or null
        );
        
        -- Append to status history
        NEW.status_history := COALESCE(NEW.status_history, '[]'::JSONB) || status_entry;
        
        -- If commission earned, set commission amount if not set
        IF new_status = 'commission_earned' AND NEW.commission_amount IS NULL THEN
            NEW.commission_amount := 2000; -- Default R2000
        END IF;
        
        -- If commission earned and paid, set paid_at
        IF new_status = 'commission_earned' AND NEW.commission_paid THEN
            NEW.paid_at := COALESCE(NEW.paid_at, NOW());
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_lead_status
    BEFORE UPDATE OF current_status ON leads
    FOR EACH ROW
    EXECUTE FUNCTION track_lead_status_changes();

-- ============================================
-- 4. DOCUMENT STATUS CHANGE LOGGING
-- ============================================

CREATE OR REPLACE FUNCTION log_document_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- Create notification for client if status changed
        IF NEW.status IN ('approved', 'rejected') THEN
            INSERT INTO notifications (
                user_id,
                type,
                title,
                content,
                metadata
            )
            SELECT 
                c.user_id,
                'document_' || NEW.status,
                'Document ' || INITCAP(NEW.status),
                'Your document "' || NEW.name || '" has been ' || NEW.status || '.',
                jsonb_build_object(
                    'document_id', NEW.id,
                    'document_name', NEW.name,
                    'status', NEW.status,
                    'admin_notes', NEW.admin_notes
                )
            FROM clients c
            WHERE c.id = NEW.client_id AND c.user_id IS NOT NULL;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_document_status
    AFTER UPDATE ON client_documents
    FOR EACH ROW
    EXECUTE FUNCTION log_document_status_change();

-- ============================================
-- 5. MESSAGE NOTIFICATION CREATOR
-- ============================================

CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Update status to delivered
    NEW.status := 'delivered';
    
    -- Create notification for recipient
    IF NEW.sender_type = 'client' THEN
        -- Notify admins
        INSERT INTO notifications (user_id, type, title, content, metadata)
        SELECT 
            id,
            'new_message',
            'New Message from ' || NEW.sender_name,
            SUBSTRING(NEW.content FROM 1 FOR 100) || CASE WHEN LENGTH(NEW.content) > 100 THEN '...' ELSE '' END,
            jsonb_build_object(
                'message_id', NEW.id,
                'client_id', NEW.client_id,
                'sender_name', NEW.sender_name
            )
        FROM user_profiles
        WHERE role = 'admin';
    ELSE
        -- Notify client
        INSERT INTO notifications (user_id, type, title, content, metadata)
        SELECT 
            user_id,
            'new_message',
            'New Message from ' || NEW.sender_name,
            SUBSTRING(NEW.content FROM 1 FOR 100) || CASE WHEN LENGTH(NEW.content) > 100 THEN '...' ELSE '' END,
            jsonb_build_object(
                'message_id', NEW.id,
                'client_id', NEW.client_id,
                'sender_name', NEW.sender_name
            )
        FROM clients
        WHERE id = NEW.client_id AND user_id IS NOT NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_message_notification
    BEFORE INSERT ON client_messages
    FOR EACH ROW
    EXECUTE FUNCTION create_message_notification();

-- ============================================
-- 6. AUDIT LOG TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_data, performed_by)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD), auth.uid());
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, performed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), auth.uid());
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_data, performed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW), auth.uid());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to important tables
CREATE TRIGGER audit_clients_trigger
    AFTER INSERT OR UPDATE OR DELETE ON clients
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_client_documents_trigger
    AFTER INSERT OR UPDATE OR DELETE ON client_documents
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_leads_trigger
    AFTER INSERT OR UPDATE OR DELETE ON leads
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- ============================================
-- 7. UPDATED_AT AUTO-UPDATE TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_documents_updated_at
    BEFORE UPDATE ON client_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_requests_updated_at
    BEFORE UPDATE ON support_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. UNREAD MESSAGE COUNT FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION get_unread_message_count(p_client_id UUID DEFAULT NULL, p_user_id UUID DEFAULT NULL)
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
    ELSIF p_user_id IS NOT NULL THEN
        -- Count messages for all clients belonging to this user
        RETURN (
            SELECT COUNT(*) 
            FROM client_messages cm
            JOIN clients c ON cm.client_id = c.id
            WHERE c.user_id = p_user_id 
            AND cm.is_read = FALSE 
            AND cm.sender_type = 'admin'
        );
    ELSE
        -- Count all unread messages from clients (for admin dashboard)
        RETURN (
            SELECT COUNT(*) 
            FROM client_messages 
            WHERE is_read = FALSE 
            AND sender_type = 'client'
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. COMMISSION CALCULATION
-- ============================================

CREATE OR REPLACE FUNCTION calculate_sales_rep_commission(p_rep_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_earned', COALESCE(SUM(CASE WHEN commission_paid THEN commission_amount ELSE 0 END), 0),
        'total_pending', COALESCE(SUM(CASE WHEN NOT commission_paid AND commission_amount IS NOT NULL THEN commission_amount ELSE 0 END), 0),
        'approved_count', COUNT(*) FILTER (WHERE current_status IN ('approved', 'contract_signed', 'commission_earned')),
        'commissioned_count', COUNT(*) FILTER (WHERE current_status = 'commission_earned')
    )
    INTO result
    FROM leads
    WHERE sales_rep_id = p_rep_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10. CLIENT STATS FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION get_client_dashboard_stats(p_client_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_documents', (SELECT COUNT(*) FROM client_documents WHERE client_id = p_client_id),
        'pending_documents', (SELECT COUNT(*) FROM client_documents WHERE client_id = p_client_id AND status = 'pending'),
        'approved_documents', (SELECT COUNT(*) FROM client_documents WHERE client_id = p_client_id AND status = 'approved'),
        'total_messages', (SELECT COUNT(*) FROM client_messages WHERE client_id = p_client_id),
        'unread_messages', (SELECT COUNT(*) FROM client_messages WHERE client_id = p_client_id AND is_read = FALSE AND sender_type = 'admin'),
        'current_lead_status', (SELECT current_status FROM leads WHERE business_id = p_client_id ORDER BY created_at DESC LIMIT 1),
        'last_activity', (
            SELECT MAX(created_at) FROM (
                SELECT created_at FROM client_messages WHERE client_id = p_client_id
                UNION ALL
                SELECT updated_at FROM client_documents WHERE client_id = p_client_id
            ) AS activities
        )
    )
    INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    RAISE NOTICE 'Database triggers and functions created successfully!';
END $$;
