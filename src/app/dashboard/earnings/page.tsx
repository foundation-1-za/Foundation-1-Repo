'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Lead } from '@/lib/types';
import { DollarSign, Clock, CheckCircle, TrendingUp, Target, Award, Zap } from 'lucide-react';
import styles from './page.module.css';

export default function EarningsPage() {
    const { user } = useAuth();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetch(`/api/dashboard?userId=${user.id}`)
                .then(res => res.json())
                .then(data => {
                    setLeads(data.leads);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [user]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const commissionEarned = leads
        .filter((l) => l.commissionPaid)
        .reduce((sum, l) => sum + (l.commissionAmount || 0), 0);

    const commissionPending = leads
        .filter((l) => l.commissionAmount && !l.commissionPaid)
        .reduce((sum, l) => sum + (l.commissionAmount || 0), 0);

    const commissionForecast = leads
        .filter((l) => ['submitted', 'pre_validated', 'partner_review', 'approved'].includes(l.currentStatus))
        .length * 5000; // Estimated R5000 per lead average for forecast

    const payoutHistory = leads
        .filter((l) => l.commissionPaid && l.paidAt)
        .sort((a, b) => new Date(b.paidAt!).getTime() - new Date(a.paidAt!).getTime());

    if (loading) {
        return <div className={styles.loading}>Loading earnings data...</div>;
    }

    // Calculate funded clients this month
    const fundedThisMonth = leads.filter(l => 
        l.currentStatus === 'commission_earned' || l.currentStatus === 'contract_signed'
    ).length;

    // Determine current tier
    let currentTier = 1;
    let tierBonus = 0;
    let tierLabel = '1-9 clients';
    if (fundedThisMonth >= 30) {
        currentTier = 4;
        tierBonus = 15000;
        tierLabel = '30+ clients';
    } else if (fundedThisMonth >= 20) {
        currentTier = 3;
        tierBonus = 10000;
        tierLabel = '20-29 clients';
    } else if (fundedThisMonth >= 10) {
        currentTier = 2;
        tierBonus = 5000;
        tierLabel = '10-19 clients';
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h2 className={styles.title}>Earnings &amp; Commission Structure</h2>
                <p className={styles.subtitle}>
                    Track your commissions, incentives, and performance against KPIs.
                </p>
            </header>

            {/* KPI REQUIREMENT BANNER */}
            <div className={styles.kpiBanner}>
                <div className={styles.kpiIcon}>
                    <Target size={32} />
                </div>
                <div className={styles.kpiContent}>
                    <h3 className={styles.kpiTitle}>Weekly Performance Target</h3>
                    <p className={styles.kpiText}>
                        Minimum requirement: <strong>20 qualified businesses per week</strong>
                    </p>
                    <p className={styles.kpiSubtext}>
                        Qualified = submitted with complete documentation and utility bills
                    </p>
                </div>
                <div className={styles.kpiStatus}>
                    <span className={styles.kpiBadge}>KPI Active</span>
                </div>
            </div>

            {/* COMMISSION STRUCTURE SECTION */}
            <section className={styles.commissionSection}>
                <div className={styles.sectionHeader}>
                    <Award size={24} className={styles.sectionIcon} />
                    <h3 className={styles.sectionTitle}>Commission &amp; Incentive Structure</h3>
                </div>
                
                <div className={styles.commissionGrid}>
                    <div className={styles.commissionCard}>
                        <div className={styles.commissionHeader}>
                            <Zap size={20} />
                            <span>Base Commission</span>
                        </div>
                        <div className={styles.commissionAmount}>R2,000</div>
                        <p className={styles.commissionDesc}>Per successfully funded and approved client</p>
                    </div>
                </div>

                {/* VOLUME INCENTIVE TABLE */}
                <div className={styles.incentiveTableCard}>
                    <h4 className={styles.incentiveTitle}>Volume-Based Incentives (Per Month)</h4>
                    <p className={styles.incentiveSubtitle}>
                        Earn additional bonuses when you reach these monthly funded client milestones
                    </p>
                    
                    <div className={styles.tierGrid}>
                        <div className={`${styles.tierCard} ${currentTier === 1 ? styles.tierCurrent : ''}`}>
                            <div className={styles.tierRange}>1 – 9</div>
                            <div className={styles.tierBonus}>No Bonus</div>
                            <div className={styles.tierCalculation}>R2,000 × clients</div>
                            {currentTier === 1 && <span className={styles.tierBadge}>Current Tier</span>}
                        </div>
                        
                        <div className={`${styles.tierCard} ${currentTier === 2 ? styles.tierCurrent : ''}`}>
                            <div className={styles.tierRange}>10 – 19</div>
                            <div className={styles.tierBonus}>+ R5,000</div>
                            <div className={styles.tierCalculation}>(R2,000 × clients) + R5,000</div>
                            {currentTier === 2 && <span className={styles.tierBadge}>Current Tier</span>}
                        </div>
                        
                        <div className={`${styles.tierCard} ${currentTier === 3 ? styles.tierCurrent : ''}`}>
                            <div className={styles.tierRange}>20 – 29</div>
                            <div className={styles.tierBonus}>+ R10,000</div>
                            <div className={styles.tierCalculation}>(R2,000 × clients) + R10,000</div>
                            {currentTier === 3 && <span className={styles.tierBadge}>Current Tier</span>}
                        </div>
                        
                        <div className={`${styles.tierCard} ${currentTier === 4 ? styles.tierCurrent : ''}`}>
                            <div className={styles.tierRange}>30</div>
                            <div className={styles.tierBonus}>+ R15,000</div>
                            <div className={styles.tierCalculation}>R75,000 total</div>
                            {currentTier === 4 && <span className={styles.tierBadge}>Current Tier</span>}
                        </div>
                    </div>

                    <div className={styles.incentiveNotes}>
                        <p><strong>Important Notes:</strong></p>
                        <ul>
                            <li>Volume bonuses are paid within <strong>72 hours</strong> of the last funded client verification</li>
                            <li>Bonuses are <strong>objective and non-discretionary</strong> – strictly based on funded clients per calendar month</li>
                            <li>Contractors exceeding 30 clients may be eligible for <strong>additional bonuses</strong> at company discretion</li>
                            <li>Base commission applies to <strong>each</strong> successfully funded and approved client</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* CURRENT MONTH PROGRESS */}
            <section className={styles.progressSection}>
                <h3 className={styles.progressTitle}>Your Current Month Progress</h3>
                <div className={styles.progressStats}>
                    <div className={styles.progressStat}>
                        <span className={styles.progressNumber}>{fundedThisMonth}</span>
                        <span className={styles.progressLabel}>Funded Clients</span>
                        <span className={styles.progressTier}>Current: {tierLabel}</span>
                    </div>
                    <div className={styles.progressDivider} />
                    <div className={styles.progressStat}>
                        <span className={styles.progressNumber}>{formatCurrency((fundedThisMonth * 2000) + tierBonus)}</span>
                        <span className={styles.progressLabel}>Estimated Earnings</span>
                        <span className={styles.progressTier}>Base + Bonus</span>
                    </div>
                </div>
            </section>

            {/* SUMMARY CARDS */}
            <div className={styles.grid}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardTitle}>Total Paid Out</span>
                        <DollarSign className={`${styles.cardIcon} ${styles.iconSuccess}`} />
                    </div>
                    <div className={styles.cardValue}>{formatCurrency(commissionEarned)}</div>
                    <div className={styles.cardSub}>Lifetime earnings processed</div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardTitle}>Pending Payment</span>
                        <Clock className={`${styles.cardIcon} ${styles.iconWarning}`} />
                    </div>
                    <div className={styles.cardValue}>{formatCurrency(commissionPending)}</div>
                    <div className={styles.cardSub}>Confirmed but not yet paid</div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardTitle}>Pipeline Forecast</span>
                        <TrendingUp className={`${styles.cardIcon} ${styles.iconInfo}`} />
                    </div>
                    <div className={styles.cardValue}>~{formatCurrency(commissionForecast)}</div>
                    <div className={styles.cardSub}>Estimated value of active leads</div>
                </div>
            </div>

            {/* PAYOUT HISTORY */}
            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Payment History</h3>
                {payoutHistory.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>No payments have been processed yet.</p>
                    </div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Date Paid</th>
                                    <th>Business Reference</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payoutHistory.map((lead) => (
                                    <tr key={lead.id}>
                                        <td>{new Date(lead.paidAt!).toLocaleDateString()}</td>
                                        <td>{lead.businessName}</td>
                                        <td className={styles.amountCell}>{formatCurrency(lead.commissionAmount || 0)}</td>
                                        <td>
                                            <span className={styles.badgeSuccess}>Paid</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* PENDING TABLE */}
            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Pending Commissions</h3>
                {leads.filter(l => l.commissionAmount && !l.commissionPaid).length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>No pending commissions at this time.</p>
                    </div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Date Confirmed</th>
                                    <th>Business Reference</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.filter(l => l.commissionAmount && !l.commissionPaid).map((lead) => (
                                    <tr key={lead.id}>
                                        <td>{new Date(lead.statusHistory.find(h => h.status === 'contract_signed')?.timestamp || '').toLocaleDateString()}</td>
                                        <td>{lead.businessName}</td>
                                        <td className={styles.amountCell}>{formatCurrency(lead.commissionAmount || 0)}</td>
                                        <td>
                                            <span className={styles.badgeWarning}>Pending</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}
