-- ============================================
-- FOUNDATION-1 INITIAL SCHEMA MIGRATION
-- ============================================
-- Run this first to create all tables, indexes, and triggers

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USER PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('admin', 'sales_rep', 'business')),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended')),
    
    -- Sales rep specific fields
    bank_name TEXT,
    account_number TEXT,
    branch_code TEXT,
    reference_code TEXT UNIQUE,
    referral_link TEXT,
    cv_file_url TEXT,
    linkedin_url TEXT,
    contract_signed BOOLEAN DEFAULT FALSE,
    contract_signed_at TIMESTAMPTZ,
    id_number TEXT,
    home_address TEXT,
    
    -- Business specific fields
    business_name TEXT,
    registration_number TEXT,
    industry TEXT,
    employees TEXT,
    primary_contact_role TEXT,
    utility_bill_url TEXT,
    sales_rep_ref TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CLIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Business Information
    business_name TEXT NOT NULL,
    registration_number TEXT NOT NULL UNIQUE,
    industry TEXT,
    
    -- Contact Information
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    physical_address TEXT,
    
    -- Status and Assignment
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    assigned_admin_id UUID REFERENCES user_profiles(id),
    
    -- Metadata
    notes TEXT,
    tags TEXT[],
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CLIENT DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS client_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Document Information
    type TEXT NOT NULL CHECK (type IN (
        'id_document', 
        'proof_of_address', 
        'financial_statement', 
        'company_registration', 
        'tax_certificate', 
        'contract', 
        'other'
    )),
    name TEXT NOT NULL,
    description TEXT,
    
    -- Status Tracking
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'rejected')),
    
    -- File Information
    file_name TEXT,
    file_url TEXT,
    file_size INTEGER,
    mime_type TEXT,
    
    -- Request/Upload Tracking
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    requested_by UUID REFERENCES user_profiles(id),
    uploaded_at TIMESTAMPTZ,
    uploaded_by UUID REFERENCES auth.users(id),
    
    -- Notes
    admin_notes TEXT,
    client_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CLIENT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS client_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Sender Information
    sender_type TEXT NOT NULL CHECK (sender_type IN ('admin', 'client')),
    sender_id UUID NOT NULL REFERENCES auth.users(id),
    sender_name TEXT NOT NULL,
    
    -- Message Content
    content TEXT NOT NULL,
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
    
    -- Read Tracking
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    
    -- Attachments (array of storage file paths)
    attachments TEXT[],
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LEADS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submitted_by UUID REFERENCES user_profiles(id),
    business_id UUID REFERENCES clients(id),
    
    -- Business Information
    business_name TEXT NOT NULL,
    registration_number TEXT,
    physical_address TEXT,
    contact_name TEXT,
    contact_role TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    industry TEXT,
    utility_bill_url TEXT,
    
    -- Lead Status
    confirmed_interest BOOLEAN DEFAULT TRUE,
    current_status TEXT DEFAULT 'submitted' CHECK (current_status IN (
        'submitted',
        'pre_validation_failed',
        'pre_validated',
        'partner_review',
        'rejected',
        'approved',
        'contract_signed',
        'commission_earned'
    )),
    status_history JSONB DEFAULT '[]'::JSONB,
    
    -- Commission
    commission_amount DECIMAL(10,2),
    commission_paid BOOLEAN DEFAULT FALSE,
    paid_at TIMESTAMPTZ,
    
    -- Onboarding (new system)
    onboarding_step TEXT CHECK (onboarding_step IN (
        'registration',
        'utility_bill',
        'waiting_proposal',
        'proposal_received',
        'proposal_signed',
        'contract_sent',
        'contract_signed',
        'kyc_documents',
        'final_decision'
    )),
    onboarding_status TEXT CHECK (onboarding_status IN ('pending', 'accepted', 'rejected')),
    
    -- Referral
    sales_rep_id UUID REFERENCES user_profiles(id),
    sales_rep_ref TEXT,
    
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SUPPORT REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS support_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    business_name TEXT,
    
    category TEXT NOT NULL CHECK (category IN (
        'technical_issue',
        'billing_question',
        'product_info',
        'installation_help',
        'maintenance',
        'general'
    )),
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    admin_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- ============================================
-- AUDIT LOG TABLE (for compliance)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    performed_by UUID REFERENCES auth.users(id),
    performed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- User Profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_reference_code ON user_profiles(reference_code);

-- Clients
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_assigned_admin ON clients(assigned_admin_id);
CREATE INDEX IF NOT EXISTS idx_clients_registration ON clients(registration_number);
CREATE INDEX IF NOT EXISTS idx_clients_tags ON clients USING GIN(tags);

-- Client Documents
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON client_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON client_documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_type ON client_documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_requested_at ON client_documents(requested_at DESC);

-- Client Messages
CREATE INDEX IF NOT EXISTS idx_messages_client_id ON client_messages(client_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON client_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON client_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON client_messages(client_id, is_read) WHERE is_read = FALSE;

-- Leads
CREATE INDEX IF NOT EXISTS idx_leads_submitted_by ON leads(submitted_by);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(current_status);
CREATE INDEX IF NOT EXISTS idx_leads_business_id ON leads(business_id);
CREATE INDEX IF NOT EXISTS idx_leads_sales_rep ON leads(sales_rep_id);
CREATE INDEX IF NOT EXISTS idx_leads_submitted_at ON leads(submitted_at DESC);

-- Support Requests
CREATE INDEX IF NOT EXISTS idx_support_user_id ON support_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_support_status ON support_requests(status);
CREATE INDEX IF NOT EXISTS idx_support_category ON support_requests(category);

-- Audit Logs
CREATE INDEX IF NOT EXISTS idx_audit_table ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_record ON audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_performed_at ON audit_logs(performed_at DESC);

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
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
-- MESSAGE NOTIFICATION TRIGGER
-- ============================================

-- Function to handle new message notifications
CREATE OR REPLACE FUNCTION handle_new_message()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the message status to delivered after insert
    NEW.status = 'delivered';
    
    -- If it's a client message, we could trigger notifications here
    -- For now, just return the modified NEW
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_message_created
    BEFORE INSERT ON client_messages
    FOR EACH ROW EXECUTE FUNCTION handle_new_message();

-- ============================================
-- AUDIT LOG TRIGGER
-- ============================================

-- Function to create audit logs
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
$$ language 'plpgsql';

-- Apply audit triggers to important tables
CREATE TRIGGER audit_clients
    AFTER INSERT OR UPDATE OR DELETE ON clients
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_client_documents
    AFTER INSERT OR UPDATE OR DELETE ON client_documents
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_leads
    AFTER INSERT OR UPDATE OR DELETE ON leads
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Note: These are inserted into storage.buckets table
-- Run these after Supabase storage is set up

-- Document uploads bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'client-documents',
    'client-documents',
    FALSE,
    10485760, -- 10MB limit
    ARRAY[
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
)
ON CONFLICT (id) DO NOTHING;

-- Lead attachments bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'lead-attachments',
    'lead-attachments',
    FALSE,
    10485760, -- 10MB limit
    ARRAY[
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp'
    ]
)
ON CONFLICT (id) DO NOTHING;

-- User CVs bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'user-cvs',
    'user-cvs',
    FALSE,
    5242880, -- 5MB limit
    ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- COMPLETION
-- ============================================

DO $$
BEGIN
    RAISE NOTICE 'Foundation-1 schema migration completed successfully!';
    RAISE NOTICE 'Next: Run 002_rls_policies.sql to enable Row Level Security';
END $$;
