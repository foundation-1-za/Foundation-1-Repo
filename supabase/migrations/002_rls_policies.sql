-- ============================================
-- FOUNDATION-1 RLS POLICIES MIGRATION
-- ============================================
-- Run after 001_initial_schema.sql
-- This enables Row Level Security and creates policies

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is sales_rep
CREATE OR REPLACE FUNCTION is_sales_rep(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = user_id AND role = 'sales_rep'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is business
CREATE OR REPLACE FUNCTION is_business(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = user_id AND role = 'business'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's client record
CREATE OR REPLACE FUNCTION get_user_client_id(user_id UUID)
RETURNS UUID AS $$
DECLARE
    client_id UUID;
BEGIN
    SELECT id INTO client_id FROM clients WHERE user_id = user_id;
    RETURN client_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- USER PROFILES POLICIES
-- ============================================

-- Admins can do everything
CREATE POLICY "Admins full access to user_profiles"
    ON user_profiles
    FOR ALL
    TO authenticated
    USING (is_admin(auth.uid()));

-- Users can view their own profile
CREATE POLICY "Users view own profile"
    ON user_profiles
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Users can update their own profile (except role/status)
CREATE POLICY "Users update own profile"
    ON user_profiles
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid() AND role = (SELECT role FROM user_profiles WHERE id = auth.uid()));

-- Sales reps can view business profiles for their leads
CREATE POLICY "Sales reps view business profiles"
    ON user_profiles
    FOR SELECT
    TO authenticated
    USING (
        is_sales_rep(auth.uid()) AND 
        role = 'business' AND
        EXISTS (
            SELECT 1 FROM leads
            WHERE sales_rep_id = auth.uid() 
            AND submitted_by IN (SELECT id FROM user_profiles WHERE id = leads.submitted_by)
        )
    );

-- ============================================
-- CLIENTS POLICIES
-- ============================================

-- Admins full access
CREATE POLICY "Admins full access to clients"
    ON clients
    FOR ALL
    TO authenticated
    USING (is_admin(auth.uid()));

-- Users can view their own client record
CREATE POLICY "Users view own client"
    ON clients
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Users can update their own client record (limited fields)
CREATE POLICY "Users update own client"
    ON clients
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (
        user_id = auth.uid() AND
        -- Prevent changing critical fields
        status = (SELECT status FROM clients WHERE id = clients.id)
    );

-- Sales reps can view clients they referred
CREATE POLICY "Sales reps view referred clients"
    ON clients
    FOR SELECT
    TO authenticated
    USING (
        is_sales_rep(auth.uid()) AND
        EXISTS (
            SELECT 1 FROM leads
            WHERE sales_rep_id = auth.uid()
            AND business_id = clients.id
        )
    );

-- ============================================
-- CLIENT DOCUMENTS POLICIES
-- ============================================

-- Admins full access
CREATE POLICY "Admins full access to documents"
    ON client_documents
    FOR ALL
    TO authenticated
    USING (is_admin(auth.uid()));

-- Users can view documents for their client
CREATE POLICY "Users view own documents"
    ON client_documents
    FOR SELECT
    TO authenticated
    USING (
        client_id IN (
            SELECT id FROM clients WHERE user_id = auth.uid()
        )
    );

-- Users can upload documents (update pending to submitted)
CREATE POLICY "Users upload documents"
    ON client_documents
    FOR UPDATE
    TO authenticated
    USING (
        client_id IN (
            SELECT id FROM clients WHERE user_id = auth.uid()
        )
        AND status = 'pending'
    )
    WITH CHECK (
        client_id IN (
            SELECT id FROM clients WHERE user_id = auth.uid()
        )
        AND status = 'submitted'
    );

-- Sales reps can view documents for their leads
CREATE POLICY "Sales reps view lead documents"
    ON client_documents
    FOR SELECT
    TO authenticated
    USING (
        is_sales_rep(auth.uid()) AND
        EXISTS (
            SELECT 1 FROM leads
            WHERE sales_rep_id = auth.uid()
            AND business_id = client_documents.client_id
        )
    );

-- ============================================
-- CLIENT MESSAGES POLICIES
-- ============================================

-- Admins full access
CREATE POLICY "Admins full access to messages"
    ON client_messages
    FOR ALL
    TO authenticated
    USING (is_admin(auth.uid()));

-- Users can view messages for their client
CREATE POLICY "Users view own messages"
    ON client_messages
    FOR SELECT
    TO authenticated
    USING (
        client_id IN (
            SELECT id FROM clients WHERE user_id = auth.uid()
        )
    );

-- Users can insert messages (as client)
CREATE POLICY "Users insert messages"
    ON client_messages
    FOR INSERT
    TO authenticated
    WITH CHECK (
        sender_id = auth.uid() AND
        sender_type = 'client' AND
        client_id IN (
            SELECT id FROM clients WHERE user_id = auth.uid()
        )
    );

-- Users can update messages (mark as read)
CREATE POLICY "Users mark messages read"
    ON client_messages
    FOR UPDATE
    TO authenticated
    USING (
        client_id IN (
            SELECT id FROM clients WHERE user_id = auth.uid()
        )
        AND sender_type = 'admin'
    )
    WITH CHECK (
        is_read = TRUE
    );

-- Sales reps can view messages for their leads
CREATE POLICY "Sales reps view lead messages"
    ON client_messages
    FOR SELECT
    TO authenticated
    USING (
        is_sales_rep(auth.uid()) AND
        EXISTS (
            SELECT 1 FROM leads
            WHERE sales_rep_id = auth.uid()
            AND business_id = client_messages.client_id
        )
    );

-- ============================================
-- LEADS POLICIES
-- ============================================

-- Admins full access
CREATE POLICY "Admins full access to leads"
    ON leads
    FOR ALL
    TO authenticated
    USING (is_admin(auth.uid()));

-- Sales reps can view leads they submitted
CREATE POLICY "Sales reps view own leads"
    ON leads
    FOR SELECT
    TO authenticated
    USING (
        is_sales_rep(auth.uid()) AND
        submitted_by IN (
            SELECT id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- Sales reps can create leads
CREATE POLICY "Sales reps create leads"
    ON leads
    FOR INSERT
    TO authenticated
    WITH CHECK (
        is_sales_rep(auth.uid()) AND
        submitted_by = auth.uid()
    );

-- Users can view leads for their business
CREATE POLICY "Users view own leads"
    ON leads
    FOR SELECT
    TO authenticated
    USING (
        business_id IN (
            SELECT id FROM clients WHERE user_id = auth.uid()
        )
    );

-- ============================================
-- SUPPORT REQUESTS POLICIES
-- ============================================

-- Admins full access
CREATE POLICY "Admins full access to support"
    ON support_requests
    FOR ALL
    TO authenticated
    USING (is_admin(auth.uid()));

-- Users can view their own support requests
CREATE POLICY "Users view own support"
    ON support_requests
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Users can create support requests
CREATE POLICY "Users create support"
    ON support_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Users can update their own support requests (limited)
CREATE POLICY "Users update own support"
    ON support_requests
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================
-- AUDIT LOGS POLICIES
-- ============================================

-- Only admins can view audit logs
CREATE POLICY "Admins view audit logs"
    ON audit_logs
    FOR SELECT
    TO authenticated
    USING (is_admin(auth.uid()));

-- No one can modify audit logs
CREATE POLICY "No one can modify audit logs"
    ON audit_logs
    FOR ALL
    TO authenticated
    USING (FALSE);

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Client Documents Bucket Policies

-- Admins can do everything
CREATE POLICY "Admins full access to client-documents"
    ON storage.objects
    FOR ALL
    TO authenticated
    USING (
        bucket_id = 'client-documents' AND
        is_admin(auth.uid())
    );

-- Users can upload to their own folder
CREATE POLICY "Users upload to own client-documents"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'client-documents' AND
        (storage.filename(name))[1] = auth.uid()::text
    );

-- Users can view their own documents
CREATE POLICY "Users view own client-documents"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'client-documents' AND
        (
            -- Their own uploads
            (storage.filename(name))[1] = auth.uid()::text
            OR
            -- Documents requested for their client
            EXISTS (
                SELECT 1 FROM client_documents cd
                JOIN clients c ON cd.client_id = c.id
                WHERE c.user_id = auth.uid()
                AND file_url LIKE '%' || storage.objects.name
            )
        )
    );

-- Users can update their own documents
CREATE POLICY "Users update own client-documents"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'client-documents' AND
        owner_id = auth.uid()
    );

-- Users can delete their own documents
CREATE POLICY "Users delete own client-documents"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'client-documents' AND
        owner_id = auth.uid()
    );

-- Lead Attachments Bucket Policies
CREATE POLICY "Admins full access to lead-attachments"
    ON storage.objects
    FOR ALL
    TO authenticated
    USING (
        bucket_id = 'lead-attachments' AND
        is_admin(auth.uid())
    );

CREATE POLICY "Sales reps upload to lead-attachments"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'lead-attachments' AND
        is_sales_rep(auth.uid())
    );

-- User CVs Bucket Policies
CREATE POLICY "Admins full access to user-cvs"
    ON storage.objects
    FOR ALL
    TO authenticated
    USING (
        bucket_id = 'user-cvs' AND
        is_admin(auth.uid())
    );

CREATE POLICY "Users manage own CV"
    ON storage.objects
    FOR ALL
    TO authenticated
    USING (
        bucket_id = 'user-cvs' AND
        owner_id = auth.uid()
    );

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================

-- Enable realtime for tables that need it
ALTER PUBLICATION supabase_realtime ADD TABLE client_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE client_documents;
ALTER PUBLICATION supabase_realtime ADD TABLE leads;

-- ============================================
-- COMPLETION
-- ============================================

DO $$
BEGIN
    RAISE NOTICE 'Foundation-1 RLS policies migration completed successfully!';
    RAISE NOTICE 'Next: Run 003_functions.sql for helper functions and stored procedures';
END $$;
