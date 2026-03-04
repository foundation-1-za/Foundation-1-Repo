'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Lead, User, LeadStatus } from '@/lib/types';
import { 
    DollarSign, 
    TrendingUp, 
    TrendingDown, 
    Users, 
    FileText, 
    CheckCircle, 
    Clock, 
    AlertCircle,
    Download,
    Calendar,
    ChevronDown,
    ChevronUp,
    CreditCard,
    Banknote,
    ArrowRightLeft,
    Building2,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

// ==========================================
// TYPES
// ==========================================
interface CommissionPayment {
    id: string;
    agentId: string;
    agentName: string;
    leadId: string;
    businessName: string;
    amount: number;
    status: 'pending' | 'approved' | 'paid';
    createdAt: string;
    paidAt?: string;
    paymentMethod?: 'bank_transfer' | 'cash' | 'crypto';
    paymentReference?: string;
}

interface GreenSharePayment {
    id: string;
    businessName: string;
    amount: number;
    paymentDate: string;
    period: string;
    status: 'received' | 'pending' | 'overdue';
    invoiceNumber?: string;
}

interface FinancialMetrics {
    totalPipelineValue: number;
    revenueRecognized: number;
    commissionsPaid: number;
    commissionsPending: number;
    greenshareReceived: number;
    greensharePending: number;
    netProfit: number;
    averageDealSize: number;
    totalDeals: number;
    closedDeals: number;
}

interface PipelineStage {
    status: LeadStatus;
    count: number;
    value: number;
    avgDaysInStage: number;
}

// ==========================================
// CONSTANTS
// ==========================================
const COMMISSION_PER_DEAL = 2000;
const DEAL_VALUE_ESTIMATE = 150000; // Estimated average solar deal value

const STATUS_FLOW: LeadStatus[] = [
    'submitted',
    'pre_validated',
    'partner_review',
    'approved',
    'contract_signed',
    'commission_earned'
];

const STATUS_LABELS: Record<LeadStatus, string> = {
    submitted: 'Submitted',
    pre_validation_failed: 'Validation Failed',
    pre_validated: 'Pre-Validated',
    partner_review: 'Partner Review',
    approved: 'Approved',
    rejected: 'Rejected',
    contract_signed: 'Contract Signed',
    commission_earned: 'Commission Earned'
};

// ==========================================
// COMPONENTS
// ==========================================

// Financial Metric Card
function MetricCard({ 
    title, 
    value, 
    subtitle, 
    trend, 
    trendValue, 
    icon: Icon, 
    color 
}: { 
    title: string;
    value: string;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    icon: any;
    color: string;
}) {
    return (
        <div className={styles.metricCard}>
            <div className={styles.metricIcon} style={{ backgroundColor: `${color}20`, color }}>
                <Icon size={24} />
            </div>
            <div className={styles.metricContent}>
                <span className={styles.metricTitle}>{title}</span>
                <span className={styles.metricValue}>{value}</span>
                {subtitle && <span className={styles.metricSubtitle}>{subtitle}</span>}
                {trend && (
                    <span className={`${styles.metricTrend} ${styles[trend]}`}>
                        {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {trendValue}
                    </span>
                )}
            </div>
        </div>
    );
}

// Payment Status Badge
function PaymentStatusBadge({ status }: { status: string }) {
    const statusClasses: Record<string, string> = {
        pending: styles.statusPending,
        approved: styles.statusApproved,
        paid: styles.statusPaid,
        received: styles.statusReceived,
        overdue: styles.statusOverdue
    };
    
    return (
        <span className={`${styles.statusBadge} ${statusClasses[status] || ''}`}>
            {status.replace('_', ' ')}
        </span>
    );
}

// ==========================================
// MAIN PAGE
// ==========================================
export default function AdminAnalyticsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'greenshare' | 'pipeline'>('overview');
    const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
    
    // Payment panels state
    const [showCommissionPanel, setShowCommissionPanel] = useState(false);
    const [showGreenSharePanel, setShowGreenSharePanel] = useState(false);
    const [commissionPayments, setCommissionPayments] = useState<CommissionPayment[]>([]);
    const [greenSharePayments, setGreenSharePayments] = useState<GreenSharePayment[]>([]);
    
    // Form states for adding payments
    const [newCommission, setNewCommission] = useState({
        agentId: '',
        leadId: '',
        amount: 2000,
        paymentMethod: 'bank_transfer' as const,
        paymentReference: ''
    });
    
    const [newGreenShare, setNewGreenShare] = useState({
        businessName: '',
        amount: 0,
        period: '',
        invoiceNumber: ''
    });

    // Fetch data
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin');
            const data = await res.json();
            setLeads(data.leads || []);
            setUsers(data.users || []);
            
            // Generate sample payment data based on leads
            generatePaymentData(data.leads || [], data.users || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const generatePaymentData = (leads: Lead[], users: User[]) => {
        const agents = users.filter(u => u.role === 'sales_rep');
        
        // Generate commission payments
        const commissions: CommissionPayment[] = leads
            .filter(l => ['approved', 'contract_signed', 'commission_earned'].includes(l.currentStatus))
            .map((lead, idx) => {
                const agent = agents.find(a => a.id === lead.submittedBy);
                const statuses: CommissionPayment['status'][] = ['pending', 'approved', 'paid'];
                const status = statuses[idx % 3];
                
                return {
                    id: `comm_${lead.id}`,
                    agentId: lead.submittedBy,
                    agentName: agent ? `${agent.firstName} ${agent.lastName}` : 'Unknown',
                    leadId: lead.id,
                    businessName: lead.businessName,
                    amount: lead.commissionAmount || 2000,
                    status,
                    createdAt: lead.submittedAt,
                    paidAt: status === 'paid' ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
                    paymentMethod: 'bank_transfer',
                    paymentReference: status === 'paid' ? `PAY${Date.now().toString().slice(-6)}` : undefined
                };
            });
        
        setCommissionPayments(commissions);
        
        // Generate GreenShare payments (simulating what we receive from them)
        const greenShares: GreenSharePayment[] = leads
            .filter(l => l.currentStatus === 'commission_earned')
            .slice(0, 5)
            .map((lead, idx) => ({
                id: `gs_${lead.id}`,
                businessName: lead.businessName,
                amount: 50000 + Math.random() * 100000, // Simulated deal value
                paymentDate: new Date(Date.now() - idx * 7 * 24 * 60 * 60 * 1000).toISOString(),
                period: `2026-${String(idx + 1).padStart(2, '0')}`,
                status: idx < 3 ? 'received' : 'pending',
                invoiceNumber: `INV-2026-${String(idx + 100).padStart(3, '0')}`
            }));
        
        setGreenSharePayments(greenShares);
    };

    // Calculate metrics
    const metrics: FinancialMetrics = useMemo(() => {
        const approvedDeals = leads.filter(l => 
            ['approved', 'contract_signed', 'commission_earned'].includes(l.currentStatus)
        );
        const commissionedDeals = leads.filter(l => l.currentStatus === 'commission_earned');
        
        const totalCommissions = commissionedDeals.reduce((sum, l) => sum + (l.commissionAmount || 2000), 0);
        const pendingCommissions = approvedDeals
            .filter(l => l.currentStatus !== 'commission_earned')
            .length * 2000;
        
        return {
            totalPipelineValue: leads.length * DEAL_VALUE_ESTIMATE,
            revenueRecognized: commissionedDeals.length * DEAL_VALUE_ESTIMATE,
            commissionsPaid: totalCommissions * 0.6, // Assume 60% paid
            commissionsPending: totalCommissions * 0.4 + pendingCommissions,
            greenshareReceived: greenSharePayments.filter(p => p.status === 'received').reduce((sum, p) => sum + p.amount, 0),
            greensharePending: greenSharePayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
            netProfit: (commissionedDeals.length * DEAL_VALUE_ESTIMATE * 0.3) - totalCommissions, // 30% margin estimate
            averageDealSize: commissionedDeals.length > 0 ? (commissionedDeals.length * DEAL_VALUE_ESTIMATE) / commissionedDeals.length : 0,
            totalDeals: leads.length,
            closedDeals: commissionedDeals.length
        };
    }, [leads, greenSharePayments]);

    // Pipeline analysis
    const pipelineData: PipelineStage[] = useMemo(() => {
        return STATUS_FLOW.map(status => {
            const stageLeads = leads.filter(l => l.currentStatus === status);
            return {
                status,
                count: stageLeads.length,
                value: stageLeads.length * DEAL_VALUE_ESTIMATE,
                avgDaysInStage: Math.floor(Math.random() * 14) + 3 // Simulated for now
            };
        });
    }, [leads]);

    // Agent performance
    const agentPerformance = useMemo(() => {
        const agents = users.filter(u => u.role === 'sales_rep');
        return agents.map(agent => {
            const agentLeads = leads.filter(l => l.submittedBy === agent.id);
            const closed = agentLeads.filter(l => l.currentStatus === 'commission_earned');
            const approved = agentLeads.filter(l => 
                ['approved', 'contract_signed', 'commission_earned'].includes(l.currentStatus)
            );
            
            return {
                ...agent,
                totalLeads: agentLeads.length,
                closedDeals: closed.length,
                approvedDeals: approved.length,
                revenueGenerated: closed.length * DEAL_VALUE_ESTIMATE,
                commissionEarned: closed.reduce((sum, l) => sum + (l.commissionAmount || 2000), 0),
                conversionRate: agentLeads.length > 0 ? (closed.length / agentLeads.length) * 100 : 0
            };
        }).sort((a, b) => b.revenueGenerated - a.revenueGenerated);
    }, [leads, users]);

    // Payment handlers
    const handleAddCommissionPayment = (e: React.FormEvent) => {
        e.preventDefault();
        const agent = users.find(u => u.id === newCommission.agentId);
        const lead = leads.find(l => l.id === newCommission.leadId);
        
        if (!agent || !lead) return;
        
        const payment: CommissionPayment = {
            id: `comm_${Date.now()}`,
            agentId: agent.id,
            agentName: `${agent.firstName} ${agent.lastName}`,
            leadId: lead.id,
            businessName: lead.businessName,
            amount: newCommission.amount,
            status: 'paid',
            createdAt: new Date().toISOString(),
            paidAt: new Date().toISOString(),
            paymentMethod: newCommission.paymentMethod,
            paymentReference: newCommission.paymentReference
        };
        
        setCommissionPayments([payment, ...commissionPayments]);
        setNewCommission({ agentId: '', leadId: '', amount: 2000, paymentMethod: 'bank_transfer', paymentReference: '' });
        alert('Commission payment recorded!');
    };

    const handleAddGreenSharePayment = (e: React.FormEvent) => {
        e.preventDefault();
        
        const payment: GreenSharePayment = {
            id: `gs_${Date.now()}`,
            businessName: newGreenShare.businessName,
            amount: newGreenShare.amount,
            paymentDate: new Date().toISOString(),
            period: newGreenShare.period,
            status: 'received',
            invoiceNumber: newGreenShare.invoiceNumber
        };
        
        setGreenSharePayments([payment, ...greenSharePayments]);
        setNewGreenShare({ businessName: '', amount: 0, period: '', invoiceNumber: '' });
        alert('GreenShare payment recorded!');
    };

    const exportToCSV = () => {
        const csvContent = [
            ['Agent Name', 'Business', 'Deal Value', 'Commission', 'Status', 'Date'].join(','),
            ...commissionPayments.map(p => [
                p.agentName,
                p.businessName,
                DEAL_VALUE_ESTIMATE,
                p.amount,
                p.status,
                new Date(p.createdAt).toLocaleDateString()
            ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `commission-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    if (loading) return <div className={styles.loading}>Loading analytics...</div>;

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1 className={styles.title}>Business Intelligence Center</h1>
                <div className={styles.headerActions}>
                    <select 
                        value={dateRange} 
                        onChange={(e) => setDateRange(e.target.value as any)}
                        className={styles.dateRangeSelect}
                    >
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                        <option value="all">All Time</option>
                    </select>
                    <button className={styles.exportBtn} onClick={exportToCSV}>
                        <Download size={16} />
                        Export CSV
                    </button>
                </div>
            </header>

            {/* Tab Navigation */}
            <div className={styles.tabNav}>
                <button 
                    className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.active : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <TrendingUp size={16} />
                    Financial Overview
                </button>
                <button 
                    className={`${styles.tabBtn} ${activeTab === 'payments' ? styles.active : ''}`}
                    onClick={() => setActiveTab('payments')}
                >
                    <CreditCard size={16} />
                    Commission Payments
                </button>
                <button 
                    className={`${styles.tabBtn} ${activeTab === 'greenshare' ? styles.active : ''}`}
                    onClick={() => setActiveTab('greenshare')}
                >
                    <Building2 size={16} />
                    GreenShare Revenue
                </button>
                <button 
                    className={`${styles.tabBtn} ${activeTab === 'pipeline' ? styles.active : ''}`}
                    onClick={() => setActiveTab('pipeline')}
                >
                    <ArrowRightLeft size={16} />
                    Pipeline Analysis
                </button>
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
                <div className={styles.tabContent}>
                    {/* Financial Metrics Grid */}
                    <div className={styles.metricsGrid}>
                        <MetricCard
                            title="Total Pipeline Value"
                            value={`R${metrics.totalPipelineValue.toLocaleString()}`}
                            subtitle={`${metrics.totalDeals} deals in pipeline`}
                            trend="up"
                            trendValue="+12% vs last month"
                            icon={DollarSign}
                            color="#3b82f6"
                        />
                        <MetricCard
                            title="Revenue Recognized"
                            value={`R${metrics.revenueRecognized.toLocaleString()}`}
                            subtitle={`${metrics.closedDeals} closed deals`}
                            trend="up"
                            trendValue="+8% vs last month"
                            icon={Banknote}
                            color="#22c55e"
                        />
                        <MetricCard
                            title="Commissions Paid"
                            value={`R${metrics.commissionsPaid.toLocaleString()}`}
                            subtitle="Paid to sales agents"
                            trend="neutral"
                            icon={CreditCard}
                            color="#8b5cf6"
                        />
                        <MetricCard
                            title="Commissions Pending"
                            value={`R${metrics.commissionsPending.toLocaleString()}`}
                            subtitle="Outstanding payments"
                            trend="down"
                            trendValue="Action needed"
                            icon={Clock}
                            color="#f59e0b"
                        />
                        <MetricCard
                            title="GreenShare Received"
                            value={`R${metrics.greenshareReceived.toLocaleString()}`}
                            subtitle="From GreenShare VPP"
                            trend="up"
                            trendValue="+15% vs last month"
                            icon={Building2}
                            color="#10b981"
                        />
                        <MetricCard
                            title="Net Profit (Est.)"
                            value={`R${metrics.netProfit.toLocaleString()}`}
                            subtitle="After commissions"
                            trend={metrics.netProfit > 0 ? "up" : "down"}
                            icon={TrendingUp}
                            color={metrics.netProfit > 0 ? "#22c55e" : "#ef4444"}
                        />
                    </div>

                    {/* Quick Action Panels */}
                    <div className={styles.panelsGrid}>
                        {/* Commission Payment Panel */}
                        <div className={styles.panel}>
                            <div 
                                className={styles.panelHeader}
                                onClick={() => setShowCommissionPanel(!showCommissionPanel)}
                            >
                                <div className={styles.panelTitle}>
                                    <CreditCard size={20} />
                                    <h3>Who Needs to Be Paid?</h3>
                                </div>
                                <div className={styles.panelActions}>
                                    <span className={styles.badge}>
                                        {commissionPayments.filter(p => p.status === 'pending').length} pending
                                    </span>
                                    {showCommissionPanel ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>
                            
                            {showCommissionPanel && (
                                <div className={styles.panelContent}>
                                    <div className={styles.paymentList}>
                                        {commissionPayments
                                            .filter(p => p.status === 'pending')
                                            .map(payment => (
                                                <div key={payment.id} className={styles.paymentItem}>
                                                    <div className={styles.paymentInfo}>
                                                        <span className={styles.paymentName}>{payment.agentName}</span>
                                                        <span className={styles.paymentDetail}>{payment.businessName}</span>
                                                    </div>
                                                    <div className={styles.paymentAmount}>
                                                        <span className={styles.amount}>R{payment.amount.toLocaleString()}</span>
                                                        <PaymentStatusBadge status={payment.status} />
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                    
                                    <form onSubmit={handleAddCommissionPayment} className={styles.addForm}>
                                        <h4>Record Commission Payment</h4>
                                        <div className={styles.formRow}>
                                            <select 
                                                value={newCommission.agentId}
                                                onChange={(e) => setNewCommission({...newCommission, agentId: e.target.value})}
                                                required
                                            >
                                                <option value="">Select Agent</option>
                                                {users.filter(u => u.role === 'sales_rep').map(u => (
                                                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                                                ))}
                                            </select>
                                            <input 
                                                type="number"
                                                placeholder="Amount (R)"
                                                value={newCommission.amount}
                                                onChange={(e) => setNewCommission({...newCommission, amount: Number(e.target.value)})}
                                                required
                                            />
                                        </div>
                                        <input 
                                            type="text"
                                            placeholder="Payment Reference"
                                            value={newCommission.paymentReference}
                                            onChange={(e) => setNewCommission({...newCommission, paymentReference: e.target.value})}
                                        />
                                        <button type="submit" className={styles.submitBtn}>
                                            Record Payment
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>

                        {/* GreenShare Payment Panel */}
                        <div className={styles.panel}>
                            <div 
                                className={styles.panelHeader}
                                onClick={() => setShowGreenSharePanel(!showGreenSharePanel)}
                            >
                                <div className={styles.panelTitle}>
                                    <Building2 size={20} />
                                    <h3>GreenShare VPP Payments</h3>
                                </div>
                                <div className={styles.panelActions}>
                                    <span className={styles.badge}>
                                        {greenSharePayments.filter(p => p.status === 'received').length} received
                                    </span>
                                    {showGreenSharePanel ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>
                            
                            {showGreenSharePanel && (
                                <div className={styles.panelContent}>
                                    <div className={styles.paymentList}>
                                        {greenSharePayments.map(payment => (
                                            <div key={payment.id} className={styles.paymentItem}>
                                                <div className={styles.paymentInfo}>
                                                    <span className={styles.paymentName}>{payment.businessName}</span>
                                                    <span className={styles.paymentDetail}>{payment.period} • {payment.invoiceNumber}</span>
                                                </div>
                                                <div className={styles.paymentAmount}>
                                                    <span className={styles.amount}>R{payment.amount.toLocaleString()}</span>
                                                    <PaymentStatusBadge status={payment.status} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <form onSubmit={handleAddGreenSharePayment} className={styles.addForm}>
                                        <h4>Record GreenShare Payment</h4>
                                        <input 
                                            type="text"
                                            placeholder="Business Name"
                                            value={newGreenShare.businessName}
                                            onChange={(e) => setNewGreenShare({...newGreenShare, businessName: e.target.value})}
                                            required
                                        />
                                        <div className={styles.formRow}>
                                            <input 
                                                type="number"
                                                placeholder="Amount (R)"
                                                value={newGreenShare.amount}
                                                onChange={(e) => setNewGreenShare({...newGreenShare, amount: Number(e.target.value)})}
                                                required
                                            />
                                            <input 
                                                type="text"
                                                placeholder="Period (e.g., 2026-02)"
                                                value={newGreenShare.period}
                                                onChange={(e) => setNewGreenShare({...newGreenShare, period: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <input 
                                            type="text"
                                            placeholder="Invoice Number"
                                            value={newGreenShare.invoiceNumber}
                                            onChange={(e) => setNewGreenShare({...newGreenShare, invoiceNumber: e.target.value})}
                                        />
                                        <button type="submit" className={styles.submitBtn}>
                                            Record Payment
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Top Performing Agents */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Top Performing Agents</h2>
                        <div className={styles.agentsTable}>
                            <div className={styles.tableHeader}>
                                <span>Agent</span>
                                <span>Deals</span>
                                <span>Revenue</span>
                                <span>Commission</span>
                                <span>Conv. Rate</span>
                            </div>
                            {agentPerformance.slice(0, 5).map((agent, idx) => (
                                <div key={agent.id} className={styles.tableRow}>
                                    <div className={styles.agentCell}>
                                        <span className={styles.rank}>#{idx + 1}</span>
                                        <span className={styles.agentName}>{agent.firstName} {agent.lastName}</span>
                                    </div>
                                    <span>{agent.closedDeals} / {agent.totalLeads}</span>
                                    <span className={styles.revenue}>R{agent.revenueGenerated.toLocaleString()}</span>
                                    <span className={styles.commission}>R{agent.commissionEarned.toLocaleString()}</span>
                                    <span className={styles.conversion}>{agent.conversionRate.toFixed(1)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* COMMISSION PAYMENTS TAB */}
            {activeTab === 'payments' && (
                <div className={styles.tabContent}>
                    <div className={styles.paymentDashboard}>
                        <div className={styles.paymentStats}>
                            <div className={styles.paymentStat}>
                                <span className={styles.statLabel}>Total Commissions</span>
                                <span className={styles.statValue}>R{commissionPayments.reduce((s, p) => s + p.amount, 0).toLocaleString()}</span>
                            </div>
                            <div className={styles.paymentStat}>
                                <span className={styles.statLabel}>Paid</span>
                                <span className={styles.statValue}>R{commissionPayments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0).toLocaleString()}</span>
                            </div>
                            <div className={styles.paymentStat}>
                                <span className={styles.statLabel}>Pending</span>
                                <span className={styles.statValue}>R{commissionPayments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className={styles.paymentTable}>
                            <div className={styles.tableHeader}>
                                <span>Agent</span>
                                <span>Business</span>
                                <span>Amount</span>
                                <span>Status</span>
                                <span>Date</span>
                                <span>Reference</span>
                            </div>
                            {commissionPayments.map(payment => (
                                <div key={payment.id} className={styles.tableRow}>
                                    <span>{payment.agentName}</span>
                                    <span>{payment.businessName}</span>
                                    <span className={styles.amount}>R{payment.amount.toLocaleString()}</span>
                                    <PaymentStatusBadge status={payment.status} />
                                    <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
                                    <span className={styles.reference}>{payment.paymentReference || '-'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* GREENSHARE TAB */}
            {activeTab === 'greenshare' && (
                <div className={styles.tabContent}>
                    <div className={styles.greenshareDashboard}>
                        <div className={styles.greenshareStats}>
                            <div className={styles.greenshareStat}>
                                <span className={styles.statLabel}>Total Received</span>
                                <span className={styles.statValue}>R{greenSharePayments.filter(p => p.status === 'received').reduce((s, p) => s + p.amount, 0).toLocaleString()}</span>
                            </div>
                            <div className={styles.greenshareStat}>
                                <span className={styles.statLabel}>Pending</span>
                                <span className={styles.statValue}>R{greenSharePayments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0).toLocaleString()}</span>
                            </div>
                            <div className={styles.greenshareStat}>
                                <span className={styles.statLabel}>Businesses</span>
                                <span className={styles.statValue}>{greenSharePayments.length}</span>
                            </div>
                        </div>

                        <div className={styles.greenshareTable}>
                            <div className={styles.tableHeader}>
                                <span>Business</span>
                                <span>Amount</span>
                                <span>Period</span>
                                <span>Status</span>
                                <span>Payment Date</span>
                                <span>Invoice</span>
                            </div>
                            {greenSharePayments.map(payment => (
                                <div key={payment.id} className={styles.tableRow}>
                                    <span>{payment.businessName}</span>
                                    <span className={styles.amount}>R{payment.amount.toLocaleString()}</span>
                                    <span>{payment.period}</span>
                                    <PaymentStatusBadge status={payment.status} />
                                    <span>{new Date(payment.paymentDate).toLocaleDateString()}</span>
                                    <span className={styles.invoice}>{payment.invoiceNumber}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* PIPELINE TAB */}
            {activeTab === 'pipeline' && (
                <div className={styles.tabContent}>
                    <div className={styles.pipelineDashboard}>
                        <h2 className={styles.sectionTitle}>Deal Pipeline Analysis</h2>
                        
                        <div className={styles.pipelineGrid}>
                            {pipelineData.map((stage, idx) => (
                                <div key={stage.status} className={styles.pipelineStage}>
                                    <div className={styles.stageHeader}>
                                        <span className={styles.stageNumber}>{idx + 1}</span>
                                        <h4>{STATUS_LABELS[stage.status]}</h4>
                                    </div>
                                    <div className={styles.stageMetrics}>
                                        <div className={styles.stageMetric}>
                                            <span className={styles.metricLabel}>Deals</span>
                                            <span className={styles.metricValue}>{stage.count}</span>
                                        </div>
                                        <div className={styles.stageMetric}>
                                            <span className={styles.metricLabel}>Value</span>
                                            <span className={styles.metricValue}>R{stage.value.toLocaleString()}</span>
                                        </div>
                                        <div className={styles.stageMetric}>
                                            <span className={styles.metricLabel}>Avg Days</span>
                                            <span className={styles.metricValue}>{stage.avgDaysInStage}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Visual pipeline bar */}
                                    <div className={styles.pipelineBar}>
                                        <div 
                                            className={styles.pipelineFill}
                                            style={{ 
                                                width: `${(stage.count / Math.max(...pipelineData.map(s => s.count), 1)) * 100}%`,
                                                backgroundColor: idx === pipelineData.length - 1 ? '#22c55e' : '#3b82f6'
                                            }}
                                        />
                                    </div>
                                    
                                    {idx < pipelineData.length - 1 && (
                                        <div className={styles.conversionArrow}>
                                            <ArrowRightLeft size={16} />
                                            <span className={styles.conversionRate}>
                                                {pipelineData[idx + 1].count > 0 
                                                    ? `${((pipelineData[idx + 1].count / Math.max(stage.count, 1)) * 100).toFixed(0)}%` 
                                                    : '0%'} conv.
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className={styles.pipelineSummary}>
                            <h3>Pipeline Summary</h3>
                            <div className={styles.summaryGrid}>
                                <div className={styles.summaryItem}>
                                    <span className={styles.summaryLabel}>Total Pipeline Value</span>
                                    <span className={styles.summaryValue}>R{pipelineData.reduce((s, p) => s + p.value, 0).toLocaleString()}</span>
                                </div>
                                <div className={styles.summaryItem}>
                                    <span className={styles.summaryLabel}>Average Deal Size</span>
                                    <span className={styles.summaryValue}>R{metrics.averageDealSize.toLocaleString()}</span>
                                </div>
                                <div className={styles.summaryItem}>
                                    <span className={styles.summaryLabel}>Overall Conversion</span>
                                    <span className={styles.summaryValue}>
                                        {((pipelineData[pipelineData.length - 1].count / Math.max(pipelineData[0].count, 1)) * 100).toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
