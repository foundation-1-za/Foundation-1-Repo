'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { useRealtimeDocuments } from '@/hooks/useRealtimeDocuments';
import { RealtimeStatus, TypingIndicator, OnlineIndicator } from '@/components/RealtimeNotification';
import type { Database } from '@/lib/supabase/database.types';
import { DocumentStatus, DocumentType } from '@/lib/types';
import { 
    Users, 
    Search, 
    Filter, 
    FileText, 
    MessageSquare, 
    Download, 
    CheckCircle, 
    XCircle, 
    Clock,
    Eye,
    Send,
    Plus,
    Trash2,
    X,
    ChevronLeft,
    Building2,
    Mail,
    Tag,
    AlertCircle,
    Check
} from 'lucide-react';
import styles from './page.module.css';

type Tables = Database['public']['Tables'];
type ClientRow = Tables['clients']['Row'];
type ClientDocumentRow = Tables['client_documents']['Row'];
type ClientMessageRow = Tables['client_messages']['Row'];

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
    { value: 'id_document', label: 'ID Document' },
    { value: 'proof_of_address', label: 'Proof of Address' },
    { value: 'financial_statement', label: 'Financial Statement' },
    { value: 'company_registration', label: 'Company Registration' },
    { value: 'tax_certificate', label: 'Tax Certificate' },
    { value: 'contract', label: 'Contract' },
    { value: 'other', label: 'Other' },
];

interface ClientWithUnread extends ClientRow {
    unreadMessages?: number;
}

export default function AdminClientsPage() {
    const supabase = useRef(createClient()).current;
    const [clients, setClients] = useState<ClientWithUnread[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedClient, setSelectedClient] = useState<ClientWithUnread | null>(null);
    const [activeTab, setActiveTab] = useState<'details' | 'documents' | 'messages'>('details');
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Document request modal
    const [showDocModal, setShowDocModal] = useState(false);
    const [newDocType, setNewDocType] = useState<DocumentType>('id_document');
    const [newDocName, setNewDocName] = useState('');
    const [newDocDescription, setNewDocDescription] = useState('');

    // Realtime hooks (only active when client is selected)
    const { 
        messages, 
        isLoading: messagesLoading, 
        typingUsers,
        sendMessage: sendMessageRealtime,
        markAsRead,
    } = useRealtimeMessages({ 
        clientId: selectedClient?.id || '',
    });

    const {
        documents,
        isLoading: documentsLoading,
        pendingCount,
        submittedCount,
        approveDocument,
        rejectDocument,
        requestDocument,
        deleteDocument,
    } = useRealtimeDocuments({
        clientId: selectedClient?.id || '',
    });

    // Message input
    const [newMessage, setNewMessage] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);

    // Fetch clients
    const fetchClients = useCallback(async () => {
        setLoading(true);
        try {
            const { data: clientsData, error } = await supabase
                .from('clients')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Failed to fetch clients:', error);
                return;
            }

            // Get unread counts for each client
            const clientsWithCounts: ClientWithUnread[] = await Promise.all(
                (clientsData || []).map(async (client: ClientRow) => {
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

            setClients(clientsWithCounts);
        } catch (err) {
            console.error('Failed to fetch clients:', err);
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    // Handle client selection
    const handleSelectClient = (client: ClientWithUnread) => {
        setSelectedClient(client);
        setIsDetailOpen(true);
        setActiveTab('details');
    };

    // Close detail panel
    const handleCloseDetail = () => {
        setIsDetailOpen(false);
        setSelectedClient(null);
    };

    // Create document request
    const handleCreateDocumentRequest = async () => {
        if (!newDocName.trim()) return;

        try {
            await requestDocument(newDocType, newDocName, newDocDescription);
            setShowDocModal(false);
            setNewDocName('');
            setNewDocDescription('');
        } catch (err) {
            alert('Failed to create document request');
        }
    };

    // Handle document approval/rejection
    const handleDocumentStatus = async (documentId: string, action: 'approve' | 'reject', adminNotes?: string) => {
        try {
            if (action === 'approve') {
                await approveDocument(documentId, adminNotes);
            } else {
                await rejectDocument(documentId, adminNotes);
            }
        } catch (err) {
            alert('Failed to update document status');
        }
    };

    // Handle document deletion
    const handleDeleteDocument = async (documentId: string) => {
        if (!confirm('Are you sure you want to delete this document request?')) return;

        try {
            await deleteDocument(documentId);
        } catch (err) {
            alert('Failed to delete document');
        }
    };

    // Handle sending message
    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        setSendingMessage(true);
        try {
            await sendMessageRealtime(newMessage);
            setNewMessage('');
        } catch (err) {
            alert('Failed to send message');
        } finally {
            setSendingMessage(false);
        }
    };

    // Handle download
    const handleDownload = async (fileUrl?: string | null, fileName?: string | null) => {
        if (!fileUrl) return;
        
        try {
            const { data, error } = await supabase.storage
                .from('client-documents')
                .createSignedUrl(fileUrl, 3600);

            if (error) {
                alert('Failed to get download URL: ' + error.message);
                return;
            }

            const response = await fetch(data.signedUrl);
            const blob = await response.blob();
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName || 'download';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch {
            alert('Failed to download file');
        }
    };

    // Filter clients
    const filteredClients = clients.filter(client => {
        const matchesSearch = 
            client.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.contact_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.registration_number.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Get status badge class
    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'active': return styles.badge_active;
            case 'inactive': return styles.badge_inactive;
            case 'suspended': return styles.badge_suspended;
            default: return styles.badge_pending;
        }
    };

    // Get document status badge
    const getDocStatusBadge = (status: DocumentStatus) => {
        switch (status) {
            case 'approved': return <span className={`${styles.docBadge} ${styles.docBadge_approved}`}><CheckCircle size={12} /> Approved</span>;
            case 'submitted': return <span className={`${styles.docBadge} ${styles.docBadge_submitted}`}><Clock size={12} /> Submitted</span>;
            case 'rejected': return <span className={`${styles.docBadge} ${styles.docBadge_rejected}`}><XCircle size={12} /> Rejected</span>;
            default: return <span className={`${styles.docBadge} ${styles.docBadge_pending}`}><Clock size={12} /> Pending</span>;
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading clients...</div>;
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Client Management</h1>
                    <p className={styles.subtitle}>Manage clients, documentation, and communications</p>
                </div>
                <RealtimeStatus />
            </header>

            {/* Stats Overview */}
            <div className={styles.overviewGrid}>
                <div className={styles.overviewCard}>
                    <div className={styles.overviewIcon} style={{ background: 'var(--color-info-bg)', color: 'var(--color-info)' }}>
                        <Users size={24} />
                    </div>
                    <div className={styles.overviewContent}>
                        <span className={styles.overviewValue}>{clients.length}</span>
                        <span className={styles.overviewLabel}>Total Clients</span>
                    </div>
                </div>
                <div className={styles.overviewCard}>
                    <div className={styles.overviewIcon} style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                        <CheckCircle size={24} />
                    </div>
                    <div className={styles.overviewContent}>
                        <span className={styles.overviewValue}>{clients.filter(c => c.status === 'active').length}</span>
                        <span className={styles.overviewLabel}>Active</span>
                    </div>
                </div>
                <div className={styles.overviewCard}>
                    <div className={styles.overviewIcon} style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
                        <FileText size={24} />
                    </div>
                    <div className={styles.overviewContent}>
                        <span className={styles.overviewValue}>
                            {clients.reduce((sum, c) => sum + (c.unreadMessages || 0), 0)}
                        </span>
                        <span className={styles.overviewLabel}>Unread Messages</span>
                    </div>
                </div>
                <div className={styles.overviewCard}>
                    <div className={styles.overviewIcon} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                        <Clock size={24} />
                    </div>
                    <div className={styles.overviewContent}>
                        <span className={styles.overviewValue}>
                            {clients.length}
                        </span>
                        <span className={styles.overviewLabel}>Total Clients</span>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className={styles.controls}>
                <div className={styles.searchBox}>
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by business name, contact, email, or registration number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className={styles.filterBox}>
                    <Filter size={18} />
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </div>
            </div>

            {/* Clients Table */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Business</th>
                            <th>Contact</th>
                            <th>Industry</th>
                            <th>Status</th>
                            <th>Messages</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClients.map(client => (
                            <tr key={client.id} className={styles.clientRow}>
                                <td>
                                    <div className={styles.businessCell}>
                                        <Building2 size={16} className={styles.businessIcon} />
                                        <div>
                                            <span className={styles.businessName}>{client.business_name}</span>
                                            <span className={styles.regNumber}>{client.registration_number}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.contactCell}>
                                        <span className={styles.contactName}>{client.contact_name}</span>
                                        <span className={styles.contactEmail}>{client.contact_email}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={styles.industry}>{client.industry}</span>
                                </td>
                                <td>
                                    <span className={`${styles.badge} ${getStatusBadgeClass(client.status)}`}>
                                        {client.status}
                                    </span>
                                </td>
                                <td>
                                    {client.unreadMessages ? (
                                        <span className={styles.unreadBadge}>
                                            <MessageSquare size={12} />
                                            {client.unreadMessages} new
                                        </span>
                                    ) : (
                                        <span className={styles.noMessages}>-</span>
                                    )}
                                </td>
                                <td>
                                    <button
                                        className={styles.viewBtn}
                                        onClick={() => handleSelectClient(client)}
                                    >
                                        <Eye size={16} />
                                        Manage
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredClients.length === 0 && (
                    <div className={styles.emptyState}>
                        <Users size={48} />
                        <p>No clients found</p>
                    </div>
                )}
            </div>

            {/* Client Detail Panel */}
            {isDetailOpen && selectedClient && (
                <div className={styles.detailOverlay}>
                    <div className={styles.detailPanel}>
                        {/* Detail Header */}
                        <div className={styles.detailHeader}>
                            <div className={styles.detailHeaderInfo}>
                                <button className={styles.backBtn} onClick={handleCloseDetail}>
                                    <ChevronLeft size={20} />
                                </button>
                                <div>
                                    <h2>{selectedClient.business_name}</h2>
                                    <p className={styles.detailMeta}>
                                        {selectedClient.registration_number} • {selectedClient.industry}
                                    </p>
                                </div>
                            </div>
                            <button className={styles.closeBtn} onClick={handleCloseDetail}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Detail Tabs */}
                        <div className={styles.detailTabs}>
                            <button 
                                className={`${styles.detailTab} ${activeTab === 'details' ? styles.active : ''}`}
                                onClick={() => setActiveTab('details')}
                            >
                                <Building2 size={16} />
                                Details
                            </button>
                            <button 
                                className={`${styles.detailTab} ${activeTab === 'documents' ? styles.active : ''}`}
                                onClick={() => setActiveTab('documents')}
                            >
                                <FileText size={16} />
                                Documents
                                {documents.filter(d => d.status === 'submitted').length > 0 && (
                                    <span className={styles.tabBadge}>
                                        {documents.filter(d => d.status === 'submitted').length}
                                    </span>
                                )}
                            </button>
                            <button 
                                className={`${styles.detailTab} ${activeTab === 'messages' ? styles.active : ''}`}
                                onClick={() => setActiveTab('messages')}
                            >
                                <MessageSquare size={16} />
                                Messages
                                {messages.filter(m => !m.is_read && m.sender_type === 'client').length > 0 && (
                                    <span className={styles.tabBadge}>
                                        {messages.filter(m => !m.is_read && m.sender_type === 'client').length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className={styles.detailContent}>
                            {/* Details Tab */}
                            {activeTab === 'details' && (
                                <div className={styles.detailsTab}>
                                    <div className={styles.infoSection}>
                                        <h3><Building2 size={16} /> Business Information</h3>
                                        <div className={styles.infoGrid}>
                                            <div className={styles.infoItem}>
                                                <span className={styles.infoLabel}>Business Name</span>
                                                <span className={styles.infoValue}>{selectedClient.business_name}</span>
                                            </div>
                                            <div className={styles.infoItem}>
                                                <span className={styles.infoLabel}>Registration Number</span>
                                                <span className={styles.infoValue}>{selectedClient.registration_number}</span>
                                            </div>
                                            <div className={styles.infoItem}>
                                                <span className={styles.infoLabel}>Industry</span>
                                                <span className={styles.infoValue}>{selectedClient.industry}</span>
                                            </div>
                                            <div className={styles.infoItem}>
                                                <span className={styles.infoLabel}>Status</span>
                                                <span className={styles.infoValue}>
                                                    <span className={`${styles.badge} ${getStatusBadgeClass(selectedClient.status)}`}>
                                                        {selectedClient.status}
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.infoSection}>
                                        <h3><Mail size={16} /> Contact Information</h3>
                                        <div className={styles.infoGrid}>
                                            <div className={styles.infoItem}>
                                                <span className={styles.infoLabel}>Contact Person</span>
                                                <span className={styles.infoValue}>{selectedClient.contact_name}</span>
                                            </div>
                                            <div className={styles.infoItem}>
                                                <span className={styles.infoLabel}>Email</span>
                                                <span className={styles.infoValue}>{selectedClient.contact_email}</span>
                                            </div>
                                            <div className={styles.infoItem}>
                                                <span className={styles.infoLabel}>Phone</span>
                                                <span className={styles.infoValue}>{selectedClient.contact_phone}</span>
                                            </div>
                                            <div className={styles.infoItem}>
                                                <span className={styles.infoLabel}>Address</span>
                                                <span className={styles.infoValue}>{selectedClient.physical_address}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedClient.notes && (
                                        <div className={styles.infoSection}>
                                            <h3><AlertCircle size={16} /> Notes</h3>
                                            <p className={styles.notesText}>{selectedClient.notes}</p>
                                        </div>
                                    )}

                                    {selectedClient.tags && selectedClient.tags.length > 0 && (
                                        <div className={styles.infoSection}>
                                            <h3><Tag size={16} /> Tags</h3>
                                            <div className={styles.tagsList}>
                                                {selectedClient.tags.map((tag, idx) => (
                                                    <span key={idx} className={styles.tag}>{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Documents Tab */}
                            {activeTab === 'documents' && (
                                <div className={styles.documentsTab}>
                                    <div className={styles.tabHeader}>
                                        <h3>Document Management 
                                            {documentsLoading && <span className={styles.syncIndicator}>●</span>}
                                        </h3>
                                        <button 
                                            className={styles.actionBtn}
                                            onClick={() => setShowDocModal(true)}
                                        >
                                            <Plus size={16} />
                                            Request Document
                                        </button>
                                    </div>

                                    <div className={styles.documentsList}>
                                        {documents.length === 0 ? (
                                            <div className={styles.emptyStateSmall}>
                                                <FileText size={32} />
                                                <p>No documents requested yet</p>
                                            </div>
                                        ) : (
                                            documents.map(doc => (
                                                <div key={doc.id} className={styles.documentCard}>
                                                    <div className={styles.docHeader}>
                                                        <div className={styles.docIcon}>
                                                            <FileText size={20} />
                                                        </div>
                                                        <div className={styles.docInfo}>
                                                            <h4>{doc.name}</h4>
                                                            <p>{doc.description}</p>
                                                            {getDocStatusBadge(doc.status as DocumentStatus)}
                                                        </div>
                                                        <div className={styles.docActions}>
                                                            {doc.file_url && (
                                                                <button 
                                                                    className={styles.iconBtn}
                                                                    onClick={() => handleDownload(doc.file_url, doc.file_name)}
                                                                    title="Download"
                                                                >
                                                                    <Download size={16} />
                                                                </button>
                                                            )}
                                                            <button 
                                                                className={styles.iconBtn}
                                                                onClick={() => handleDeleteDocument(doc.id)}
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {doc.status === 'submitted' && (
                                                        <div className={styles.docReview}>
                                                            <p className={styles.reviewText}>Document uploaded by client. Please review:</p>
                                                            <div className={styles.reviewActions}>
                                                                <button 
                                                                    className={styles.approveBtn}
                                                                    onClick={() => handleDocumentStatus(doc.id, 'approve')}
                                                                >
                                                                    <Check size={14} />
                                                                    Approve
                                                                </button>
                                                                <button 
                                                                    className={styles.rejectBtn}
                                                                    onClick={() => handleDocumentStatus(doc.id, 'reject')}
                                                                >
                                                                    <X size={14} />
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {doc.admin_notes && (
                                                        <div className={styles.docNotes}>
                                                            <span className={styles.notesLabel}>Admin Notes:</span>
                                                            <span className={styles.notesValue}>{doc.admin_notes}</span>
                                                        </div>
                                                    )}

                                                    {doc.client_notes && (
                                                        <div className={styles.docNotes}>
                                                            <span className={styles.notesLabel}>Client Notes:</span>
                                                            <span className={styles.notesValue}>{doc.client_notes}</span>
                                                        </div>
                                                    )}

                                                    <div className={styles.docMeta}>
                                                        <span>Requested: {new Date(doc.requested_at).toLocaleDateString()}</span>
                                                        {doc.uploaded_at && (
                                                            <span>Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Messages Tab */}
                            {activeTab === 'messages' && (
                                <div className={styles.messagesTab}>
                                    <div className={styles.tabHeader}>
                                        <h3>Messages
                                            {messagesLoading && <span className={styles.syncIndicator}>●</span>}
                                        </h3>
                                        <OnlineIndicator userIds={[]} />
                                    </div>

                                    <div className={styles.messagesList}>
                                        {messages.length === 0 ? (
                                            <div className={styles.emptyStateSmall}>
                                                <MessageSquare size={32} />
                                                <p>No messages yet</p>
                                            </div>
                                        ) : (
                                            messages.map(msg => (
                                                <div 
                                                    key={msg.id} 
                                                    className={`${styles.messageCard} ${msg.sender_type === 'admin' ? styles.messageAdmin : styles.messageClient} ${!msg.is_read && msg.sender_type === 'client' ? styles.messageUnread : ''}`}
                                                    onClick={() => !msg.is_read && msg.sender_type === 'client' && markAsRead(msg.id)}
                                                >
                                                    <div className={styles.messageHeader}>
                                                        <div className={styles.messageAvatar}>
                                                            {msg.sender_name.charAt(0)}
                                                        </div>
                                                        <div className={styles.messageSender}>
                                                            <span className={styles.senderName}>{msg.sender_name}</span>
                                                            <span className={styles.senderRole}>{msg.sender_type === 'admin' ? 'Admin' : 'Client'}</span>
                                                        </div>
                                                        <span className={styles.messageTime}>
                                                            {new Date(msg.created_at).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <p className={styles.messageContent}>{msg.content}</p>
                                                    {!msg.is_read && msg.sender_type === 'client' && (
                                                        <span className={styles.unreadIndicator}>New message - click to mark as read</span>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                        
                                        {/* Typing Indicator */}
                                        <TypingIndicator users={typingUsers} />
                                    </div>

                                    {/* Message Input */}
                                    <div className={styles.messageInput}>
                                        <textarea
                                            placeholder="Type your message..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            rows={3}
                                        />
                                        <div className={styles.messageInputActions}>
                                            <button 
                                                className={styles.sendBtn}
                                                onClick={handleSendMessage}
                                                disabled={!newMessage.trim() || sendingMessage}
                                            >
                                                <Send size={16} />
                                                {sendingMessage ? 'Sending...' : 'Send Message'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Document Request Modal */}
            {showDocModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3>Request Document</h3>
                            <button className={styles.closeBtn} onClick={() => setShowDocModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label>Document Type</label>
                                <select 
                                    value={newDocType} 
                                    onChange={(e) => setNewDocType(e.target.value as DocumentType)}
                                >
                                    {DOCUMENT_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Document Name</label>
                                <input 
                                    type="text" 
                                    value={newDocName}
                                    onChange={(e) => setNewDocName(e.target.value)}
                                    placeholder="e.g., Company Registration Certificate"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Description (Optional)</label>
                                <textarea
                                    value={newDocDescription}
                                    onChange={(e) => setNewDocDescription(e.target.value)}
                                    placeholder="Describe what the client needs to upload..."
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setShowDocModal(false)}>
                                Cancel
                            </button>
                            <button 
                                className={styles.saveBtn} 
                                onClick={handleCreateDocumentRequest}
                                disabled={!newDocName.trim()}
                            >
                                Request Document
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
