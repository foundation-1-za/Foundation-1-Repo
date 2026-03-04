'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Lead } from '@/lib/types';
import { 
    BarChart3, 
    TrendingUp, 
    Users, 
    Target, 
    Calendar,
    DollarSign,
    Activity,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import styles from './page.module.css';

interface AnalyticsData {
    totalLeads: number;
    leadsThisMonth: number;
    leadsThisWeek: number;
    conversionRate: number;
    avgTimeToFund: number;
    topPerformingDay: string;
    weeklyTrend: number[];
    monthlyTrend: number[];
    statusBreakdown: {
        submitted: number;
        inProgress: number;
        approved: number;
        rejected: number;
    };
}

export default function AnalyticsPage() {
    const { user } = useAuth();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

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

    // Calculate analytics from leads data
    const calculateAnalytics = (): AnalyticsData => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const leadsThisMonth = leads.filter(l => new Date(l.submittedAt) >= monthAgo).length;
        const leadsThisWeek = leads.filter(l => new Date(l.submittedAt) >= weekAgo).length;

        // Status breakdown
        const submitted = leads.filter(l => l.currentStatus === 'submitted').length;
        const inProgress = leads.filter(l => ['pre_validated', 'partner_review'].includes(l.currentStatus)).length;
        const approved = leads.filter(l => ['approved', 'contract_signed', 'commission_earned'].includes(l.currentStatus)).length;
        const rejected = leads.filter(l => ['rejected', 'pre_validation_failed'].includes(l.currentStatus)).length;

        // Conversion rate
        const total = leads.length;
        const conversionRate = total > 0 ? Math.round((approved / total) * 100) : 0;

        // Weekly trend (last 7 days)
        const weeklyTrend = Array(7).fill(0).map((_, i) => {
            const date = new Date(now);
            date.setDate(date.getDate() - (6 - i));
            return leads.filter(l => {
                const leadDate = new Date(l.submittedAt);
                return leadDate.toDateString() === date.toDateString();
            }).length;
        });

        // Monthly trend (last 4 weeks)
        const monthlyTrend = Array(4).fill(0).map((_, i) => {
            const weekStart = new Date(now);
            weekStart.setDate(weekStart.getDate() - (3 - i) * 7);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 7);
            return leads.filter(l => {
                const leadDate = new Date(l.submittedAt);
                return leadDate >= weekStart && leadDate < weekEnd;
            }).length;
        });

        return {
            totalLeads: leads.length,
            leadsThisMonth,
            leadsThisWeek,
            conversionRate,
            avgTimeToFund: 14, // Mock data
            topPerformingDay: 'Wednesday', // Mock data
            weeklyTrend,
            monthlyTrend,
            statusBreakdown: { submitted, inProgress, approved, rejected }
        };
    };

    const analytics = calculateAnalytics();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Calculate earnings based on R2,000 per funded client
    const estimatedEarnings = leads.filter(l => 
        ['approved', 'contract_signed', 'commission_earned'].includes(l.currentStatus)
    ).length * 2000;

    if (loading) {
        return <div className={styles.loading}>Loading analytics...</div>;
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerIcon}>
                    <BarChart3 size={32} />
                </div>
                <div>
                    <h1 className={styles.title}>Performance Analytics</h1>
                    <p className={styles.subtitle}>
                        Track your sales performance and lead conversion metrics
                    </p>
                </div>
            </header>

            {/* TIME RANGE SELECTOR */}
            <div className={styles.timeRangeSelector}>
                <button 
                    className={`${styles.timeButton} ${timeRange === 'week' ? styles.timeButtonActive : ''}`}
                    onClick={() => setTimeRange('week')}
                >
                    This Week
                </button>
                <button 
                    className={`${styles.timeButton} ${timeRange === 'month' ? styles.timeButtonActive : ''}`}
                    onClick={() => setTimeRange('month')}
                >
                    This Month
                </button>
                <button 
                    className={`${styles.timeButton} ${timeRange === 'quarter' ? styles.timeButtonActive : ''}`}
                    onClick={() => setTimeRange('quarter')}
                >
                    This Quarter
                </button>
            </div>

            {/* KPI CARDS */}
            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <div className={styles.kpiIcon}>
                        <Users size={20} />
                    </div>
                    <div className={styles.kpiContent}>
                        <span className={styles.kpiLabel}>Total Leads</span>
                        <span className={styles.kpiValue}>{analytics.totalLeads}</span>
                        <span className={styles.kpiChange}>
                            <ArrowUpRight size={14} />
                            +{analytics.leadsThisMonth} this month
                        </span>
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={styles.kpiIcon}>
                        <Target size={20} />
                    </div>
                    <div className={styles.kpiContent}>
                        <span className={styles.kpiLabel}>Conversion Rate</span>
                        <span className={styles.kpiValue}>{analytics.conversionRate}%</span>
                        <span className={styles.kpiSubtext}>
                            {analytics.statusBreakdown.approved} of {analytics.totalLeads} approved
                        </span>
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={styles.kpiIcon}>
                        <DollarSign size={20} />
                    </div>
                    <div className={styles.kpiContent}>
                        <span className={styles.kpiLabel}>Est. Earnings</span>
                        <span className={styles.kpiValue}>{formatCurrency(estimatedEarnings)}</span>
                        <span className={styles.kpiSubtext}>
                            Based on {Math.round(estimatedEarnings / 2000)} funded clients
                        </span>
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={styles.kpiIcon}>
                        <Activity size={20} />
                    </div>
                    <div className={styles.kpiContent}>
                        <span className={styles.kpiLabel}>This Week</span>
                        <span className={styles.kpiValue}>{analytics.leadsThisWeek}</span>
                        <span className={styles.kpiSubtext}>
                            Target: 20/week
                        </span>
                    </div>
                </div>
            </div>

            {/* CHARTS SECTION */}
            <div className={styles.chartsGrid}>
                {/* SUBMISSION TREND */}
                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <TrendingUp size={20} />
                        <h3>Submission Trend</h3>
                    </div>
                    <div className={styles.chartBody}>
                        <div className={styles.barChart}>
                            {analytics.weeklyTrend.map((count, index) => {
                                const max = Math.max(...analytics.weeklyTrend, 5);
                                const height = max > 0 ? (count / max) * 100 : 0;
                                const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                                return (
                                    <div key={index} className={styles.barContainer}>
                                        <div className={styles.barWrapper}>
                                            <div 
                                                className={styles.bar}
                                                style={{ height: `${height}%` }}
                                            />
                                        </div>
                                        <span className={styles.barLabel}>{dayNames[index]}</span>
                                        <span className={styles.barValue}>{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* STATUS BREAKDOWN */}
                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <Calendar size={20} />
                        <h3>Lead Status Breakdown</h3>
                    </div>
                    <div className={styles.statusGrid}>
                        <div className={styles.statusItem}>
                            <div className={styles.statusDot} style={{ backgroundColor: 'var(--color-info)' }} />
                            <div className={styles.statusInfo}>
                                <span className={styles.statusLabel}>Submitted</span>
                                <span className={styles.statusCount}>{analytics.statusBreakdown.submitted}</span>
                            </div>
                        </div>
                        <div className={styles.statusItem}>
                            <div className={styles.statusDot} style={{ backgroundColor: 'var(--color-warning)' }} />
                            <div className={styles.statusInfo}>
                                <span className={styles.statusLabel}>In Progress</span>
                                <span className={styles.statusCount}>{analytics.statusBreakdown.inProgress}</span>
                            </div>
                        </div>
                        <div className={styles.statusItem}>
                            <div className={styles.statusDot} style={{ backgroundColor: 'var(--color-success)' }} />
                            <div className={styles.statusInfo}>
                                <span className={styles.statusLabel}>Approved</span>
                                <span className={styles.statusCount}>{analytics.statusBreakdown.approved}</span>
                            </div>
                        </div>
                        <div className={styles.statusItem}>
                            <div className={styles.statusDot} style={{ backgroundColor: 'var(--color-error)' }} />
                            <div className={styles.statusInfo}>
                                <span className={styles.statusLabel}>Rejected</span>
                                <span className={styles.statusCount}>{analytics.statusBreakdown.rejected}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* INSIGHTS SECTION */}
            <div className={styles.insightsSection}>
                <h3 className={styles.insightsTitle}>Performance Insights</h3>
                <div className={styles.insightsGrid}>
                    <div className={styles.insightCard}>
                        <div className={styles.insightIcon}>
                            <TrendingUp size={24} />
                        </div>
                        <div className={styles.insightContent}>
                            <h4>Weekly Performance</h4>
                            <p>
                                You've submitted <strong>{analytics.leadsThisWeek}</strong> leads this week. 
                                {analytics.leadsThisWeek >= 20 
                                    ? ' Great job! You\'ve met your weekly target.' 
                                    : ` You need ${20 - analytics.leadsThisWeek} more to reach your target of 20.`}
                            </p>
                        </div>
                    </div>

                    <div className={styles.insightCard}>
                        <div className={styles.insightIcon}>
                            <Target size={24} />
                        </div>
                        <div className={styles.insightContent}>
                            <h4>Conversion Rate</h4>
                            <p>
                                Your conversion rate is <strong>{analytics.conversionRate}%</strong>. 
                                {analytics.conversionRate >= 30 
                                    ? ' Excellent conversion! Keep up the quality work.' 
                                    : ' Focus on qualifying leads better to improve this metric.'}
                            </p>
                        </div>
                    </div>

                    <div className={styles.insightCard}>
                        <div className={styles.insightIcon}>
                            <DollarSign size={24} />
                        </div>
                        <div className={styles.insightContent}>
                            <h4>Revenue Potential</h4>
                            <p>
                                Based on your approved leads, you've earned approximately 
                                <strong> {formatCurrency(estimatedEarnings)}</strong> in commission. 
                                Keep submitting quality leads to maximize your earnings.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
