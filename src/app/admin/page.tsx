'use client';

import React, { useEffect, useState } from 'react';
import { Lead, User, LeadStatus, OnboardingStep } from '@/lib/types';
import { 
    Search, 
    Check, 
    X, 
    Filter, 
    Eye, 
    Download, 
    Upload, 
    FileText,
    User as UserIcon,
    TrendingUp,
    DollarSign,
    Calendar,
    ChevronRight,
    ChevronDown,
    Mail,
    Phone,
    Building2,
    AlertCircle,
    CheckCircle,
    Clock,
    Ban,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

const STATUS_OPTIONS: LeadStatus[] = [
    'submitted',
    'pre_validation_failed',
    'pre_validated',
    'partner_review',
    'approved',
    'rejected',
    'contract_signed',
    'commission_earned'
];

const STATUS_FLOW: LeadStatus[] = [
    'submitted',
    'pre_validated',
    'partner_review',
    'approved',
    'contract_signed',
    'commission_earned'
];

interface LeadDetailViewProps {
    lead: Lead;
    agent: User | undefined;
    onClose: () => void;
    onStatusChange: (leadId: string, newStatus: LeadStatus, note: string) => void;
    onDocumentUpload: (leadId: string, file: File) => void;
}

function LeadDetailView({ lead, agent, onClose, onStatusChange, onDocumentUpload }: LeadDetailViewProps) {
    const [newStatus, setNewStatus] = useState<LeadStatus>(lead.currentStatus);
    const [note, setNote] = useState('');
    const [showStatusEditor, setShowStatusEditor] = useState(false);

    const currentIndex = STATUS_FLOW.indexOf(lead.currentStatus);
    const canProgress = currentIndex < STATUS_FLOW.length - 1 && 
        !['rejected', 'pre_validation_failed'].includes(lead.currentStatus);
    const canReject = !['rejected', 'commission_earned'].includes(lead.currentStatus);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onDocumentUpload(lead.id, e.target.files[0]);
        }
    };

    return (
        <div className={styles.detailOverlay}>
            <div className={styles.detailPanel}>
                <div className={styles.detailHeader}>
                    <div>
                        <h2>{lead.businessName}</h2>
                        <p className={styles.detailMeta}>Lead ID: {lead.id} | Submitted: {new Date(lead.submittedAt).toLocaleDateString()}</p>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.detailGrid}>
                    {/* Business Info */}
                    <div className={styles.detailSection}>
                        <h3><Building2 size={16} /> Business Information</h3>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Registration</span>
                                <span className={styles.infoValue}>{lead.registrationNumber}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Address</span>
                                <span className={styles.infoValue}>{lead.physicalAddress}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Industry</span>
                                <span className={styles.infoValue}>{lead.industry || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className={styles.detailSection}>
                        <h3><UserIcon size={16} /> Contact Person</h3>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Name</span>
                                <span className={styles.infoValue}>{lead.contactName}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Role</span>
                                <span className={styles.infoValue}>{lead.contactRole}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Phone</span>
                                <span className={styles.infoValue}>{lead.contactPhone}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Email</span>
                                <span className={styles.infoValue}>{lead.contactEmail}</span>
                            </div>
                        </div>
                    </div>

                    {/* Agent Info */}
                    <div className={styles.detailSection}>
                        <h3><TrendingUp size={16} /> Sales Agent</h3>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Name</span>
                                <span className={styles.infoValue}>{agent ? `${agent.firstName} ${agent.lastName}` : 'Unknown'}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Reference Code</span>
                                <span className={styles.infoValue}>{agent?.referenceCode || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Status Tracker */}
                    <div className={styles.detailSection}>
                        <h3><Clock size={16} /> Status Progress</h3>
                        <div className={styles.statusTracker}>
                            {STATUS_FLOW.map((status, idx) => {
                                const isCompleted = STATUS_FLOW.indexOf(lead.currentStatus) >= idx;
                                const isCurrent = lead.currentStatus === status;
                                const isRejected = lead.currentStatus === 'rejected' || lead.currentStatus === 'pre_validation_failed';
                                
                                return (
                                    <div key={status} className={`${styles.statusStep} ${isCompleted ? styles.completed : ''} ${isCurrent ? styles.current : ''} ${isRejected && idx > currentIndex ? styles.blocked : ''}`}>
                                        <div className={styles.statusDot}>
                                            {isCompleted ? <CheckCircle size={14} /> : <span>{idx + 1}</span>}
                                        </div>
                                        <span className={styles.statusLabel}>{status.replace(/_/g, ' ')}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Documents */}
                    <div className={styles.detailSection}>
                        <h3><FileText size={16} /> Documents</h3>
                        <div className={styles.documentList}>
                            {lead.utilityBillFileName && (
                                <div className={styles.documentItem}>
                                    <FileText size={16} />
                                    <span>{lead.utilityBillFileName}</span>
                                    <button className={styles.downloadBtn}>
                                        <Download size={14} />
                                    </button>
                                </div>
                            )}
                            <div className={styles.uploadZone}>
                                <input type="file" id={`upload-${lead.id}`} onChange={handleFileUpload} hidden />
                                <label htmlFor={`upload-${lead.id}`} className={styles.uploadLabel}>
                                    <Upload size={14} />
                                    <span>Upload Document</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Status History */}
                    <div className={styles.detailSection}>
                        <h3>Status History</h3>
                        <div className={styles.historyList}>
                            {lead.statusHistory.map((entry, idx) => (
                                <div key={idx} className={styles.historyItem}>
                                    <span className={styles.historyStatus}>{entry.status.replace(/_/g, ' ')}</span>
                                    <span className={styles.historyDate}>{new Date(entry.timestamp).toLocaleDateString()}</span>
                                    {entry.note && <span className={styles.historyNote}>{entry.note}</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className={styles.detailActions}>
                    {!showStatusEditor ? (
                        <>
                            {canProgress && (
                                <button 
                                    className={styles.progressBtn}
                                    onClick={() => {
                                        setNewStatus(STATUS_FLOW[currentIndex + 1]);
                                        setShowStatusEditor(true);
                                    }}
                                >
                                    <CheckCircle size={16} />
                                    Progress to {STATUS_FLOW[currentIndex + 1].replace(/_/g, ' ')}
                                </button>
                            )}
                            {canReject && (
                                <button 
                                    className={styles.rejectBtn}
                                    onClick={() => {
                                        setNewStatus('rejected');
                                        setShowStatusEditor(true);
                                    }}
                                >
                                    <Ban size={16} />
                                    Reject Lead
                                </button>
                            )}
                            <button 
                                className={styles.updateBtn}
                                onClick={() => setShowStatusEditor(true)}
                            >
                                Update Status
                            </button>
                        </>
                    ) : (
                        <div className={styles.statusEditor}>
                            <select 
                                value={newStatus} 
                                onChange={(e) => setNewStatus(e.target.value as LeadStatus)}
                                className={styles.statusSelect}
                            >
                                {STATUS_OPTIONS.map(s => (
                                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                placeholder="Add note (optional)..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className={styles.noteInput}
                            />
                            <button 
                                className={styles.saveBtn}
                                onClick={() => {
                                    onStatusChange(lead.id, newStatus, note);
                                    setShowStatusEditor(false);
                                    setNote('');
                                }}
                            >
                                <Check size={16} /> Save
                            </button>
                            <button 
                                className={styles.cancelBtn}
                                onClick={() => setShowStatusEditor(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Agent Performance Card Component
function AgentPerformanceCard({ agent, leads }: { agent: User; leads: Lead[] }) {
    const agentLeads = leads.filter(l => l.submittedBy === agent.id);
    const approved = agentLeads.filter(l => ['approved', 'contract_signed', 'commission_earned'].includes(l.currentStatus)).length;
    const rejected = agentLeads.filter(l => ['rejected', 'pre_validation_failed'].includes(l.currentStatus)).length;
    const pending = agentLeads.filter(l => ['submitted', 'pre_validated', 'partner_review'].includes(l.currentStatus)).length;
    const conversionRate = agentLeads.length > 0 ? Math.round((approved / agentLeads.length) * 100) : 0;

    return (
        <div className={styles.agentCard}>
            <div className={styles.agentHeader}>
                <div className={styles.agentAvatar}>
                    {agent.firstName[0]}{agent.lastName[0]}
                </div>
                <div>
                    <h4>{agent.firstName} {agent.lastName}</h4>
                    <p className={styles.agentRef}>{agent.referenceCode}</p>
                </div>
                <div className={styles.agentStatus}>
                    <span className={`${styles.statusBadge} ${agent.contractSigned ? styles.signed : styles.pending}`}>
                        {agent.contractSigned ? 'Contract Signed' : 'Contract Pending'}
                    </span>
                </div>
            </div>
            <div className={styles.agentStats}>
                <div className={styles.stat}>
                    <span className={styles.statValue}>{agentLeads.length}</span>
                    <span className={styles.statLabel}>Total Leads</span>
                </div>
                <div className={styles.stat}>
                    <span className={`${styles.statValue} ${styles.success}`}>{approved}</span>
                    <span className={styles.statLabel}>Approved</span>
                </div>
                <div className={styles.stat}>
                    <span className={`${styles.statValue} ${styles.error}`}>{rejected}</span>
                    <span className={styles.statLabel}>Rejected</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statValue}>{pending}</span>
                    <span className={styles.statLabel}>Pending</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statValue}>{conversionRate}%</span>
                    <span className={styles.statLabel}>Conversion</span>
                </div>
            </div>
        </div>
    );
}

export default function AdminDashboardPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [activeTab, setActiveTab] = useState<'leads' | 'agents' | 'analytics'>('leads');

    const fetchData = () => {
        setLoading(true);
        fetch('/api/admin')
            .then(res => res.json())
            .then(data => {
                setLeads(data.leads);
                setUsers(data.users);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateStatus = async (leadId: string, newStatus: LeadStatus, note: string) => {
        try {
            const res = await fetch('/api/admin', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId, status: newStatus, note }),
            });

            if (res.ok) {
                fetchData();
                if (selectedLead && selectedLead.id === leadId) {
                    const updatedLead = await res.json();
                    setSelectedLead(updatedLead.lead);
                }
            }
        } catch {
            alert('Failed to update status');
        }
    };

    const handleDocumentUpload = (leadId: string, file: File) => {
        // Simulate upload - in production this would upload to storage
        alert(`Document "${file.name}" uploaded for lead ${leadId}`);
    };

    const getUserName = (userId: string) => {
        const u = users.find(user => user.id === userId);
        return u ? `${u.firstName} ${u.lastName}` : userId;
    };

    const getAgent = (userId: string) => {
        return users.find(user => user.id === userId);
    };

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.contactName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || lead.currentStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const agents = users.filter(u => u.role === 'sales_rep');
    const businesses = users.filter(u => u.role === 'business');

    // Analytics calculations
    const totalLeads = leads.length;
    const approvedLeads = leads.filter(l => ['approved', 'contract_signed', 'commission_earned'].includes(l.currentStatus)).length;
    const rejectedLeads = leads.filter(l => ['rejected', 'pre_validation_failed'].includes(l.currentStatus)).length;
    const conversionRate = totalLeads > 0 ? Math.round((approvedLeads / totalLeads) * 100) : 0;
    const estimatedRevenue = approvedLeads * 2000; // R2,000 per approved lead

    if (loading) {
        return <div className={styles.loading}>Loading admin dashboard...</div>;
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1 className={styles.title}>Admin Command Center</h1>
                <p className={styles.subtitle}>Manage leads, agents, and business operations</p>
            </header>

            {/* Overview Cards */}
            <div className={styles.overviewGrid}>
                <div className={styles.overviewCard}>
                    <div className={styles.overviewIcon} style={{ background: 'var(--color-info-bg)', color: 'var(--color-info)' }}>
                        <FileText size={24} />
                    </div>
                    <div className={styles.overviewContent}>
                        <span className={styles.overviewValue}>{totalLeads}</span>
                        <span className={styles.overviewLabel}>Total Leads</span>
                    </div>
                </div>
                <div className={styles.overviewCard}>
                    <div className={styles.overviewIcon} style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                        <CheckCircle size={24} />
                    </div>
                    <div className={styles.overviewContent}>
                        <span className={styles.overviewValue}>{approvedLeads}</span>
                        <span className={styles.overviewLabel}>Approved</span>
                    </div>
                </div>
                <div className={styles.overviewCard}>
                    <div className={styles.overviewIcon} style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)' }}>
                        <Ban size={24} />
                    </div>
                    <div className={styles.overviewContent}>
                        <span className={styles.overviewValue}>{rejectedLeads}</span>
                        <span className={styles.overviewLabel}>Rejected</span>
                    </div>
                </div>
                <div className={styles.overviewCard}>
                    <div className={styles.overviewIcon} style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className={styles.overviewContent}>
                        <span className={styles.overviewValue}>{conversionRate}%</span>
                        <span className={styles.overviewLabel}>Conversion</span>
                    </div>
                </div>
                <div className={styles.overviewCard}>
                    <div className={styles.overviewIcon} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                        <DollarSign size={24} />
                    </div>
                    <div className={styles.overviewContent}>
                        <span className={styles.overviewValue}>R{estimatedRevenue.toLocaleString()}</span>
                        <span className={styles.overviewLabel}>Est. Commission</span>
                    </div>
                </div>
                <div className={styles.overviewCard}>
                    <div className={styles.overviewIcon} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                        <UserIcon size={24} />
                    </div>
                    <div className={styles.overviewContent}>
                        <span className={styles.overviewValue}>{agents.length}</span>
                        <span className={styles.overviewLabel}>Active Agents</span>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className={styles.tabNav}>
                <button 
                    className={`${styles.tabBtn} ${activeTab === 'leads' ? styles.active : ''}`}
                    onClick={() => setActiveTab('leads')}
                >
                    <FileText size={16} />
                    Lead Management
                </button>
                <button 
                    className={`${styles.tabBtn} ${activeTab === 'agents' ? styles.active : ''}`}
                    onClick={() => setActiveTab('agents')}
                >
                    <UserIcon size={16} />
                    Agent Performance
                </button>
                <button 
                    className={`${styles.tabBtn} ${activeTab === 'analytics' ? styles.active : ''}`}
                    onClick={() => setActiveTab('analytics')}
                >
                    <TrendingUp size={16} />
                    Analytics
                </button>
            </div>

            {/* Leads Tab */}
            {activeTab === 'leads' && (
                <div className={styles.tabContent}>
                    <div className={styles.controls}>
                        <div className={styles.searchBox}>
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search by business, contact, or lead ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className={styles.filterBox}>
                            <Filter size={18} />
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="all">All Statuses</option>
                                {STATUS_OPTIONS.map(s => (
                                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Lead ID</th>
                                    <th>Business</th>
                                    <th>Contact</th>
                                    <th>Agent</th>
                                    <th>Submitted</th>
                                    <th>Status</th>
                                    <th>Documents</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLeads.map(lead => (
                                    <tr key={lead.id} className={styles.leadRow}>
                                        <td className={styles.mono}>{lead.id}</td>
                                        <td className={styles.bold}>{lead.businessName}</td>
                                        <td>{lead.contactName}</td>
                                        <td>{getUserName(lead.submittedBy)}</td>
                                        <td>{new Date(lead.submittedAt).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`${styles.badge} ${styles['badge_' + lead.currentStatus]}`}>
                                                {lead.currentStatus.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td>
                                            {lead.utilityBillFileName ? (
                                                <span className={styles.hasDoc}>✓ Utility Bill</span>
                                            ) : (
                                                <span className={styles.noDoc}>Missing</span>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                className={styles.viewBtn}
                                                onClick={() => setSelectedLead(lead)}
                                            >
                                                <Eye size={16} />
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Agents Tab */}
            {activeTab === 'agents' && (
                <div className={styles.tabContent}>
                    <div className={styles.agentGrid}>
                        {agents.map(agent => (
                            <AgentPerformanceCard key={agent.id} agent={agent} leads={leads} />
                        ))}
                    </div>
                </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
                <div className={styles.tabContent}>
                    <div className={styles.analyticsGrid}>
                        <div className={styles.analyticsCard}>
                            <h3>Status Distribution</h3>
                            <div className={styles.statusBars}>
                                {STATUS_OPTIONS.map(status => {
                                    const count = leads.filter(l => l.currentStatus === status).length;
                                    const percentage = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
                                    return (
                                        <div key={status} className={styles.statusBar}>
                                            <span className={styles.barLabel}>{status.replace(/_/g, ' ')}</span>
                                            <div className={styles.barTrack}>
                                                <div 
                                                    className={styles.barFill} 
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className={styles.barValue}>{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className={styles.analyticsCard}>
                            <h3>Recent Activity</h3>
                            <div className={styles.activityList}>
                                {leads
                                    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                                    .slice(0, 10)
                                    .map(lead => (
                                        <div key={lead.id} className={styles.activityItem}>
                                            <span className={styles.activityBusiness}>{lead.businessName}</span>
                                            <span className={styles.activityStatus}>{lead.currentStatus.replace(/_/g, ' ')}</span>
                                            <span className={styles.activityDate}>{new Date(lead.submittedAt).toLocaleDateString()}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Lead Detail Modal */}
            {selectedLead && (
                <LeadDetailView
                    lead={selectedLead}
                    agent={getAgent(selectedLead.submittedBy)}
                    onClose={() => setSelectedLead(null)}
                    onStatusChange={handleUpdateStatus}
                    onDocumentUpload={handleDocumentUpload}
                />
            )}
        </div>
    );
}
