export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            clients: {
                Row: {
                    id: string;
                    user_id: string | null;
                    business_name: string;
                    registration_number: string;
                    industry: string | null;
                    contact_name: string;
                    contact_email: string;
                    contact_phone: string | null;
                    physical_address: string | null;
                    status: 'active' | 'inactive' | 'suspended';
                    assigned_admin_id: string | null;
                    notes: string | null;
                    tags: string[] | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string | null;
                    business_name: string;
                    registration_number: string;
                    industry?: string | null;
                    contact_name: string;
                    contact_email: string;
                    contact_phone?: string | null;
                    physical_address?: string | null;
                    status?: 'active' | 'inactive' | 'suspended';
                    assigned_admin_id?: string | null;
                    notes?: string | null;
                    tags?: string[] | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string | null;
                    business_name?: string;
                    registration_number?: string;
                    industry?: string | null;
                    contact_name?: string;
                    contact_email?: string;
                    contact_phone?: string | null;
                    physical_address?: string | null;
                    status?: 'active' | 'inactive' | 'suspended';
                    assigned_admin_id?: string | null;
                    notes?: string | null;
                    tags?: string[] | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            client_documents: {
                Row: {
                    id: string;
                    client_id: string;
                    type: 'id_document' | 'proof_of_address' | 'financial_statement' | 'company_registration' | 'tax_certificate' | 'contract' | 'other';
                    name: string;
                    description: string | null;
                    status: 'pending' | 'submitted' | 'approved' | 'rejected';
                    file_name: string | null;
                    file_url: string | null;
                    file_size: number | null;
                    mime_type: string | null;
                    requested_at: string;
                    requested_by: string | null;
                    uploaded_at: string | null;
                    uploaded_by: string | null;
                    admin_notes: string | null;
                    client_notes: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    client_id: string;
                    type: 'id_document' | 'proof_of_address' | 'financial_statement' | 'company_registration' | 'tax_certificate' | 'contract' | 'other';
                    name: string;
                    description?: string | null;
                    status?: 'pending' | 'submitted' | 'approved' | 'rejected';
                    file_name?: string | null;
                    file_url?: string | null;
                    file_size?: number | null;
                    mime_type?: string | null;
                    requested_at?: string;
                    requested_by?: string | null;
                    uploaded_at?: string | null;
                    uploaded_by?: string | null;
                    admin_notes?: string | null;
                    client_notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    client_id?: string;
                    type?: 'id_document' | 'proof_of_address' | 'financial_statement' | 'company_registration' | 'tax_certificate' | 'contract' | 'other';
                    name?: string;
                    description?: string | null;
                    status?: 'pending' | 'submitted' | 'approved' | 'rejected';
                    file_name?: string | null;
                    file_url?: string | null;
                    file_size?: number | null;
                    mime_type?: string | null;
                    requested_at?: string;
                    requested_by?: string | null;
                    uploaded_at?: string | null;
                    uploaded_by?: string | null;
                    admin_notes?: string | null;
                    client_notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            client_messages: {
                Row: {
                    id: string;
                    client_id: string;
                    sender_type: 'admin' | 'client';
                    sender_id: string;
                    sender_name: string;
                    content: string;
                    status: 'sent' | 'delivered' | 'read';
                    is_read: boolean;
                    read_at: string | null;
                    attachments: string[] | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    client_id: string;
                    sender_type: 'admin' | 'client';
                    sender_id: string;
                    sender_name: string;
                    content: string;
                    status?: 'sent' | 'delivered' | 'read';
                    is_read?: boolean;
                    read_at?: string | null;
                    attachments?: string[] | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    client_id?: string;
                    sender_type?: 'admin' | 'client';
                    sender_id?: string;
                    sender_name?: string;
                    content?: string;
                    status?: 'sent' | 'delivered' | 'read';
                    is_read?: boolean;
                    read_at?: string | null;
                    attachments?: string[] | null;
                    created_at?: string;
                };
            };
            leads: {
                Row: {
                    id: string;
                    submitted_by: string | null;
                    business_id: string | null;
                    business_name: string;
                    registration_number: string | null;
                    physical_address: string | null;
                    contact_name: string | null;
                    contact_role: string | null;
                    contact_phone: string | null;
                    contact_email: string | null;
                    industry: string | null;
                    utility_bill_url: string | null;
                    confirmed_interest: boolean;
                    current_status: string;
                    status_history: Json;
                    commission_amount: number | null;
                    commission_paid: boolean;
                    paid_at: string | null;
                    onboarding_step: string | null;
                    onboarding_status: string | null;
                    sales_rep_id: string | null;
                    sales_rep_ref: string | null;
                    submitted_at: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    submitted_by?: string | null;
                    business_id?: string | null;
                    business_name: string;
                    registration_number?: string | null;
                    physical_address?: string | null;
                    contact_name?: string | null;
                    contact_role?: string | null;
                    contact_phone?: string | null;
                    contact_email?: string | null;
                    industry?: string | null;
                    utility_bill_url?: string | null;
                    confirmed_interest?: boolean;
                    current_status?: string;
                    status_history?: Json;
                    commission_amount?: number | null;
                    commission_paid?: boolean;
                    paid_at?: string | null;
                    onboarding_step?: string | null;
                    onboarding_status?: string | null;
                    sales_rep_id?: string | null;
                    sales_rep_ref?: string | null;
                    submitted_at?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    submitted_by?: string | null;
                    business_id?: string | null;
                    business_name?: string;
                    registration_number?: string | null;
                    physical_address?: string | null;
                    contact_name?: string | null;
                    contact_role?: string | null;
                    contact_phone?: string | null;
                    contact_email?: string | null;
                    industry?: string | null;
                    utility_bill_url?: string | null;
                    confirmed_interest?: boolean;
                    current_status?: string;
                    status_history?: Json;
                    commission_amount?: number | null;
                    commission_paid?: boolean;
                    paid_at?: string | null;
                    onboarding_step?: string | null;
                    onboarding_status?: string | null;
                    sales_rep_id?: string | null;
                    sales_rep_ref?: string | null;
                    submitted_at?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            user_profiles: {
                Row: {
                    id: string;
                    role: 'admin' | 'sales_rep' | 'business';
                    first_name: string;
                    last_name: string;
                    phone: string | null;
                    status: 'pending' | 'approved' | 'suspended';
                    bank_name: string | null;
                    account_number: string | null;
                    branch_code: string | null;
                    reference_code: string | null;
                    referral_link: string | null;
                    cv_file_url: string | null;
                    linkedin_url: string | null;
                    contract_signed: boolean;
                    contract_signed_at: string | null;
                    id_number: string | null;
                    home_address: string | null;
                    business_name: string | null;
                    registration_number: string | null;
                    industry: string | null;
                    employees: string | null;
                    primary_contact_role: string | null;
                    utility_bill_url: string | null;
                    sales_rep_ref: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    role: 'admin' | 'sales_rep' | 'business';
                    first_name: string;
                    last_name: string;
                    phone?: string | null;
                    status?: 'pending' | 'approved' | 'suspended';
                    bank_name?: string | null;
                    account_number?: string | null;
                    branch_code?: string | null;
                    reference_code?: string | null;
                    referral_link?: string | null;
                    cv_file_url?: string | null;
                    linkedin_url?: string | null;
                    contract_signed?: boolean;
                    contract_signed_at?: string | null;
                    id_number?: string | null;
                    home_address?: string | null;
                    business_name?: string | null;
                    registration_number?: string | null;
                    industry?: string | null;
                    employees?: string | null;
                    primary_contact_role?: string | null;
                    utility_bill_url?: string | null;
                    sales_rep_ref?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    role?: 'admin' | 'sales_rep' | 'business';
                    first_name?: string;
                    last_name?: string;
                    phone?: string | null;
                    status?: 'pending' | 'approved' | 'suspended';
                    bank_name?: string | null;
                    account_number?: string | null;
                    branch_code?: string | null;
                    reference_code?: string | null;
                    referral_link?: string | null;
                    cv_file_url?: string | null;
                    linkedin_url?: string | null;
                    contract_signed?: boolean;
                    contract_signed_at?: string | null;
                    id_number?: string | null;
                    home_address?: string | null;
                    business_name?: string | null;
                    registration_number?: string | null;
                    industry?: string | null;
                    employees?: string | null;
                    primary_contact_role?: string | null;
                    utility_bill_url?: string | null;
                    sales_rep_ref?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
        Functions: {
            get_admin_stats: {
                Returns: Json;
            };
            get_sales_rep_stats: {
                Args: { rep_id: string };
                Returns: Json;
            };
            get_client_stats: {
                Args: { client_uuid: string };
                Returns: Json;
            };
            update_lead_status: {
                Args: {
                    lead_id: string;
                    new_status: string;
                    note?: string;
                    updated_by?: string;
                };
                Returns: Json;
            };
            request_document: {
                Args: {
                    p_client_id: string;
                    p_type: string;
                    p_name: string;
                    p_description?: string;
                    p_requested_by?: string;
                };
                Returns: Json;
            };
            review_document: {
                Args: {
                    p_document_id: string;
                    p_action: string;
                    p_admin_notes?: string;
                };
                Returns: Json;
            };
            send_message_to_client: {
                Args: {
                    p_client_id: string;
                    p_content: string;
                    p_sender_id?: string;
                };
                Returns: Json;
            };
            send_message_to_admin: {
                Args: {
                    p_content: string;
                    p_client_notes?: string;
                };
                Returns: Json;
            };
            mark_messages_read: {
                Args: {
                    p_client_id: string;
                    p_message_ids?: string[];
                };
                Returns: Json;
            };
            get_unread_count: {
                Args: { p_client_id?: string };
                Returns: number;
            };
            search_clients: {
                Args: {
                    p_search_term?: string;
                    p_status?: string;
                    p_assigned_admin?: string;
                    p_limit?: number;
                    p_offset?: number;
                };
                Returns: Json;
            };
            search_leads: {
                Args: {
                    p_search_term?: string;
                    p_status?: string;
                    p_submitted_by?: string;
                    p_limit?: number;
                    p_offset?: number;
                };
                Returns: Json;
            };
            is_admin: {
                Args: { user_id: string };
                Returns: boolean;
            };
            is_sales_rep: {
                Args: { user_id: string };
                Returns: boolean;
            };
        };
    };
}
