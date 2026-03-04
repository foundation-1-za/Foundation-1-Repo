'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { DashboardMetrics, Lead, OnboardingStep } from '@/lib/types';
import {
    Users,
    CheckCircle,
    XCircle,
    FileCheck,
    DollarSign,
    Clock,
    Copy,
    Check,
    Link2,
    Share2,
    Target,
    TrendingUp,
    Award
} from 'lucide-react';
import styles from './page.module.css';
import BusinessDashboard from '@/components/BusinessDashboard';
import StepProgressBar, { StepStatusBadge, ONBOARDING_STEPS } from '@/components/StepProgressBar';
// ... other imports

export default function DashboardPage() {
    const { user } = useAuth();
    // ... existing state ...

    if (user?.role === 'business') {
        return <BusinessDashboard user={user} />;
    }

    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedLink, setCopiedLink] = useState(false);
    const [copiedRef, setCopiedRef] = useState(false);

    // Determine current onboarding step based on application data
    const getCurrentStep = (lead: Lead): OnboardingStep => {
        if (lead.onboardingStep) {
            return lead.onboardingStep;
        }
        
        // Infer from legacy status
        switch (lead.currentStatus) {
            case 'submitted':
                return lead.utilityBillFileName ? 'waiting_proposal' : 'utility_bill';
            case 'pre_validated':
            case 'partner_review':
                return 'waiting_proposal';
            case 'approved':
                return 'proposal_received';
            case 'contract_signed':
                return 'contract_signed';
            case 'rejected':
                return 'final_decision';
            default:
                return 'registration';
        }
    };

    useEffect(() => {
        if (user && user.role !== 'business') {
            // Fetch metrics
            fetch(`/api/dashboard?userId=${user.id}`)
                .then(res => res.json())
                .then(data => {
                    setMetrics(data.metrics);
                })
                .catch(() => {});
            
            // Fetch leads for this sales rep
            fetch(`/api/leads?salesRepId=${user.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.leads) {
                        setLeads(data.leads);
                    }
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [user]);

    if (loading || !metrics) {
        // If business user, we already returned. So this is safe.
        // Wait, if user is null initially?
        // user is from useAuth.
        // If loading auth? useAuth has isLoading.
        // DashboardShell handles auth loading.
        // But local loading state here is for metrics.
        return <div className={styles.loading}>Loading dashboard data...</div>;
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Calculate this week's qualified leads (submitted with utility bill)
    const getWeekStart = () => {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Start from Monday
        const weekStart = new Date(now.setDate(diff));
        weekStart.setHours(0, 0, 0, 0);
        return weekStart;
    };

    const weekStart = getWeekStart();
    const weeklyQualified = leads.filter(l => 
        new Date(l.submittedAt) >= weekStart && l.utilityBillFileName
    ).length;
    const weeklyTarget = 20;
    const weeklyProgress = Math.min((weeklyQualified / weeklyTarget) * 100, 100);
    const remainingToTarget = Math.max(weeklyTarget - weeklyQualified, 0);

    const copyToClipboard = async (text: string, type: 'link' | 'ref') => {
        try {
            await navigator.clipboard.writeText(text);
            if (type === 'link') {
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2000);
            } else {
                setCopiedRef(true);
                setTimeout(() => setCopiedRef(false), 2000);
            }
        } catch {
            alert('Copied: ' + text);
        }
    };

    const referralLink = user?.referralLink 
        ? `https://foundation-1.co.za${user.referralLink}`
        : '';

    return (
        <div className={styles.dashboard}>
            <div className={styles.welcome}>
                <h2 className={styles.welcomeTitle}>Welcome back, {user?.firstName}</h2>
                <p className={styles.welcomeSubtitle}>Here is your performance overview.</p>
            </div>

            {/* REFERRAL LINK SECTION */}
            {user?.role === 'sales_rep' && (
                <div className={styles.referralSection}>
                    <div className={styles.referralCard}>
                        <div className={styles.referralHeader}>
                            <Share2 size={24} className={styles.referralIcon} />
                            <div>
                                <h3 className={styles.referralTitle}>Your Referral Link</h3>
                                <p className={styles.referralSubtitle}>Share this with potential clients to earn commission</p>
                            </div>
                        </div>
                        
                        <div className={styles.referralLinkBox}>
                            <div className={styles.linkContainer}>
                                <Link2 size={16} className={styles.linkIcon} />
                                <span className={styles.linkText}>{referralLink || 'Loading...'}</span>
                            </div>
                            <button 
                                className={styles.copyButton}
                                onClick={() => copyToClipboard(referralLink, 'link')}
                                title="Copy referral link"
                            >
                                {copiedLink ? <Check size={18} /> : <Copy size={18} />}
                                {copiedLink ? 'Copied!' : 'Copy Link'}
                            </button>
                        </div>

                        <div className={styles.referenceCodeBox}>
                            <span className={styles.referenceLabel}>Your Reference Code:</span>
                            <div className={styles.referenceValue}>
                                <code className={styles.referenceCode}>{user?.referenceCode || 'N/A'}</code>
                                <button 
                                    className={styles.copyButtonSmall}
                                    onClick={() => copyToClipboard(user?.referenceCode || '', 'ref')}
                                    title="Copy reference code"
                                >
                                    {copiedRef ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                            </div>
                        </div>

                        <div className={styles.referralInstructions}>
                            <p>📧 <strong>How to use:</strong> Send this link to businesses. When they register through your link, they will be automatically associated with you and you will earn commission when they sign up.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* WEEKLY KPI TARGET */}
            <div className={styles.weeklyTargetSection}>
                <div className={styles.weeklyTargetCard}>
                    <div className={styles.weeklyTargetHeader}>
                        <div className={styles.weeklyTargetTitle}>
                            <Target size={24} className={styles.weeklyTargetIcon} />
                            <h3>Weekly Performance Target</h3>
                        </div>
                        <span className={styles.weeklyTargetBadge}>Required KPI</span>
                    </div>
                    
                    <div className={styles.weeklyProgressContainer}>
                        <div className={styles.weeklyProgressStats}>
                            <div className={styles.weeklyStat}>
                                <span className={styles.weeklyStatNumber}>{weeklyQualified}</span>
                                <span className={styles.weeklyStatLabel}>Qualified This Week</span>
                            </div>
                            <div className={styles.weeklyDivider}>/</div>
                            <div className={styles.weeklyStat}>
                                <span className={styles.weeklyStatNumber}>{weeklyTarget}</span>
                                <span className={styles.weeklyStatLabel}>Weekly Target</span>
                            </div>
                            <div className={styles.weeklyStatRemaining}>
                                {remainingToTarget > 0 ? (
                                    <>
                                        <span className={styles.weeklyRemainingNumber}>{remainingToTarget}</span>
                                        <span className={styles.weeklyRemainingLabel}>Still needed</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={20} className={styles.weeklyCompletedIcon} />
                                        <span className={styles.weeklyCompletedLabel}>Target Met!</span>
                                    </>
                                )}
                            </div>
                        </div>
                        
                        <div className={styles.weeklyProgressBarContainer}>
                            <div className={styles.weeklyProgressBar}>
                                <div 
                                    className={`${styles.weeklyProgressFill} ${weeklyProgress >= 100 ? styles.weeklyProgressComplete : ''}`}
                                    style={{ width: `${weeklyProgress}%` }}
                                />
                            </div>
                            <span className={styles.weeklyProgressText}>{Math.round(weeklyProgress)}%</span>
                        </div>
                        
                        <p className={styles.weeklyTargetNote}>
                            <strong>Qualified Business:</strong> Registered company with 6+ months utility bills & R15k+ monthly electricity spend
                        </p>
                    </div>

                    <div className={styles.weeklyTargetActions}>
                        <a href="/dashboard/earnings" className={styles.weeklyTargetLink}>
                            <Award size={16} />
                            View Incentives & Bonuses
                        </a>
                        <a href="/dashboard/submit" className={styles.weeklyTargetCta}>
                            <TrendingUp size={16} />
                            Submit New Lead
                        </a>
                    </div>
                </div>
            </div>

            <div className={styles.grid}>
                {/* ROW 1: LEADS */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardTitle}>Total Leads</span>
                        <Users className={styles.cardIcon} />
                    </div>
                    <div className={styles.cardValue}>{metrics.totalLeads}</div>
                    <div className={styles.cardSub}>All time submissions</div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardTitle}>Approved</span>
                        <CheckCircle className={`${styles.cardIcon} ${styles.iconSuccess}`} />
                    </div>
                    <div className={styles.cardValue}>{metrics.leadsApproved}</div>
                    <div className={styles.cardSub}>Leads qualified &amp; processed</div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardTitle}>Rejected</span>
                        <XCircle className={`${styles.cardIcon} ${styles.iconError}`} />
                    </div>
                    <div className={styles.cardValue}>{metrics.leadsRejected}</div>
                    <div className={styles.cardSub}>Disqualified or unresponsive</div>
                </div>

                {/* ROW 2: FINANCIALS */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardTitle}>Contracts Signed</span>
                        <FileCheck className={`${styles.cardIcon} ${styles.iconSuccess}`} />
                    </div>
                    <div className={styles.cardValue}>{metrics.contractsSigned}</div>
                    <div className={styles.cardSub}>Closed deals</div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardTitle}>Commission Earned</span>
                        <DollarSign className={`${styles.cardIcon} ${styles.iconSuccess}`} />
                    </div>
                    <div className={styles.cardValue}>{formatCurrency(metrics.commissionEarned)}</div>
                    <div className={styles.cardSub}>Paid out</div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardTitle}>Pending Commission</span>
                        <Clock className={`${styles.cardIcon} ${styles.iconWarning}`} />
                    </div>
                    <div className={styles.cardValue}>{formatCurrency(metrics.commissionPending)}</div>
                    <div className={styles.cardSub}>Awaiting payment</div>
                </div>
            </div>

            {/* FUNNEL VISUALISATION */}
            {/* Leads Summary Table */}
            {leads.length > 0 && (
                <div className={styles.leadsSection}>
                    <div className={styles.leadsHeader}>
                        <h3 className={styles.sectionTitle}>My Business Leads</h3>
                        <a href="/dashboard/leads" className={styles.viewAllLink}>View All →</a>
                    </div>
                    
                    <div className={styles.leadsTableContainer}>
                        <table className={styles.leadsTable}>
                            <thead>
                                <tr>
                                    <th>Business</th>
                                    <th>Status</th>
                                    <th>Submitted</th>
                                    <th>Progress</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.slice(0, 5).map((lead) => {
                                    const stepIndex = ONBOARDING_STEPS.findIndex(s => s.id === getCurrentStep(lead));
                                    const progress = Math.round(((stepIndex + 1) / 9) * 100);
                                    const status = lead.onboardingStatus || (lead.currentStatus === 'rejected' ? 'rejected' : 'in_progress');
                                    
                                    return (
                                        <tr key={lead.id}>
                                            <td>
                                                <div className={styles.leadBusiness}>
                                                    <span className={styles.leadName}>{lead.businessName}</span>
                                                    <span className={styles.leadReg}>{lead.registrationNumber}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${styles[`status${status}`]}`}>
                                                    {status === 'rejected' ? 'Rejected' : 
                                                     status === 'accepted' ? 'Accepted' : 
                                                     status === 'pending' ? 'Pending' : 'In Progress'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={styles.leadDate}>
                                                    {new Date(lead.submittedAt).toLocaleDateString('en-ZA', { 
                                                        day: 'numeric', 
                                                        month: 'short' 
                                                    })}
                                                </span>
                                            </td>
                                            <td>
                                                <div className={styles.leadProgressMini}>
                                                    <div className={styles.progressBarMini}>
                                                        <div 
                                                            className={`${styles.progressFillMini} ${progress >= 100 ? styles.progressComplete : ''}`}
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                    <span className={styles.progressTextMini}>{progress}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    
                    {leads.length > 5 && (
                        <div className={styles.leadsMore}>
                            <span>+{leads.length - 5} more leads</span>
                            <a href="/dashboard/leads" className={styles.viewAllLink}>View All</a>
                        </div>
                    )}
                </div>
            )}

            <div className={styles.funnelSection}>
                <h3 className={styles.sectionTitle}>Pipeline Funnel</h3>
                <div className={styles.funnelContainer}>
                    <div className={styles.funnelBar}>
                        <div className={styles.funnelLabel}>Submitted</div>
                        <div
                            className={styles.funnelFill}
                            style={{ width: '100%', backgroundColor: 'var(--color-info)' }}
                        >
                            <span className={styles.funnelValue}>{metrics.totalLeads}</span>
                        </div>
                    </div>
                    <div className={styles.funnelBar}>
                        <div className={styles.funnelLabel}>Approved</div>
                        <div
                            className={styles.funnelFill}
                            style={{
                                width: `${metrics.totalLeads > 0 ? (metrics.leadsApproved / metrics.totalLeads) * 100 : 0}%`,
                                backgroundColor: 'var(--color-success)'
                            }}
                        >
                            <span className={styles.funnelValue}>{metrics.leadsApproved}</span>
                        </div>
                    </div>
                    <div className={styles.funnelBar}>
                        <div className={styles.funnelLabel}>Contracts</div>
                        <div
                            className={styles.funnelFill}
                            style={{
                                width: `${metrics.totalLeads > 0 ? (metrics.contractsSigned / metrics.totalLeads) * 100 : 0}%`,
                                backgroundColor: 'var(--color-black)'
                            }}
                        >
                            <span className={styles.funnelValue}>{metrics.contractsSigned}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
