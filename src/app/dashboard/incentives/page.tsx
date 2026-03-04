'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Lead } from '@/lib/types';
import { 
    Award, 
    TrendingUp, 
    Zap, 
    Target, 
    DollarSign, 
    CheckCircle,
    AlertCircle,
    Calendar,
    Users
} from 'lucide-react';
import styles from './page.module.css';

export default function IncentivesPage() {
    const { user } = useAuth();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
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

    // Calculate monthly funded clients
    const getMonthStart = () => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    };

    const monthStart = getMonthStart();
    const fundedThisMonth = leads.filter(l => 
        l.currentStatus === 'commission_earned' || l.currentStatus === 'contract_signed'
    ).filter(l => new Date(l.submittedAt) >= monthStart).length;

    // Calculate pipeline (submitted but not yet funded)
    const pipelineCount = leads.filter(l => 
        ['submitted', 'pre_validated', 'partner_review', 'approved'].includes(l.currentStatus)
    ).length;

    // Determine current tier and next tier info
    const getTierInfo = (count: number) => {
        if (count >= 30) {
            return {
                current: 4,
                tier: '30+',
                bonus: 15000,
                label: 'Elite Performer',
                nextThreshold: null,
                progress: 100,
                earnings: (count * 2000) + 15000
            };
        } else if (count >= 20) {
            return {
                current: 3,
                tier: '20-29',
                bonus: 10000,
                label: 'Top Performer',
                nextThreshold: 30,
                progress: ((count - 20) / 10) * 100,
                earnings: (count * 2000) + 10000
            };
        } else if (count >= 10) {
            return {
                current: 2,
                tier: '10-19',
                bonus: 5000,
                label: 'Rising Star',
                nextThreshold: 20,
                progress: ((count - 10) / 10) * 100,
                earnings: (count * 2000) + 5000
            };
        } else {
            return {
                current: 1,
                tier: '1-9',
                bonus: 0,
                label: 'Starter',
                nextThreshold: 10,
                progress: (count / 10) * 100,
                earnings: count * 2000
            };
        }
    };

    const currentTier = getTierInfo(fundedThisMonth);
    const nextTier = currentTier.nextThreshold ? getTierInfo(currentTier.nextThreshold) : null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (loading) {
        return <div className={styles.loading}>Loading incentives data...</div>;
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerIcon}>
                    <Award size={32} />
                </div>
                <div>
                    <h1 className={styles.title}>Commission & Incentives</h1>
                    <p className={styles.subtitle}>
                        Your earnings structure and bonus opportunities
                    </p>
                </div>
            </header>

            {/* CURRENT PERFORMANCE SUMMARY */}
            <section className={styles.performanceSection}>
                <div className={styles.performanceHeader}>
                    <Calendar size={20} />
                    <h3>This Month's Performance</h3>
                </div>
                
                <div className={styles.performanceGrid}>
                    <div className={styles.performanceCard}>
                        <div className={styles.performanceLabel}>Funded Clients</div>
                        <div className={styles.performanceValue}>{fundedThisMonth}</div>
                        <div className={styles.performanceTier}>{currentTier.label}</div>
                    </div>
                    
                    <div className={styles.performanceCard}>
                        <div className={styles.performanceLabel}>Base Commission</div>
                        <div className={styles.performanceValue}>{formatCurrency(fundedThisMonth * 2000)}</div>
                        <div className={styles.performanceSubtext}>R2,000 × {fundedThisMonth} clients</div>
                    </div>
                    
                    <div className={styles.performanceCard}>
                        <div className={styles.performanceLabel}>Volume Bonus</div>
                        <div className={`${styles.performanceValue} ${currentTier.bonus > 0 ? styles.performanceBonus : ''}`}>
                            {currentTier.bonus > 0 ? formatCurrency(currentTier.bonus) : '-'}
                        </div>
                        <div className={styles.performanceSubtext}>
                            {currentTier.bonus > 0 ? `${currentTier.tier} tier bonus` : 'Reach 10 clients for bonus'}
                        </div>
                    </div>
                    
                    <div className={`${styles.performanceCard} ${styles.performanceCardTotal}`}>
                        <div className={styles.performanceLabel}>Total Earnings</div>
                        <div className={styles.performanceValue}>{formatCurrency(currentTier.earnings)}</div>
                        <div className={styles.performanceSubtext}>Estimated this month</div>
                    </div>
                </div>

                {nextTier && (
                    <div className={styles.nextTierBanner}>
                        <div className={styles.nextTierInfo}>
                            <TrendingUp size={20} />
                            <div>
                                <strong>{nextTier.tier} Tier:</strong> {currentTier.nextThreshold! - fundedThisMonth} more clients needed
                            </div>
                        </div>
                        <div className={styles.nextTierReward}>
                            +{formatCurrency(nextTier.bonus - currentTier.bonus)} bonus
                        </div>
                    </div>
                )}
            </section>

            {/* TIER STRUCTURE */}
            <section className={styles.tierSection}>
                <div className={styles.sectionHeader}>
                    <Zap size={24} className={styles.sectionIcon} />
                    <h2>Volume Bonus Tiers</h2>
                </div>
                
                <div className={styles.tierGrid}>
                    <div className={`${styles.tierCard} ${currentTier.current === 1 ? styles.tierCardActive : ''}`}>
                        <div className={styles.tierHeader}>
                            <span className={styles.tierNumber}>1-9</span>
                            <span className={styles.tierName}>Starter</span>
                        </div>
                        <div className={styles.tierBonus}>
                            <span className={styles.tierBonusAmount}>No Bonus</span>
                        </div>
                        <div className={styles.tierCalculation}>
                            R2,000 × clients = Base only
                        </div>
                        <div className={styles.tierProgress}>
                            <div 
                                className={styles.tierProgressBar} 
                                style={{ width: currentTier.current === 1 ? `${currentTier.progress}%` : (fundedThisMonth >= 10 ? '100%' : '0%') }}
                            />
                        </div>
                    </div>

                    <div className={`${styles.tierCard} ${currentTier.current === 2 ? styles.tierCardActive : ''}`}>
                        <div className={styles.tierHeader}>
                            <span className={styles.tierNumber}>10-19</span>
                            <span className={styles.tierName}>Rising Star</span>
                        </div>
                        <div className={styles.tierBonus}>
                            <span className={styles.tierBonusAmount}>+ R5,000</span>
                        </div>
                        <div className={styles.tierCalculation}>
                            (R2,000 × 10) + R5,000 = R25,000
                        </div>
                        <div className={styles.tierExample}>
                            Example at 10 clients
                        </div>
                        <div className={styles.tierProgress}>
                            <div 
                                className={styles.tierProgressBar} 
                                style={{ width: currentTier.current === 2 ? `${currentTier.progress}%` : (fundedThisMonth >= 20 ? '100%' : '0%') }}
                            />
                        </div>
                    </div>

                    <div className={`${styles.tierCard} ${currentTier.current === 3 ? styles.tierCardActive : ''}`}>
                        <div className={styles.tierHeader}>
                            <span className={styles.tierNumber}>20-29</span>
                            <span className={styles.tierName}>Top Performer</span>
                        </div>
                        <div className={styles.tierBonus}>
                            <span className={styles.tierBonusAmount}>+ R10,000</span>
                        </div>
                        <div className={styles.tierCalculation}>
                            (R2,000 × 20) + R10,000 = R50,000
                        </div>
                        <div className={styles.tierExample}>
                            Example at 20 clients
                        </div>
                        <div className={styles.tierProgress}>
                            <div 
                                className={styles.tierProgressBar} 
                                style={{ width: currentTier.current === 3 ? `${currentTier.progress}%` : (fundedThisMonth >= 30 ? '100%' : '0%') }}
                            />
                        </div>
                    </div>

                    <div className={`${styles.tierCard} ${currentTier.current === 4 ? styles.tierCardActive : ''}`}>
                        <div className={styles.tierHeader}>
                            <span className={styles.tierNumber}>30+</span>
                            <span className={styles.tierName}>Elite Performer</span>
                        </div>
                        <div className={styles.tierBonus}>
                            <span className={styles.tierBonusAmount}>+ R15,000</span>
                        </div>
                        <div className={styles.tierCalculation}>
                            (R2,000 × 30) + R15,000 = R75,000
                        </div>
                        <div className={styles.tierExample}>
                            Example at 30 clients
                        </div>
                        <div className={styles.tierProgress}>
                            <div 
                                className={styles.tierProgressBar} 
                                style={{ width: currentTier.current === 4 ? '100%' : '0%' }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* PAYMENT INFO */}
            <section className={styles.paymentSection}>
                <div className={styles.sectionHeader}>
                    <DollarSign size={24} className={styles.sectionIcon} />
                    <h2>Payment Information</h2>
                </div>
                
                <div className={styles.paymentGrid}>
                    <div className={styles.paymentCard}>
                        <div className={styles.paymentIcon}>
                            <Zap size={20} />
                        </div>
                        <h4>Base Commission</h4>
                        <p>R2,000 per funded and approved client</p>
                    </div>
                    
                    <div className={styles.paymentCard}>
                        <div className={styles.paymentIcon}>
                            <Target size={20} />
                        </div>
                        <h4>Volume Bonus Timing</h4>
                        <p>Paid within 72 hours of last funded client verification</p>
                    </div>
                    
                    <div className={styles.paymentCard}>
                        <div className={styles.paymentIcon}>
                            <CheckCircle size={20} />
                        </div>
                        <h4>Bonus Guarantee</h4>
                        <p>Objective and non-discretionary based on verified counts</p>
                    </div>
                    
                    <div className={styles.paymentCard}>
                        <div className={styles.paymentIcon}>
                            <Award size={20} />
                        </div>
                        <h4>Above 30 Clients</h4>
                        <p>Additional bonuses may be awarded at company discretion</p>
                    </div>
                </div>
            </section>

            {/* QUALIFICATION REQUIREMENTS */}
            <section className={styles.qualificationSection}>
                <div className={styles.qualificationHeader}>
                    <AlertCircle size={20} />
                    <h3>What Counts as a Funded Client?</h3>
                </div>
                <p className={styles.qualificationIntro}>
                    To be counted toward your volume bonus, a client must:
                </p>
                <ul className={styles.qualificationList}>
                    <li>
                        <CheckCircle size={16} />
                        <span>Submit complete application with 6+ months utility bills</span>
                    </li>
                    <li>
                        <CheckCircle size={16} />
                        <span>Have minimum monthly electricity bill of R15,000</span>
                    </li>
                    <li>
                        <CheckCircle size={16} />
                        <span>Be a registered business entity</span>
                    </li>
                    <li>
                        <CheckCircle size={16} />
                        <span>Sign contract with Foundation-1</span>
                    </li>
                    <li>
                        <CheckCircle size={16} />
                        <span>Complete installation and verification</span>
                    </li>
                </ul>
            </section>

            {/* WEEKLY KPI REMINDER */}
            <section className={styles.kpiSection}>
                <div className={styles.kpiCard}>
                    <div className={styles.kpiIconLarge}>
                        <Users size={32} />
                    </div>
                    <div className={styles.kpiContent}>
                        <h3>Weekly KPI Target</h3>
                        <p className={styles.kpiTarget}>20 qualified businesses per week</p>
                        <p className={styles.kpiDescription}>
                            Consistent weekly submissions help you reach higher monthly bonus tiers
                        </p>
                    </div>
                    <div className={styles.kpiVisual}>
                        <div className={styles.kpiVisualText}>Target: 20/week</div>
                        <div className={styles.kpiVisualSub}>80/month = Elite tier</div>
                    </div>
                </div>
            </section>

            {/* PIPELINE SECTION */}
            {pipelineCount > 0 && (
                <section className={styles.pipelineSection}>
                    <h3 className={styles.pipelineTitle}>Your Pipeline</h3>
                    <p className={styles.pipelineText}>
                        You have <strong>{pipelineCount}</strong> leads in progress. 
                        These could contribute to next month's bonus calculation.
                    </p>
                </section>
            )}
        </div>
    );
}
