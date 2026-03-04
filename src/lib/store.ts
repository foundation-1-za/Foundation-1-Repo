// ============================================
// FOUNDATION-1 — MOCK DATA STORE
// In production, replace with database calls
// ============================================

import { User, Lead, LeadStatus } from './types';

// Simulated users
const users: User[] = [
    {
        id: 'admin-001',
        email: 'admin@foundation-1.co.za',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        phone: '+27 11 000 0000',
        status: 'approved',
        createdAt: '2025-01-01T00:00:00Z',
    },
    {
        id: 'rep-001',
        email: 'demo@foundation-1.co.za',
        firstName: 'James',
        lastName: 'Molefe',
        role: 'sales_rep',
        phone: '+27 82 000 0001',
        status: 'approved',
        createdAt: '2025-06-15T08:00:00Z',
        bankName: 'FNB',
        accountNumber: '62000000001',
        branchCode: '250655',
        referenceCode: 'F1-JMOL-4821',
        referralLink: '/for-business/apply?ref=F1-JMOL-4821',
        contractSigned: true,
        contractSignedAt: '2025-06-16T10:00:00Z',
        idNumber: '9001011234081',
        homeAddress: '123 Main Street, Sandton, Johannesburg, 2196',
    },
    {
        id: 'rep-002',
        email: 'sarah@foundation-1.co.za',
        firstName: 'Sarah',
        lastName: 'Naidoo',
        role: 'sales_rep',
        phone: '+27 83 000 0002',
        status: 'approved',
        createdAt: '2025-07-01T08:00:00Z',
        bankName: 'Standard Bank',
        accountNumber: '01000000002',
        branchCode: '051001',
        referenceCode: 'F1-SNAI-7293',
        referralLink: '/for-business/apply?ref=F1-SNAI-7293',
        contractSigned: true,
        contractSignedAt: '2025-07-02T09:00:00Z',
    },
    {
        id: 'biz-001',
        email: 'business@foundation-1.co.za',
        firstName: 'John',
        lastName: 'Smith',
        role: 'business',
        phone: '0711230333',
        status: 'approved',
        createdAt: '2026-01-15T10:00:00Z',
        businessName: 'Demo Business (Pty) Ltd',
        registrationNumber: '2020/123456/07',
        industry: 'manufacturing_industrial',
        employees: '11-50',
        primaryContactRole: 'Director',
        utilityBillFileName: 'demo_bill_jan2026.pdf',
    },
];

// Simulated leads
const leads: Lead[] = [
    {
        id: 'lead-001',
        submittedBy: 'rep-001',
        submittedAt: '2025-11-10T09:30:00Z',
        businessName: 'Greenfield Manufacturing (Pty) Ltd',
        registrationNumber: '2019/123456/07',
        physicalAddress: '12 Industrial Road, Spartan, Kempton Park, 1619',
        contactName: 'Thabo Mkhize',
        contactRole: 'Operations Director',
        contactPhone: '+27 11 394 0000',
        contactEmail: 'thabo@greenfield.co.za',
        utilityBillFileName: 'greenfield_bill_oct2025.pdf',
        confirmedInterest: true,
        currentStatus: 'contract_signed',
        statusHistory: [
            { status: 'submitted', timestamp: '2025-11-10T09:30:00Z' },
            { status: 'pre_validated', timestamp: '2025-11-11T14:00:00Z' },
            { status: 'partner_review', timestamp: '2025-11-15T10:00:00Z' },
            { status: 'approved', timestamp: '2025-11-22T16:00:00Z' },
            { status: 'contract_signed', timestamp: '2025-12-05T11:00:00Z' },
        ],
        commissionAmount: 15000,
        commissionPaid: false,
    },
    {
        id: 'lead-002',
        submittedBy: 'rep-001',
        submittedAt: '2025-11-18T11:00:00Z',
        businessName: 'Cape Agri Supplies',
        registrationNumber: '2020/654321/07',
        physicalAddress: '45 Farm Lane, Paarl, 7646',
        contactName: 'Liesl van der Merwe',
        contactRole: 'Managing Director',
        contactPhone: '+27 21 860 0000',
        contactEmail: 'liesl@capeagri.co.za',
        utilityBillFileName: 'capeagri_bill_nov2025.pdf',
        confirmedInterest: true,
        currentStatus: 'partner_review',
        statusHistory: [
            { status: 'submitted', timestamp: '2025-11-18T11:00:00Z' },
            { status: 'pre_validated', timestamp: '2025-11-19T09:00:00Z' },
            { status: 'partner_review', timestamp: '2025-11-25T14:30:00Z' },
        ],
        commissionAmount: 12000,
        commissionPaid: false,
    },
    {
        id: 'lead-003',
        submittedBy: 'rep-001',
        submittedAt: '2025-12-02T08:45:00Z',
        businessName: 'Rapid Logistics CC',
        registrationNumber: '2018/789012/23',
        physicalAddress: '88 Freight Avenue, Isando, Ekurhuleni, 1600',
        contactName: 'David Osei',
        contactRole: 'Fleet Manager',
        contactPhone: '+27 11 974 0000',
        contactEmail: 'david@rapidlogistics.co.za',
        confirmedInterest: true,
        currentStatus: 'pre_validation_failed',
        statusHistory: [
            { status: 'submitted', timestamp: '2025-12-02T08:45:00Z' },
            { status: 'pre_validation_failed', timestamp: '2025-12-03T10:00:00Z', note: 'Monthly electricity spend below minimum threshold.' },
        ],
    },
    {
        id: 'lead-004',
        submittedBy: 'rep-001',
        submittedAt: '2025-12-10T14:20:00Z',
        businessName: 'Savanna Hotels Group',
        registrationNumber: '2017/345678/07',
        physicalAddress: '1 Heritage Blvd, Sandton, 2196',
        contactName: 'Naledi Dlamini',
        contactRole: 'CFO',
        contactPhone: '+27 11 783 0000',
        contactEmail: 'naledi@savannahotels.co.za',
        utilityBillFileName: 'savanna_bill_nov2025.pdf',
        confirmedInterest: true,
        currentStatus: 'approved',
        statusHistory: [
            { status: 'submitted', timestamp: '2025-12-10T14:20:00Z' },
            { status: 'pre_validated', timestamp: '2025-12-11T11:00:00Z' },
            { status: 'partner_review', timestamp: '2025-12-15T09:00:00Z' },
            { status: 'approved', timestamp: '2025-12-22T15:30:00Z' },
        ],
        commissionAmount: 18000,
        commissionPaid: false,
    },
    {
        id: 'lead-005',
        submittedBy: 'rep-001',
        submittedAt: '2026-01-05T10:00:00Z',
        businessName: 'Metro Auto Parts',
        registrationNumber: '2021/901234/07',
        physicalAddress: '23 Parts Street, Roodepoort, 1724',
        contactName: 'Pieter Botha',
        contactRole: 'Owner',
        contactPhone: '+27 11 764 0000',
        contactEmail: 'pieter@metroauto.co.za',
        confirmedInterest: true,
        currentStatus: 'submitted',
        statusHistory: [
            { status: 'submitted', timestamp: '2026-01-05T10:00:00Z' },
        ],
    },
    {
        id: 'lead-006',
        submittedBy: 'rep-001',
        submittedAt: '2026-01-12T16:00:00Z',
        businessName: 'Durban Fresh Foods (Pty) Ltd',
        registrationNumber: '2022/567890/07',
        physicalAddress: '67 Market Road, Durban, 4001',
        contactName: 'Priya Govender',
        contactRole: 'General Manager',
        contactPhone: '+27 31 305 0000',
        contactEmail: 'priya@durbanfresh.co.za',
        utilityBillFileName: 'durbanfresh_bill_dec2025.pdf',
        confirmedInterest: true,
        currentStatus: 'commission_earned',
        statusHistory: [
            { status: 'submitted', timestamp: '2025-09-01T10:00:00Z' },
            { status: 'pre_validated', timestamp: '2025-09-02T14:00:00Z' },
            { status: 'partner_review', timestamp: '2025-09-10T09:00:00Z' },
            { status: 'approved', timestamp: '2025-09-20T16:00:00Z' },
            { status: 'contract_signed', timestamp: '2025-10-05T11:00:00Z' },
            { status: 'commission_earned', timestamp: '2025-11-01T09:00:00Z' },
        ],
        commissionAmount: 20000,
        commissionPaid: true,
        paidAt: '2025-11-15T09:00:00Z',
    },
    {
        id: 'lead-007',
        submittedBy: 'rep-002',
        submittedAt: '2025-12-01T09:00:00Z',
        businessName: 'Highveld Mining Supplies',
        registrationNumber: '2016/111222/07',
        physicalAddress: '5 Mining Drive, Witbank, 1035',
        contactName: 'Johannes Pretorius',
        contactRole: 'Procurement Manager',
        contactPhone: '+27 13 656 0000',
        contactEmail: 'johannes@highveld.co.za',
        utilityBillFileName: 'highveld_bill_nov2025.pdf',
        confirmedInterest: true,
        currentStatus: 'rejected',
        statusHistory: [
            { status: 'submitted', timestamp: '2025-12-01T09:00:00Z' },
            { status: 'pre_validated', timestamp: '2025-12-02T11:00:00Z' },
            { status: 'partner_review', timestamp: '2025-12-08T10:00:00Z' },
            { status: 'rejected', timestamp: '2025-12-15T14:00:00Z', note: 'Roof structure unsuitable for solar installation.' },
        ],
    },
    {
        id: 'lead-biz-001',
        submittedBy: 'biz-001',
        submittedAt: '2026-01-15T10:00:00Z',
        businessName: 'Demo Business (Pty) Ltd',
        registrationNumber: '2020/123456/07',
        physicalAddress: '123 Business Street, Johannesburg, 2000',
        contactName: 'John Smith',
        contactRole: 'Director',
        contactPhone: '0711230333',
        contactEmail: 'business@foundation-1.co.za',
        utilityBillFileName: 'demo_bill_jan2026.pdf',
        confirmedInterest: true,
        currentStatus: 'partner_review',
        statusHistory: [
            { status: 'submitted', timestamp: '2026-01-15T10:00:00Z' },
            { status: 'pre_validated', timestamp: '2026-01-16T09:00:00Z' },
            { status: 'partner_review', timestamp: '2026-01-20T14:00:00Z' },
        ],
        onboardingStep: 'waiting_proposal',
        onboardingStatus: 'pending',
    },
];

// Password store (in production, use proper hashing)
const passwords: Record<string, string> = {
    'admin@foundation-1.co.za': 'admin123',
    'demo@foundation-1.co.za': 'demo123',
    'sarah@foundation-1.co.za': 'sarah123',
    'business@foundation-1.co.za': 'business123',
};

// ============================================
// CLIENT PANEL DATA
// ============================================

import { Client, ClientDocument, ClientMessage, DocumentStatus, DocumentType } from './types';

const clients: Client[] = [
    {
        id: 'client-001',
        userId: 'biz-001',
        businessName: 'Demo Business (Pty) Ltd',
        registrationNumber: '2020/123456/07',
        industry: 'manufacturing_industrial',
        contactName: 'John Smith',
        contactEmail: 'business@foundation-1.co.za',
        contactPhone: '0711230333',
        physicalAddress: '123 Business Street, Johannesburg, 2000',
        status: 'active',
        createdAt: '2026-01-15T10:00:00Z',
        updatedAt: '2026-01-15T10:00:00Z',
        notes: 'Demo client for testing',
        tags: ['demo', 'manufacturing']
    },
    {
        id: 'client-002',
        userId: 'biz-002',
        businessName: 'Greenfield Manufacturing (Pty) Ltd',
        registrationNumber: '2019/123456/07',
        industry: 'manufacturing_industrial',
        contactName: 'Thabo Mkhize',
        contactEmail: 'thabo@greenfield.co.za',
        contactPhone: '+27 11 394 0000',
        physicalAddress: '12 Industrial Road, Spartan, Kempton Park, 1619',
        status: 'active',
        createdAt: '2025-11-10T09:30:00Z',
        updatedAt: '2025-12-05T11:00:00Z',
        notes: 'Contract signed, waiting for KYC',
        tags: ['solar-ready', 'high-value']
    },
    {
        id: 'client-003',
        userId: 'biz-003',
        businessName: 'Cape Agri Supplies',
        registrationNumber: '2020/654321/07',
        industry: 'agriculture',
        contactName: 'Liesl van der Merwe',
        contactEmail: 'liesl@capeagri.co.za',
        contactPhone: '+27 21 860 0000',
        physicalAddress: '45 Farm Lane, Paarl, 7646',
        status: 'active',
        createdAt: '2025-11-18T11:00:00Z',
        updatedAt: '2025-11-25T14:30:00Z',
        tags: ['agriculture', ' Western Cape']
    }
];

const clientDocuments: ClientDocument[] = [
    {
        id: 'doc-001',
        clientId: 'client-001',
        type: 'id_document',
        name: 'Director ID Document',
        description: 'Please upload a clear copy of your ID document or passport',
        status: 'submitted',
        fileName: 'john_smith_id.pdf',
        fileSize: 2048000,
        uploadedAt: '2026-01-16T14:30:00Z',
        requestedAt: '2026-01-15T10:00:00Z',
        requestedBy: 'admin-001',
        clientNotes: 'Here is my ID document'
    },
    {
        id: 'doc-002',
        clientId: 'client-001',
        type: 'company_registration',
        name: 'Company Registration Certificate',
        description: 'CIPC company registration certificate',
        status: 'pending',
        requestedAt: '2026-01-15T10:00:00Z',
        requestedBy: 'admin-001'
    },
    {
        id: 'doc-003',
        clientId: 'client-001',
        type: 'financial_statement',
        name: 'Latest Financial Statements',
        description: 'Audited financial statements for the last 2 years',
        status: 'pending',
        requestedAt: '2026-01-20T09:00:00Z',
        requestedBy: 'admin-001'
    },
    {
        id: 'doc-004',
        clientId: 'client-002',
        type: 'contract',
        name: 'Signed Service Contract',
        description: 'Please sign and upload the service contract',
        status: 'submitted',
        fileName: 'greenfield_contract_signed.pdf',
        fileSize: 4096000,
        uploadedAt: '2025-12-05T11:00:00Z',
        requestedAt: '2025-11-20T10:00:00Z',
        requestedBy: 'admin-001',
        adminNotes: 'Contract received and under review'
    }
];

const clientMessages: ClientMessage[] = [
    {
        id: 'msg-001',
        clientId: 'client-001',
        senderType: 'admin',
        senderId: 'admin-001',
        senderName: 'Admin User',
        content: 'Welcome to our client portal! Please upload the required documents to proceed with your application.',
        status: 'delivered',
        createdAt: '2026-01-15T10:00:00Z',
        isRead: true,
        readAt: '2026-01-15T11:30:00Z'
    },
    {
        id: 'msg-002',
        clientId: 'client-001',
        senderType: 'client',
        senderId: 'biz-001',
        senderName: 'John Smith',
        content: 'Thank you! I have uploaded my ID document. I will get the other documents ready soon.',
        status: 'delivered',
        createdAt: '2026-01-16T14:35:00Z',
        isRead: true,
        readAt: '2026-01-16T15:00:00Z'
    },
    {
        id: 'msg-003',
        clientId: 'client-001',
        senderType: 'admin',
        senderId: 'admin-001',
        senderName: 'Admin User',
        content: 'Great! The ID looks good. Please also upload your company registration certificate when you have a chance.',
        status: 'delivered',
        createdAt: '2026-01-16T15:30:00Z',
        isRead: false
    },
    {
        id: 'msg-004',
        clientId: 'client-002',
        senderType: 'admin',
        senderId: 'admin-001',
        senderName: 'Admin User',
        content: 'Your contract has been received and approved. We will proceed with the installation scheduling.',
        status: 'delivered',
        createdAt: '2025-12-06T09:00:00Z',
        isRead: true,
        readAt: '2025-12-06T10:30:00Z'
    }
];

// --- Client Data Access Functions ---

export function getAllClients(): Client[] {
    return [...clients];
}

export function getClientById(id: string): Client | null {
    return clients.find((c) => c.id === id) || null;
}

export function getClientByUserId(userId: string): Client | null {
    return clients.find((c) => c.userId === userId) || null;
}

export function createClient(data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Client {
    const newClient: Client = {
        ...data,
        id: `client-${String(clients.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    clients.push(newClient);
    return newClient;
}

export function updateClient(id: string, updates: Partial<Client>): Client | null {
    const idx = clients.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    clients[idx] = { ...clients[idx], ...updates, updatedAt: new Date().toISOString() };
    return clients[idx];
}

export function deleteClient(id: string): boolean {
    const idx = clients.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    clients.splice(idx, 1);
    // Also delete related documents and messages
    const docsToDelete = clientDocuments.filter(d => d.clientId === id);
    docsToDelete.forEach(d => deleteDocument(d.id));
    const msgsToDelete = clientMessages.filter(m => m.clientId === id);
    msgsToDelete.forEach(m => deleteMessage(m.id));
    return true;
}

// --- Document Functions ---

export function getAllDocuments(): ClientDocument[] {
    return [...clientDocuments];
}

export function getDocumentsForClient(clientId: string): ClientDocument[] {
    return clientDocuments.filter((d) => d.clientId === clientId);
}

export function getDocumentById(id: string): ClientDocument | null {
    return clientDocuments.find((d) => d.id === id) || null;
}

export function createDocument(data: Omit<ClientDocument, 'id' | 'requestedAt'>): ClientDocument {
    const newDoc: ClientDocument = {
        ...data,
        id: `doc-${String(clientDocuments.length + 1).padStart(3, '0')}`,
        requestedAt: new Date().toISOString(),
    };
    clientDocuments.push(newDoc);
    return newDoc;
}

export function updateDocument(id: string, updates: Partial<ClientDocument>): ClientDocument | null {
    const idx = clientDocuments.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    clientDocuments[idx] = { ...clientDocuments[idx], ...updates };
    return clientDocuments[idx];
}

export function deleteDocument(id: string): boolean {
    const idx = clientDocuments.findIndex((d) => d.id === id);
    if (idx === -1) return false;
    clientDocuments.splice(idx, 1);
    return true;
}

export function approveDocument(id: string, adminNotes?: string): ClientDocument | null {
    return updateDocument(id, { status: 'approved', adminNotes });
}

export function rejectDocument(id: string, adminNotes?: string): ClientDocument | null {
    return updateDocument(id, { status: 'rejected', adminNotes });
}

// --- Message Functions ---

export function getAllMessages(): ClientMessage[] {
    return [...clientMessages];
}

export function getMessagesForClient(clientId: string): ClientMessage[] {
    return clientMessages.filter((m) => m.clientId === clientId).sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
}

export function getMessageById(id: string): ClientMessage | null {
    return clientMessages.find((m) => m.id === id) || null;
}

export function createMessage(data: Omit<ClientMessage, 'id' | 'createdAt' | 'status'>): ClientMessage {
    const newMessage: ClientMessage = {
        ...data,
        id: `msg-${String(clientMessages.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        status: 'sent',
    };
    clientMessages.push(newMessage);
    return newMessage;
}

export function markMessageAsRead(id: string): ClientMessage | null {
    const idx = clientMessages.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    clientMessages[idx] = { 
        ...clientMessages[idx], 
        isRead: true, 
        readAt: new Date().toISOString(),
        status: 'read'
    };
    return clientMessages[idx];
}

export function deleteMessage(id: string): boolean {
    const idx = clientMessages.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    clientMessages.splice(idx, 1);
    return true;
}

export function getUnreadMessageCount(clientId?: string): number {
    if (clientId) {
        return clientMessages.filter((m) => m.clientId === clientId && !m.isRead && m.senderType === 'client').length;
    }
    return clientMessages.filter((m) => !m.isRead && m.senderType === 'client').length;
}

// --- Data Access Functions ---

export function authenticateUser(email: string, password: string): User | null {
    if (passwords[email] === password) {
        return users.find((u) => u.email === email) || null;
    }
    return null;
}

export function registerUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
}): User | { error: string } {
    if (users.find((u) => u.email === data.email)) {
        return { error: 'Email already registered.' };
    }
    // ... existing registerUser logic ...
    const newUser: User = {
        id: `rep-${String(users.length + 1).padStart(3, '0')}`,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'sales_rep',
        phone: data.phone,
        status: 'pending',
        createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    passwords[data.email] = data.password;
    return newUser;
}

export function registerSalesRep(data: {
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
    idNumber: string;
    homeAddress: string;
    cvFileName?: string;
    linkedinUrl?: string;
}): User | { error: string } {
    if (users.find((u) => u.email === data.email)) {
        return { error: 'Email already registered.' };
    }
    // Generate a unique reference code: F1-XXXX-NNNN
    const prefix = (data.firstName[0] + data.lastName.slice(0, 3)).toUpperCase();
    const num = String(Math.floor(1000 + Math.random() * 9000));
    const referenceCode = `F1-${prefix}-${num}`;
    const referralLink = `/for-business/apply?ref=${referenceCode}`;

    const newUser: User = {
        id: `rep-${String(users.length + 1).padStart(3, '0')}`,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'sales_rep',
        phone: data.phone,
        status: 'pending',
        createdAt: new Date().toISOString(),
        cvFileName: data.cvFileName,
        linkedinUrl: data.linkedinUrl,
        referenceCode,
        referralLink,
        contractSigned: false,
        idNumber: data.idNumber,
        homeAddress: data.homeAddress,
    };
    users.push(newUser);
    passwords[data.email] = data.password || 'welcome123';
    return newUser;
}

export function registerBusinessUser(data: {
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    phone: string;
    businessName: string;
    registrationNumber: string;
    physicalAddress: string;
    industry: string;
    employees: string;
    primaryContactRole: string;
    utilityBillFileName?: string;
    salesRepRef?: string;
}): User | { error: string } {
    if (users.find((u) => u.email === data.email)) {
        return { error: 'Email already registered.' };
    }
    const newUser: User = {
        id: `biz-${String(users.length + 1).padStart(3, '0')}`,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'business',
        phone: data.phone,
        status: 'pending',
        createdAt: new Date().toISOString(),
        businessName: data.businessName,
        registrationNumber: data.registrationNumber,
        industry: data.industry,
        employees: data.employees,
        primaryContactRole: data.primaryContactRole,
        utilityBillFileName: data.utilityBillFileName,
        salesRepRef: data.salesRepRef || undefined,
    };
    users.push(newUser);
    passwords[data.email] = data.password || 'business123';

    // Determine the submitter: if a rep ref is provided, attribute lead to that rep
    let submitter = newUser.id;
    if (data.salesRepRef) {
        const rep = users.find(u => u.referenceCode === data.salesRepRef);
        if (rep) submitter = rep.id;
    }

    const newLead: Lead = {
        id: `lead-${String(leads.length + 1).padStart(3, '0')}`,
        submittedBy: submitter,
        submittedAt: new Date().toISOString(),
        businessName: data.businessName,
        registrationNumber: data.registrationNumber,
        physicalAddress: data.physicalAddress,
        contactName: `${data.firstName} ${data.lastName}`,
        contactRole: data.primaryContactRole,
        contactPhone: data.phone,
        contactEmail: data.email,
        utilityBillFileName: data.utilityBillFileName,
        confirmedInterest: true,
        currentStatus: 'submitted',
        statusHistory: [
            { status: 'submitted', timestamp: new Date().toISOString() },
        ],
    };
    leads.push(newLead);

    return newUser;
}

export function getUserById(id: string): User | null {
    return users.find((u) => u.id === id) || null;
}

export function getLeadsForUser(userId: string): Lead[] {
    return leads.filter((l) => l.submittedBy === userId);
}

export function getAllLeads(): Lead[] {
    return [...leads];
}

export function getLeadById(id: string): Lead | null {
    return leads.find((l) => l.id === id) || null;
}

export function submitLead(data: Omit<Lead, 'id' | 'currentStatus' | 'statusHistory' | 'submittedAt'>): Lead {
    const newLead: Lead = {
        ...data,
        id: `lead-${String(leads.length + 1).padStart(3, '0')}`,
        submittedAt: new Date().toISOString(),
        currentStatus: 'submitted',
        statusHistory: [
            { status: 'submitted', timestamp: new Date().toISOString() },
        ],
    };
    leads.push(newLead);
    return newLead;
}

export function updateLeadStatus(leadId: string, newStatus: LeadStatus, note?: string): Lead | null {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return null;
    lead.currentStatus = newStatus;
    lead.statusHistory.push({
        status: newStatus,
        timestamp: new Date().toISOString(),
        note,
    });
    return lead;
}

export function getDashboardMetrics(userId: string) {
    const userLeads = leads.filter((l) => l.submittedBy === userId);
    return {
        totalLeads: userLeads.length,
        leadsApproved: userLeads.filter((l) => ['approved', 'contract_signed', 'commission_earned'].includes(l.currentStatus)).length,
        leadsRejected: userLeads.filter((l) => ['rejected', 'pre_validation_failed'].includes(l.currentStatus)).length,
        contractsSigned: userLeads.filter((l) => ['contract_signed', 'commission_earned'].includes(l.currentStatus)).length,
        commissionEarned: userLeads.filter((l) => l.commissionPaid).reduce((sum, l) => sum + (l.commissionAmount || 0), 0),
        commissionPending: userLeads.filter((l) => l.commissionAmount && !l.commissionPaid).reduce((sum, l) => sum + (l.commissionAmount || 0), 0),
    };
}

export function getAllUsers(): User[] {
    return [...users];
}

export function updateUser(id: string, updates: Partial<User>): User | null {
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates };
    return users[idx];
}
