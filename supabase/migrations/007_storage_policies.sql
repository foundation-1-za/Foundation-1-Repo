-- ============================================
-- STORAGE BUCKET POLICIES
-- ============================================

-- Ensure buckets exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('client-documents', 'client-documents', false, 10485760, 
        ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword', 
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
    ('lead-attachments', 'lead-attachments', false, 10485760,
        ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
    ('user-cvs', 'user-cvs', false, 5242880,
        ARRAY['application/pdf', 'application/msword', 
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- CLIENT-DOCUMENTS BUCKET POLICIES
-- ============================================

-- Admins full access
CREATE POLICY "Admins full access to client-documents"
    ON storage.objects
    FOR ALL
    TO authenticated
    USING (
        bucket_id = 'client-documents'
        AND EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can upload documents for their client
CREATE POLICY "Users upload own documents"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'client-documents'
        AND EXISTS (
            SELECT 1 FROM clients c
            JOIN client_documents cd ON cd.client_id = c.id
            WHERE c.user_id = auth.uid()
            AND storage.filename(name) LIKE c.id || '/%'
        )
    );

-- Users can view their own uploaded documents
CREATE POLICY "Users view own documents"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'client-documents'
        AND (
            -- Documents uploaded by user
            owner_id = auth.uid()
            OR
            -- Documents for their client
            EXISTS (
                SELECT 1 FROM clients c
                WHERE c.user_id = auth.uid()
                AND storage.filename(name) LIKE c.id || '/%'
            )
        )
    );

-- Users can update their own documents
CREATE POLICY "Users update own documents"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'client-documents'
        AND owner_id = auth.uid()
    );

-- Users can delete their own documents
CREATE POLICY "Users delete own documents"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'client-documents'
        AND owner_id = auth.uid()
    );

-- Sales reps can view documents for their leads
CREATE POLICY "Sales reps view lead documents"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'client-documents'
        AND EXISTS (
            SELECT 1 FROM leads l
            JOIN clients c ON l.business_id = c.id
            WHERE l.sales_rep_id = auth.uid()
            AND storage.filename(name) LIKE c.id || '/%'
        )
    );

-- ============================================
-- LEAD-ATTACHMENTS BUCKET POLICIES
-- ============================================

CREATE POLICY "Admins full access to lead-attachments"
    ON storage.objects
    FOR ALL
    TO authenticated
    USING (
        bucket_id = 'lead-attachments'
        AND EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Sales reps upload lead attachments"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'lead-attachments'
        AND EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'sales_rep'
        )
    );

CREATE POLICY "Sales reps view own lead attachments"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'lead-attachments'
        AND (
            owner_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM leads
                WHERE sales_rep_id = auth.uid()
                AND storage.filename(name) LIKE id || '/%'
            )
        )
    );

-- ============================================
-- USER-CVS BUCKET POLICIES
-- ============================================

CREATE POLICY "Admins full access to user-cvs"
    ON storage.objects
    FOR ALL
    TO authenticated
    USING (
        bucket_id = 'user-cvs'
        AND EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users manage own CV"
    ON storage.objects
    FOR ALL
    TO authenticated
    USING (
        bucket_id = 'user-cvs'
        AND owner_id = auth.uid()
    );

DO $$
BEGIN
    RAISE NOTICE 'Storage bucket policies created successfully!';
END $$;
