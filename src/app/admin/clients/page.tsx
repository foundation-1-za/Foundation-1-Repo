'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { useRealtimeDocuments } from '@/hooks/useRealtimeDocuments';
import { RealtimeStatus, TypingIndicator, OnlineIndicator } from '@/components/RealtimeNotification';
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

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
    { value: 'id_document', label: 'ID Document' },
    { value: 'proof_of_address', label: 'Proof of Address' },
    { value: 'financial_statement', label: 'Financial Statement' },
    { value: 'company_registration', label: 'Company Registration' },
    { value: 'tax_certificate', label: 'Tax Certificate' },
    { value: 'contract', label: 'Contract' },
    { value: 'other', label: 'Other' },
];

export default function AdminClientsPage() {
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedClient, setSelectedClient] = useState<any | null>(null);
    const [activeTab, setActiveTab] = useState<'details' | 'documents' | 'messages'>('details');
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Document request modal
    const [showDocModal, setShowDocModal] = useState(false);
    const [newDocType, setNewDocType] = useState<DocumentType>('id_document');
    const [newDocName, setNewDocName] = useState('');
    const [newDocDescription, setNewDocDescription] = useState('');

    // Realtime hooks
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
            const res = await fetch('/api/admin/clients');
            const data = await res.json();
            setClients(data.clients || []);
        } catch (err) {
            console.error('Failed to fetch clients:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    // Handle client selection
    const handleSelectClient = (client: any) => {
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

    // Filter clients
    const filteredClients = (clients || []).filter(client => {
        const matchesSearch =
            client.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.contact_name?.toLowerCase().includes(searchTerm.toLowerCase());
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
            </div>

            {/* Controls */}
            <div className={styles.controls}>
                <div className={styles.searchBox}>
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search..."
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
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClients.map(client => (
                            <tr key={client.id} className={styles.clientRow}>
                                <td>{client.business_name}</td>
                                <td>{client.contact_name}</td>
                                <td>
                                    <span className={`${styles.badge} ${getStatusBadgeClass(client.status)}`}>
                                        {client.status}
                                    </span>
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
            </div>

            {/* Client Detail Panel */}
            {isDetailOpen && selectedClient && (
                <div className={styles.detailOverlay}>
                    <div className={styles.detailPanel}>
                        <div className={styles.detailHeader}>
                            <button className={styles.backBtn} onClick={handleCloseDetail}>
                                <ChevronLeft size={20} />
                            </button>
                            <h2>{selectedClient.business_name}</h2>
                            <button className={styles.closeBtn} onClick={handleCloseDetail}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.detailTabs}>
                            <button onClick={() => setActiveTab('details')} className={activeTab === 'details' ? styles.active : ''}>Details</button>
                            <button onClick={() => setActiveTab('documents')} className={activeTab === 'documents' ? styles.active : ''}>Documents</button>
                            <button onClick={() => setActiveTab('messages')} className={activeTab === 'messages' ? styles.active : ''}>Messages</button>
                        </div>

                        <div className={styles.detailContent}>
                            {activeTab === 'details' && (
                                <div className={styles.detailsTab}>
                                    <p><strong>Business:</strong> {selectedClient.business_name}</p>
                                    <p><strong>Contact:</strong> {selectedClient.contact_name}</p>
                                    <p><strong>Email:</strong> {selectedClient.contact_email}</p>
                                </div>
                            )}

                            {activeTab === 'documents' && (
                                <div className={styles.documentsTab}>
                                    <button onClick={() => setShowDocModal(true)}>Request Document</button>
                                    {documents.map(doc => (
                                        <div key={doc.id} className={styles.documentCard}>
                                            <span>{doc.name}</span>
                                            {getDocStatusBadge(doc.status)}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'messages' && (
                                <div className={styles.messagesTab}>
                                    <div className={styles.messagesList}>
                                        {messages.map(msg => (
                                            <div key={msg.id} className={msg.sender_type === 'admin' ? styles.messageAdmin : styles.messageClient}>
                                                <p>{msg.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className={styles.messageInput}>
                                        <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                                        <button onClick={handleSendMessage} disabled={sendingMessage}>Send</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
