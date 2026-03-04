'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Lead } from '@/lib/types';
import { Search, Filter, ChevronRight } from 'lucide-react';
import styles from './page.module.css';

const STATUS_COLORS: Record<string, string> = {
    submitted: 'var(--color-info)',
    pre_validation_failed: 'var(--color-error)',
    pre_validated: 'var(--color-success)',
    partner_review: 'var(--color-warning)',
    rejected: 'var(--color-error)',
    approved: 'var(--color-success)',
    contract_signed: 'var(--color-black)',
    commission_earned: 'var(--color-success)',
};

const STATUS_LABELS: Record<string, string> = {
    submitted: 'Submitted',
    pre_validation_failed: 'Validation Failed',
    pre_validated: 'Pre-Validated',
    partner_review: 'Partner Review',
    rejected: 'Rejected',
    approved: 'Approved',
    contract_signed: 'Contract Signed',
    commission_earned: 'Commission Earned',
};

export default function LeadsPage() {
    const { user } = useAuth();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        if (user) {
            fetch(`/api/leads?userId=${user.id}`)
                .then(res => res.json())
                .then(data => {
                    setLeads(data.leads);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [user]);

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.contactName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || lead.currentStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return <div className={styles.loading}>Loading leads...</div>;
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h2 className={styles.title}>My Leads</h2>
                <div className={styles.controls}>
                    <div className={styles.searchBox}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search business or contact..."
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className={styles.filterBox}>
                        <Filter size={18} className={styles.filterIcon} />
                        <select
                            className={styles.filterSelect}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="submitted">Submitted</option>
                            <option value="pre_validated">Pre-Validated</option>
                            <option value="partner_review">Partner Review</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="contract_signed">Contract Signed</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className={styles.leadsList}>
                {filteredLeads.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>No leads found matching your criteria.</p>
                    </div>
                ) : (
                    filteredLeads.map((lead) => (
                        <div key={lead.id} className={styles.leadCard}>
                            <div className={styles.leadMain}>
                                <div className={styles.leadHeader}>
                                    <h3 className={styles.businessName}>{lead.businessName}</h3>
                                    <span
                                        className={styles.statusBadge}
                                        style={{
                                            backgroundColor: STATUS_COLORS[lead.currentStatus] + '20', // 20% opacity
                                            color: STATUS_COLORS[lead.currentStatus]
                                        }}
                                    >
                                        {STATUS_LABELS[lead.currentStatus]}
                                    </span>
                                </div>
                                <div className={styles.leadDetails}>
                                    <span>{lead.contactName}</span>
                                    <span className={styles.detailSeparator}>•</span>
                                    <span>{new Date(lead.submittedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className={styles.leadHistory}>
                                {lead.statusHistory.slice().reverse().map((history, idx) => (
                                    <div key={idx} className={styles.historyItem}>
                                        <div className={styles.historyDot} />
                                        <span className={styles.historyStatus}>{STATUS_LABELS[history.status]}</span>
                                        <span className={styles.historyDate}>
                                            {new Date(history.timestamp).toLocaleDateString()}
                                        </span>
                                        {history.note && <p className={styles.historyNote}>{history.note}</p>}
                                    </div>
                                ))[0]} {/* Show only latest status update details */}
                            </div>
                            <button className={styles.viewBtn}>
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
