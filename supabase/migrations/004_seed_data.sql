-- ============================================
-- FOUNDATION-1 SEED DATA MIGRATION
-- ============================================
-- Run after 003_functions.sql
-- This creates initial test data matching your existing mock data
-- NOTE: Only run this in development/staging, NOT production

DO $$
DECLARE
    admin_id UUID;
    rep1_id UUID;
    rep2_id UUID;
    biz1_id UUID;
    client1_id UUID;
    client2_id UUID;
    client3_id UUID;
    lead1_id UUID;
    doc1_id UUID;
    doc2_id UUID;
BEGIN
    -- ============================================
    -- CREATE AUTH USERS (these would normally be created via Supabase Auth)
    -- For seeding, we use gen_random_uuid() and assume auth.users entries exist
    -- ============================================
    
    admin_id := '00000000-0000-0000-0000-000000000001'::UUID;
    rep1_id := '00000000-0000-0000-0000-000000000002'::UUID;
    rep2_id := '00000000-0000-0000-0000-000000000003'::UUID;
    biz1_id := '00000000-0000-0000-0000-000000000004'::UUID;
    
    -- ============================================
    -- USER PROFILES
    -- ============================================
    
    INSERT INTO user_profiles (id, role, first_name, last_name, phone, status, bank_name, account_number, branch_code, reference_code, referral_link, contract_signed, contract_signed_at, id_number, home_address)
    VALUES 
    (admin_id, 'admin', 'Admin', 'User', '+27 11 000 0000', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL)
    ON CONFLICT (id) DO NOTHING;
    
    INSERT INTO user_profiles (id, role, first_name, last_name, phone, status, bank_name, account_number, branch_code, reference_code, referral_link, contract_signed, contract_signed_at, id_number, home_address)
    VALUES 
    (rep1_id, 'sales_rep', 'James', 'Molefe', '+27 82 000 0001', 'approved', 'FNB', '62000000001', '250655', 'F1-JMOL-4821', '/for-business/apply?ref=F1-JMOL-4821', TRUE, '2025-06-16T10:00:00Z', '9001011234081', '123 Main Street, Sandton, Johannesburg, 2196')
    ON CONFLICT (id) DO NOTHING;
    
    INSERT INTO user_profiles (id, role, first_name, last_name, phone, status, bank_name, account_number, branch_code, reference_code, referral_link, contract_signed, contract_signed_at)
    VALUES 
    (rep2_id, 'sales_rep', 'Sarah', 'Naidoo', '+27 83 000 0002', 'approved', 'Standard Bank', '01000000002', '051001', 'F1-SNAI-7293', '/for-business/apply?ref=F1-SNAI-7293', TRUE, '2025-07-02T09:00:00Z')
    ON CONFLICT (id) DO NOTHING;
    
    INSERT INTO user_profiles (id, role, first_name, last_name, phone, status, business_name, registration_number, industry, employees, primary_contact_role)
    VALUES 
    (biz1_id, 'business', 'John', 'Smith', '0711230333', 'approved', 'Demo Business (Pty) Ltd', '2020/123456/07', 'manufacturing_industrial', '11-50', 'Director')
    ON CONFLICT (id) DO NOTHING;
    
    -- ============================================
    -- CLIENTS
    -- ============================================
    
    INSERT INTO clients (id, user_id, business_name, registration_number, industry, contact_name, contact_email, contact_phone, physical_address, status, notes, tags, assigned_admin_id)
    VALUES 
    (gen_random_uuid(), biz1_id, 'Demo Business (Pty) Ltd', '2020/123456/07', 'manufacturing_industrial', 'John Smith', 'business@foundation-1.co.za', '0711230333', '123 Business Street, Johannesburg, 2000', 'active', 'Demo client for testing', ARRAY['demo', 'manufacturing'], admin_id)
    ON CONFLICT DO NOTHING
    RETURNING id INTO client1_id;
    
    -- If conflict happened, get existing id
    IF client1_id IS NULL THEN
        SELECT id INTO client1_id FROM clients WHERE registration_number = '2020/123456/07';
    END IF;
    
    INSERT INTO clients (id, user_id, business_name, registration_number, industry, contact_name, contact_email, contact_phone, physical_address, status, notes, tags, assigned_admin_id)
    VALUES 
    (gen_random_uuid(), NULL, 'Greenfield Manufacturing (Pty) Ltd', '2019/123456/07', 'manufacturing_industrial', 'Thabo Mkhize', 'thabo@greenfield.co.za', '+27 11 394 0000', '12 Industrial Road, Spartan, Kempton Park, 1619', 'active', 'Contract signed, waiting for KYC', ARRAY['solar-ready', 'high-value'], admin_id)
    ON CONFLICT DO NOTHING
    RETURNING id INTO client2_id;
    
    IF client2_id IS NULL THEN
        SELECT id INTO client2_id FROM clients WHERE registration_number = '2019/123456/07';
    END IF;
    
    INSERT INTO clients (id, user_id, business_name, registration_number, industry, contact_name, contact_email, contact_phone, physical_address, status, tags, assigned_admin_id)
    VALUES 
    (gen_random_uuid(), NULL, 'Cape Agri Supplies', '2020/654321/07', 'agriculture', 'Liesl van der Merwe', 'liesl@capeagri.co.za', '+27 21 860 0000', '45 Farm Lane, Paarl, 7646', 'active', ARRAY['agriculture', 'western_cape'], admin_id)
    ON CONFLICT DO NOTHING
    RETURNING id INTO client3_id;
    
    IF client3_id IS NULL THEN
        SELECT id INTO client3_id FROM clients WHERE registration_number = '2020/654321/07';
    END IF;
    
    -- ============================================
    -- CLIENT DOCUMENTS
    -- ============================================
    
    INSERT INTO client_documents (client_id, type, name, description, status, file_name, file_size, uploaded_at, requested_at, requested_by, client_notes)
    VALUES 
    (client1_id, 'id_document', 'Director ID Document', 'Please upload a clear copy of your ID document or passport', 'submitted', 'john_smith_id.pdf', 2048000, '2026-01-16T14:30:00Z', '2026-01-15T10:00:00Z', admin_id, 'Here is my ID document')
    ON CONFLICT DO NOTHING
    RETURNING id INTO doc1_id;
    
    INSERT INTO client_documents (client_id, type, name, description, status, requested_at, requested_by)
    VALUES 
    (client1_id, 'company_registration', 'Company Registration Certificate', 'CIPC company registration certificate', 'pending', '2026-01-15T10:00:00Z', admin_id)
    ON CONFLICT DO NOTHING;
    
    INSERT INTO client_documents (client_id, type, name, description, status, requested_at, requested_by)
    VALUES 
    (client1_id, 'financial_statement', 'Latest Financial Statements', 'Audited financial statements for the last 2 years', 'pending', '2026-01-20T09:00:00Z', admin_id)
    ON CONFLICT DO NOTHING;
    
    INSERT INTO client_documents (client_id, type, name, description, status, file_name, file_size, uploaded_at, requested_at, requested_by, admin_notes)
    VALUES 
    (client2_id, 'contract', 'Signed Service Contract', 'Please sign and upload the service contract', 'submitted', 'greenfield_contract_signed.pdf', 4096000, '2025-12-05T11:00:00Z', '2025-11-20T10:00:00Z', admin_id, 'Contract received and under review')
    ON CONFLICT DO NOTHING
    RETURNING id INTO doc2_id;
    
    -- ============================================
    -- CLIENT MESSAGES
    -- ============================================
    
    INSERT INTO client_messages (client_id, sender_type, sender_id, sender_name, content, status, is_read, read_at)
    VALUES 
    (client1_id, 'admin', admin_id, 'Admin User', 'Welcome to our client portal! Please upload the required documents to proceed with your application.', 'delivered', TRUE, '2026-01-15T11:30:00Z');
    
    INSERT INTO client_messages (client_id, sender_type, sender_id, sender_name, content, status, is_read, read_at)
    VALUES 
    (client1_id, 'client', biz1_id, 'John Smith', 'Thank you! I have uploaded my ID document. I will get the other documents ready soon.', 'delivered', TRUE, '2026-01-16T15:00:00Z');
    
    INSERT INTO client_messages (client_id, sender_type, sender_id, sender_name, content, status, is_read)
    VALUES 
    (client1_id, 'admin', admin_id, 'Admin User', 'Great! The ID looks good. Please also upload your company registration certificate when you have a chance.', 'delivered', FALSE);
    
    INSERT INTO client_messages (client_id, sender_type, sender_id, sender_name, content, status, is_read, read_at)
    VALUES 
    (client2_id, 'admin', admin_id, 'Admin User', 'Your contract has been received and approved. We will proceed with the installation scheduling.', 'delivered', TRUE, '2025-12-06T10:30:00Z');
    
    -- ============================================
    -- LEADS
    -- ============================================
    
    INSERT INTO leads (id, submitted_by, business_id, business_name, registration_number, physical_address, contact_name, contact_role, contact_phone, contact_email, utility_bill_url, confirmed_interest, current_status, status_history, commission_amount, commission_paid)
    VALUES 
    (gen_random_uuid(), rep1_id, client2_id, 'Greenfield Manufacturing (Pty) Ltd', '2019/123456/07', '12 Industrial Road, Spartan, Kempton Park, 1619', 'Thabo Mkhize', 'Operations Director', '+27 11 394 0000', 'thabo@greenfield.co.za', 'greenfield_bill_oct2025.pdf', TRUE, 'contract_signed', '[
        {"status": "submitted", "timestamp": "2025-11-10T09:30:00Z"},
        {"status": "pre_validated", "timestamp": "2025-11-11T14:00:00Z"},
        {"status": "partner_review", "timestamp": "2025-11-15T10:00:00Z"},
        {"status": "approved", "timestamp": "2025-11-22T16:00:00Z"},
        {"status": "contract_signed", "timestamp": "2025-12-05T11:00:00Z"}
    ]'::jsonb, 15000, FALSE)
    ON CONFLICT DO NOTHING;
    
    INSERT INTO leads (id, submitted_by, business_id, business_name, registration_number, physical_address, contact_name, contact_role, contact_phone, contact_email, utility_bill_url, confirmed_interest, current_status, status_history, commission_amount, commission_paid)
    VALUES 
    (gen_random_uuid(), rep1_id, client3_id, 'Cape Agri Supplies', '2020/654321/07', '45 Farm Lane, Paarl, 7646', 'Liesl van der Merwe', 'Managing Director', '+27 21 860 0000', 'liesl@capeagri.co.za', 'capeagri_bill_nov2025.pdf', TRUE, 'partner_review', '[
        {"status": "submitted", "timestamp": "2025-11-18T11:00:00Z"},
        {"status": "pre_validated", "timestamp": "2025-11-19T09:00:00Z"},
        {"status": "partner_review", "timestamp": "2025-11-25T14:30:00Z"}
    ]'::jsonb, 12000, FALSE)
    ON CONFLICT DO NOTHING;
    
    INSERT INTO leads (id, submitted_by, business_name, registration_number, physical_address, contact_name, contact_role, contact_phone, contact_email, confirmed_interest, current_status, status_history)
    VALUES 
    (gen_random_uuid(), rep1_id, 'Rapid Logistics CC', '2018/789012/23', '88 Freight Avenue, Isando, Ekurhuleni, 1600', 'David Osei', 'Fleet Manager', '+27 11 974 0000', 'david@rapidlogistics.co.za', TRUE, 'pre_validation_failed', '[
        {"status": "submitted", "timestamp": "2025-12-02T08:45:00Z"},
        {"status": "pre_validation_failed", "timestamp": "2025-12-03T10:00:00Z", "note": "Monthly electricity spend below minimum threshold."}
    ]'::jsonb)
    ON CONFLICT DO NOTHING;
    
    INSERT INTO leads (id, submitted_by, business_id, business_name, registration_number, physical_address, contact_name, contact_role, contact_phone, contact_email, utility_bill_url, confirmed_interest, current_status, status_history, commission_amount, commission_paid)
    VALUES 
    (gen_random_uuid(), rep1_id, gen_random_uuid(), 'Savanna Hotels Group', '2017/345678/07', '1 Heritage Blvd, Sandton, 2196', 'Naledi Dlamini', 'CFO', '+27 11 783 0000', 'naledi@savannahotels.co.za', 'savanna_bill_nov2025.pdf', TRUE, 'approved', '[
        {"status": "submitted", "timestamp": "2025-12-10T14:20:00Z"},
        {"status": "pre_validated", "timestamp": "2025-12-11T11:00:00Z"},
        {"status": "partner_review", "timestamp": "2025-12-15T09:00:00Z"},
        {"status": "approved", "timestamp": "2025-12-22T15:30:00Z"}
    ]'::jsonb, 18000, FALSE)
    ON CONFLICT DO NOTHING;
    
    INSERT INTO leads (id, submitted_by, business_name, registration_number, physical_address, contact_name, contact_role, contact_phone, contact_email, confirmed_interest, current_status, status_history)
    VALUES 
    (gen_random_uuid(), rep1_id, 'Metro Auto Parts', '2021/901234/07', '23 Parts Street, Roodepoort, 1724', 'Pieter Botha', 'Owner', '+27 11 764 0000', 'pieter@metroauto.co.za', TRUE, 'submitted', '[
        {"status": "submitted", "timestamp": "2026-01-05T10:00:00Z"}
    ]'::jsonb)
    ON CONFLICT DO NOTHING;
    
    INSERT INTO leads (id, submitted_by, business_name, registration_number, physical_address, contact_name, contact_role, contact_phone, contact_email, utility_bill_url, confirmed_interest, current_status, status_history, commission_amount, commission_paid, paid_at)
    VALUES 
    (gen_random_uuid(), rep1_id, 'Durban Fresh Foods (Pty) Ltd', '2022/567890/07', '67 Market Road, Durban, 4001', 'Priya Govender', 'General Manager', '+27 31 305 0000', 'priya@durbanfresh.co.za', 'durbanfresh_bill_dec2025.pdf', TRUE, 'commission_earned', '[
        {"status": "submitted", "timestamp": "2025-09-01T10:00:00Z"},
        {"status": "pre_validated", "timestamp": "2025-09-02T14:00:00Z"},
        {"status": "partner_review", "timestamp": "2025-09-10T09:00:00Z"},
        {"status": "approved", "timestamp": "2025-09-20T16:00:00Z"},
        {"status": "contract_signed", "timestamp": "2025-10-05T11:00:00Z"},
        {"status": "commission_earned", "timestamp": "2025-11-01T09:00:00Z"}
    ]'::jsonb, 20000, TRUE, '2025-11-15T09:00:00Z')
    ON CONFLICT DO NOTHING;
    
    INSERT INTO leads (id, submitted_by, business_name, registration_number, physical_address, contact_name, contact_role, contact_phone, contact_email, utility_bill_url, confirmed_interest, current_status, status_history)
    VALUES 
    (gen_random_uuid(), rep2_id, 'Highveld Mining Supplies', '2016/111222/07', '5 Mining Drive, Witbank, 1035', 'Johannes Pretorius', 'Procurement Manager', '+27 13 656 0000', 'johannes@highveld.co.za', 'highveld_bill_nov2025.pdf', TRUE, 'rejected', '[
        {"status": "submitted", "timestamp": "2025-12-01T09:00:00Z"},
        {"status": "pre_validated", "timestamp": "2025-12-02T11:00:00Z"},
        {"status": "partner_review", "timestamp": "2025-12-08T10:00:00Z"},
        {"status": "rejected", "timestamp": "2025-12-15T14:00:00Z", "note": "Roof structure unsuitable for solar installation."}
    ]'::jsonb)
    ON CONFLICT DO NOTHING;
    
    -- Link client1 to a lead
    UPDATE leads SET business_id = client1_id 
    WHERE business_name = 'Demo Business (Pty) Ltd' AND business_id IS NULL;
    
END $$;

-- ============================================
-- VERIFY SEED DATA
-- ============================================

DO $$
DECLARE
    user_count INTEGER;
    client_count INTEGER;
    doc_count INTEGER;
    message_count INTEGER;
    lead_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM user_profiles;
    SELECT COUNT(*) INTO client_count FROM clients;
    SELECT COUNT(*) INTO doc_count FROM client_documents;
    SELECT COUNT(*) INTO message_count FROM client_messages;
    SELECT COUNT(*) INTO lead_count FROM leads;
    
    RAISE NOTICE 'Seed data verification:';
    RAISE NOTICE '  User profiles: %', user_count;
    RAISE NOTICE '  Clients: %', client_count;
    RAISE NOTICE '  Documents: %', doc_count;
    RAISE NOTICE '  Messages: %', message_count;
    RAISE NOTICE '  Leads: %', lead_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Foundation-1 seed data migration completed successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Set up Supabase Auth with email/password provider';
    RAISE NOTICE '  2. Configure storage buckets in Supabase Dashboard';
    RAISE NOTICE '  3. Enable realtime subscriptions in Supabase Dashboard';
    RAISE NOTICE '  4. Update frontend to use Supabase client';
END $$;
