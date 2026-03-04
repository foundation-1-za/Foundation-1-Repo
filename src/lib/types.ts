// ============================================
// FOUNDATION-1 — TYPE DEFINITIONS
// ============================================

export type UserRole = 'sales_rep' | 'admin' | 'business';

// Legacy Lead Status (for backward compatibility)
export type LeadStatus =
    | 'submitted'
    | 'pre_validation_failed'
    | 'pre_validated'
    | 'partner_review'
    | 'rejected'
    | 'approved'
    | 'contract_signed'
    | 'commission_earned';

// New Onboarding Step System
export type OnboardingStep =
    | 'registration'
    | 'utility_bill'
    | 'waiting_proposal'
    | 'proposal_received'
    | 'proposal_signed'
    | 'contract_sent'
    | 'contract_signed'
    | 'kyc_documents'
    | 'final_decision';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phone: string;
    status: 'pending' | 'approved' | 'suspended';
    createdAt: string;
    // Sales Rep specific
    bankName?: string;
    accountNumber?: string;
    branchCode?: string;
    cvFileName?: string;
    linkedinUrl?: string;
    referenceCode?: string;
    referralLink?: string;
    contractSigned?: boolean;
    contractSignedAt?: string;
    // Contract fields
    idNumber?: string;
    homeAddress?: string;
    // Business specific
    businessName?: string;
    registrationNumber?: string;
    industry?: string;
    employees?: string;
    primaryContactRole?: string;
    utilityBillFileName?: string;
    salesRepRef?: string;
}

export interface LeadStatusEntry {
    status: LeadStatus;
    timestamp: string;
    note?: string;
}

export interface Lead {
    id: string;
    submittedBy: string;
    submittedAt: string;
    businessName: string;
    registrationNumber: string;
    physicalAddress: string;
    contactName: string;
    contactRole: string;
    contactPhone: string;
    contactEmail: string;
    industry?: string;
    utilityBillFileName?: string;
    confirmedInterest: boolean;
    currentStatus: LeadStatus;
    statusHistory: LeadStatusEntry[];
    commissionAmount?: number;
    commissionPaid?: boolean;
    paidAt?: string;
    // New onboarding step tracking
    onboardingStep?: OnboardingStep;
    onboardingStatus?: 'pending' | 'accepted' | 'rejected';
    // Sales rep who referred this lead
    salesRepId?: string;
    salesRepRef?: string;
}

export interface DashboardMetrics {
    totalLeads: number;
    leadsApproved: number;
    leadsRejected: number;
    contractsSigned: number;
    commissionEarned: number;
    commissionPending: number;
}

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
    submitted: 'Submitted',
    pre_validation_failed: 'Pre-Validation Failed',
    pre_validated: 'Pre-Validated',
    partner_review: 'Partner Review',
    rejected: 'Rejected',
    approved: 'Approved',
    contract_signed: 'Contract Signed',
    commission_earned: 'Commission Earned',
};

// Onboarding step labels for display
export const ONBOARDING_STEP_LABELS: Record<OnboardingStep, string> = {
    registration: 'Registration Complete',
    utility_bill: 'Utility Bill Upload',
    waiting_proposal: 'Waiting for Proposal',
    proposal_received: 'Proposal Received',
    proposal_signed: 'Proposal Signed',
    contract_sent: 'Contract Sent',
    contract_signed: 'Contract Signed',
    kyc_documents: 'KYC Documents',
    final_decision: 'Final Decision',
};

export const LEAD_STATUS_BADGE: Record<LeadStatus, string> = {
    submitted: 'info',
    pre_validation_failed: 'error',
    pre_validated: 'success',
    partner_review: 'warning',
    rejected: 'error',
    approved: 'success',
    contract_signed: 'success',
    commission_earned: 'success',
};

// Support Request types for business help/assistance
export type SupportRequestStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type SupportRequestCategory = 
    | 'technical_issue' 
    | 'billing_question' 
    | 'product_info' 
    | 'installation_help' 
    | 'maintenance' 
    | 'general';

export interface SupportRequest {
    id: string;
    userId: string;
    businessName: string;
    category: SupportRequestCategory;
    subject: string;
    description: string;
    status: SupportRequestStatus;
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string;
    adminNotes?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export const SUPPORT_CATEGORY_LABELS: Record<SupportRequestCategory, string> = {
    technical_issue: 'Technical Issue',
    billing_question: 'Billing Question',
    product_info: 'Product Information',
    installation_help: 'Installation Help',
    maintenance: 'Maintenance & Support',
    general: 'General Inquiry'
};

// ============================================
// CLIENT PANEL TYPES
// ============================================

export type DocumentStatus = 'pending' | 'submitted' | 'approved' | 'rejected';
export type DocumentType = 'id_document' | 'proof_of_address' | 'financial_statement' | 'company_registration' | 'tax_certificate' | 'contract' | 'other';
export type MessageStatus = 'sent' | 'delivered' | 'read';
export type SenderType = 'admin' | 'client';

export interface ClientDocument {
    id: string;
    clientId: string;
    type: DocumentType;
    name: string;
    description: string;
    status: DocumentStatus;
    fileName?: string;
    fileUrl?: string;
    fileSize?: number;
    uploadedAt?: string;
    requestedAt: string;
    requestedBy: string;
    adminNotes?: string;
    clientNotes?: string;
}

export interface ClientMessage {
    id: string;
    clientId: string;
    senderType: SenderType;
    senderId: string;
    senderName: string;
    content: string;
    status: MessageStatus;
    createdAt: string;
    attachments?: string[];
    isRead: boolean;
    readAt?: string;
}

export interface Client {
    id: string;
    userId: string;
    businessName: string;
    registrationNumber: string;
    industry: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    physicalAddress: string;
    status: 'active' | 'inactive' | 'suspended';
    createdAt: string;
    updatedAt: string;
    assignedAdminId?: string;
    notes?: string;
    tags?: string[];
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
    id_document: 'ID Document',
    proof_of_address: 'Proof of Address',
    financial_statement: 'Financial Statement',
    company_registration: 'Company Registration',
    tax_certificate: 'Tax Certificate',
    contract: 'Contract',
    other: 'Other'
};

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
    pending: 'Pending',
    submitted: 'Submitted',
    approved: 'Approved',
    rejected: 'Rejected'
};
