'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Lead, User } from '@/lib/types';
import { 
    Trophy, Medal, Target, TrendingUp, Users, DollarSign, 
    Flame, Crown, Star, ChevronUp, ChevronDown, Zap,
    Award, BarChart3, Clock, Calendar, Filter
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import styles from './page.module.css';

// ==========================================
// TYPES
// ==========================================
type RankTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

interface AgentStats {
    agent: User;
    totalLeads: number;
    qualifiedLeads: number;
    dealsSubmitted: number;
    dealsClosed: number;
    totalDealValue: number;
    conversionRate: number;
    commissionEarned: number;
    bonusesAchieved: number;
    streakDays: number;
    rank: number;
    previousRank: number;
    tier: RankTier;
    score: number;
}

interface WeeklyPerformance {
    week: string;
    leads: number;
    deals: number;
    revenue: number;
}

// ==========================================
// RANKING CONFIGURATION
// ==========================================
const TIER_CONFIG: Record<RankTier, { name: string; color: string; minScore: number; icon: any }> = {
    bronze: { name: 'Bronze', color: '#cd7f32', minScore: 0, icon: Medal },
    silver: { name: 'Silver', color: '#c0c0c0', minScore: 1000, icon: Medal },
    gold: { name: 'Gold', color: '#ffd700', minScore: 3000, icon: Trophy },
    platinum: { name: 'Platinum', color: '#e5e4e2', minScore: 6000, icon: Crown },
    diamond: { name: 'Diamond', color: '#b9f2ff', minScore: 10000, icon: Star }
};

const DEAL_VALUE_ESTIMATE = 150000;
const COMMISSION_PER_DEAL = 2000;

// ==========================================
// COMPONENTS
// ==========================================

// Tier Badge Component
function TierBadge({ tier, size = 'md' }: { tier: RankTier; size?: 'sm' | 'md' | 'lg' }) {
    const config = TIER_CONFIG[tier];
    const Icon = config.icon;
    
    const sizeClasses = {
        sm: styles.tierBadgeSm,
        md: styles.tierBadgeMd,
        lg: styles.tierBadgeLg
    };
    
    return (
        <div 
            className={`${styles.tierBadge} ${sizeClasses[size]}`}
            style={{ 
                backgroundColor: `${config.color}20`,
                borderColor: config.color,
                color: config.color
            }}
        >
            <Icon size={size === 'lg' ? 24 : size === 'md' ? 18 : 14} />
            <span>{config.name}</span>
        </div>
    );
}

// Rank Change Indicator
function RankChange({ current, previous }: { current: number; previous: number }) {
    const diff = previous - current;
    
    if (diff > 0) {
        return (
            <div className={styles.rankUp}>
                <ChevronUp size={14} />
                <span>+{diff}</span>
            </div>
        );
    } else if (diff < 0) {
        return (
            <div className={styles.rankDown}>
                <ChevronDown size={14} />
                <span>{diff}</span>
            </div>
        );
    }
    
    return <div className={styles.rankSame}>-</div>;
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, subtext, trend }: { 
    icon: any; 
    label: string; 
    value: string | number; 
    subtext?: string;
    trend?: 'up' | 'down' | 'neutral';
}) {
    return (
        <div className={styles.statCard}>
            <div className={styles.statIcon}>
                <Icon size={20} />
            </div>
            <div className={styles.statInfo}>
                <span className={styles.statLabel}>{label}</span>
                <span className={styles.statValue}>{value}</span>
                {subtext && <span className={styles.statSubtext}>{subtext}</span>}
            </div>
            {trend && (
                <div className={`${styles.statTrend} ${styles[trend]}`}>
                    {trend === 'up' ? <ChevronUp size={16} /> : trend === 'down' ? <ChevronDown size={16} /> : '-'}
                </div>
            )}
        </div>
    );
}

// Leaderboard Row Component
function LeaderboardRow({ 
    stats, 
    isCurrentUser, 
    onClick 
}: { 
    stats: AgentStats; 
    isCurrentUser: boolean;
    onClick: () => void;
}) {
    const isTop3 = stats.rank <= 3;
    
    return (
        <div 
            className={`${styles.leaderboardRow} ${isCurrentUser ? styles.currentUser : ''} ${isTop3 ? styles.top3 : ''}`}
            onClick={onClick}
        >
            <div className={styles.rankCell}>
                {stats.rank === 1 ? (
                    <Crown size={20} className={styles.rank1} />
                ) : stats.rank === 2 ? (
                    <Medal size={20} className={styles.rank2} />
                ) : stats.rank === 3 ? (
                    <Medal size={20} className={styles.rank3} />
                ) : (
                    <span className={styles.rankNumber}>#{stats.rank}</span>
                )}
                <RankChange current={stats.rank} previous={stats.previousRank} />
            </div>
            
            <div className={styles.agentCell}>
                <div className={styles.agentAvatar}>
                    {stats.agent.firstName[0]}{stats.agent.lastName[0]}
                </div>
                <div className={styles.agentInfo}>
                    <span className={styles.agentName}>
                        {stats.agent.firstName} {stats.agent.lastName}
                    </span>
                    <TierBadge tier={stats.tier} size="sm" />
                </div>
                {isCurrentUser && <span className={styles.youBadge}>YOU</span>}
            </div>
            
            <div className={styles.scoreCell}>
                <span className={styles.scoreValue}>{stats.score.toLocaleString()}</span>
                <span className={styles.scoreLabel}>PTS</span>
            </div>
            
            <div className={styles.metricsCell}>
                <div className={styles.metric}>
                    <span className={styles.metricValue}>{stats.totalLeads}</span>
                    <span className={styles.metricLabel}>Leads</span>
                </div>
                <div className={styles.metric}>
                    <span className={styles.metricValue}>{stats.dealsClosed}</span>
                    <span className={styles.metricLabel}>Closed</span>
                </div>
                <div className={styles.metric}>
                    <span className={styles.metricValue}>R{(stats.totalDealValue / 1000000).toFixed(1)}M</span>
                    <span className={styles.metricLabel}>Value</span>
                </div>
                <div className={styles.metric}>
                    <span className={styles.metricValue}>{stats.conversionRate.toFixed(1)}%</span>
                    <span className={styles.metricLabel}>Conv.</span>
                </div>
            </div>
            
            <div className={styles.bonusCell}>
                {stats.bonusesAchieved > 0 && (
                    <div className={styles.bonusBadge}>
                        <Flame size={14} />
                        <span>{stats.bonusesAchieved}x</span>
                    </div>
                )}
            </div>
        </div>
    );
}

// Performance Chart Component (simplified bar chart)
function PerformanceChart({ data }: { data: WeeklyPerformance[] }) {
    const maxValue = Math.max(...data.map(d => d.deals));
    
    return (
        <div className={styles.chart}>
            <div className={styles.chartHeader}>
                <span>Weekly Performance</span>
                <span className={styles.chartSubtitle}>Deals Closed</span>
            </div>
            <div className={styles.chartBars}>
                {data.map((week, idx) => (
                    <div key={idx} className={styles.chartBarContainer}>
                        <div 
                            className={styles.chartBar}
                            style={{ height: `${(week.deals / maxValue) * 100}%` }}
                        >
                            <span className={styles.barValue}>{week.deals}</span>
                        </div>
                        <span className={styles.barLabel}>W{idx + 1}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ==========================================
// MAIN RANKINGS PAGE
// ==========================================
export default function RankingsPage() {
    const { user } = useAuth();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');
    const [selectedAgent, setSelectedAgent] = useState<AgentStats | null>(null);
    const [updateTime, setUpdateTime] = useState(new Date());

    // Fetch data
    useEffect(() => {
        fetchData();
        
        // Real-time updates every 30 seconds
        const interval = setInterval(() => {
            fetchData();
            setUpdateTime(new Date());
        }, 30000);
        
        return () => clearInterval(interval);
    }, [selectedPeriod]);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/leads');
            const data = await res.json();
            setLeads(data.leads || []);
            
            // Fetch users
            const usersRes = await fetch('/api/admin');
            const usersData = await usersRes.json();
            setUsers(usersData.users?.filter((u: User) => u.role === 'sales_rep') || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate agent rankings
    const agentRankings: AgentStats[] = useMemo(() => {
        const agents = users.filter(u => u.role === 'sales_rep');
        
        const stats = agents.map(agent => {
            const agentLeads = leads.filter(l => l.submittedBy === agent.id);
            
            // Filter by time period
            const now = new Date();
            let filteredLeads = agentLeads;
            
            if (selectedPeriod === 'week') {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                filteredLeads = agentLeads.filter(l => new Date(l.submittedAt) >= weekAgo);
            } else if (selectedPeriod === 'month') {
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                filteredLeads = agentLeads.filter(l => new Date(l.submittedAt) >= monthAgo);
            }
            
            const qualified = filteredLeads.filter(l => 
                !['rejected', 'pre_validation_failed'].includes(l.currentStatus)
            );
            const closed = filteredLeads.filter(l => l.currentStatus === 'commission_earned');
            const dealValue = closed.length * DEAL_VALUE_ESTIMATE;
            const commission = closed.reduce((sum, l) => sum + (l.commissionAmount || COMMISSION_PER_DEAL), 0);
            
            // Calculate bonuses (simplified - 1 bonus per 5 deals)
            const bonuses = Math.floor(closed.length / 5);
            
            // Calculate streak (simplified)
            const streak = Math.min(closed.length, 30); // Cap at 30 for demo
            
            // Calculate composite score
            // Leads: 10 pts each
            // Qualified leads: 50 pts each  
            // Closed deals: 500 pts each
            // Deal value: 1 pt per 1000
            // Conversion rate: 10 pts per %
            // Bonuses: 1000 pts each
            // Streak: 50 pts per day
            const score = 
                (filteredLeads.length * 10) +
                (qualified.length * 50) +
                (closed.length * 500) +
                (dealValue / 1000) +
                ((closed.length / Math.max(filteredLeads.length, 1)) * 1000) +
                (bonuses * 1000) +
                (streak * 50);
            
            // Determine tier
            let tier: RankTier = 'bronze';
            if (score >= 10000) tier = 'diamond';
            else if (score >= 6000) tier = 'platinum';
            else if (score >= 3000) tier = 'gold';
            else if (score >= 1000) tier = 'silver';
            
            return {
                agent,
                totalLeads: filteredLeads.length,
                qualifiedLeads: qualified.length,
                dealsSubmitted: filteredLeads.length,
                dealsClosed: closed.length,
                totalDealValue: dealValue,
                conversionRate: filteredLeads.length > 0 ? (closed.length / filteredLeads.length) * 100 : 0,
                commissionEarned: commission,
                bonusesAchieved: bonuses,
                streakDays: streak,
                rank: 0, // Will be set after sorting
                previousRank: Math.floor(Math.random() * 10) + 1, // Simulated for demo
                tier,
                score
            };
        });
        
        // Sort by score and assign ranks
        const sorted = stats.sort((a, b) => b.score - a.score);
        sorted.forEach((stat, idx) => {
            stat.rank = idx + 1;
        });
        
        return sorted;
    }, [leads, users, selectedPeriod]);

    // Get current user's stats
    const currentUserStats = useMemo(() => {
        return agentRankings.find(s => s.agent.id === user?.id);
    }, [agentRankings, user]);

    // Get top 3 for podium
    const top3 = useMemo(() => agentRankings.slice(0, 3), [agentRankings]);

    // Generate mock weekly data for chart
    const weeklyData: WeeklyPerformance[] = useMemo(() => {
        if (!currentUserStats) return [];
        
        return Array.from({ length: 8 }, (_, i) => ({
            week: `Week ${i + 1}`,
            leads: Math.floor(Math.random() * 10) + 2,
            deals: Math.floor(Math.random() * 5) + 1,
            revenue: Math.floor(Math.random() * 500000) + 100000
        }));
    }, [currentUserStats]);

    if (loading) {
        return <div className={styles.loading}>Loading rankings...</div>;
    }

    return (
        <div className={styles.page}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <Trophy size={28} className={styles.headerIcon} />
                    <div>
                        <h1 className={styles.title}>Sales Leaderboard</h1>
                        <p className={styles.subtitle}>
                            Real-time rankings • Updated {updateTime.toLocaleTimeString()}
                        </p>
                    </div>
                </div>
                
                <div className={styles.periodSelector}>
                    <button 
                        className={selectedPeriod === 'week' ? styles.active : ''}
                        onClick={() => setSelectedPeriod('week')}
                    >
                        This Week
                    </button>
                    <button 
                        className={selectedPeriod === 'month' ? styles.active : ''}
                        onClick={() => setSelectedPeriod('month')}
                    >
                        This Month
                    </button>
                    <button 
                        className={selectedPeriod === 'all' ? styles.active : ''}
                        onClick={() => setSelectedPeriod('all')}
                    >
                        All Time
                    </button>
                </div>
            </header>

            {/* Podium - Top 3 */}
            {top3.length >= 3 && (
                <div className={styles.podium}>
                    {/* 2nd Place */}
                    <div className={`${styles.podiumItem} ${styles.second}`}>
                        <div className={styles.podiumAvatar}>
                            {top3[1].agent.firstName[0]}{top3[1].agent.lastName[0]}
                        </div>
                        <Medal size={24} className={styles.silver} />
                        <span className={styles.podiumName}>{top3[1].agent.firstName}</span>
                        <span className={styles.podiumScore}>{top3[1].score.toLocaleString()} pts</span>
                        <TierBadge tier={top3[1].tier} size="sm" />
                    </div>
                    
                    {/* 1st Place */}
                    <div className={`${styles.podiumItem} ${styles.first}`}>
                        <div className={styles.podiumAvatar}>
                            {top3[0].agent.firstName[0]}{top3[0].agent.lastName[0]}
                        </div>
                        <Crown size={32} className={styles.gold} />
                        <span className={styles.podiumName}>{top3[0].agent.firstName}</span>
                        <span className={styles.podiumScore}>{top3[0].score.toLocaleString()} pts</span>
                        <TierBadge tier={top3[0].tier} size="sm" />
                    </div>
                    
                    {/* 3rd Place */}
                    <div className={`${styles.podiumItem} ${styles.third}`}>
                        <div className={styles.podiumAvatar}>
                            {top3[2].agent.firstName[0]}{top3[2].agent.lastName[0]}
                        </div>
                        <Medal size={24} className={styles.bronze} />
                        <span className={styles.podiumName}>{top3[2].agent.firstName}</span>
                        <span className={styles.podiumScore}>{top3[2].score.toLocaleString()} pts</span>
                        <TierBadge tier={top3[2].tier} size="sm" />
                    </div>
                </div>
            )}

            {/* Main Content Grid */}
            <div className={styles.contentGrid}>
                {/* Left - Leaderboard */}
                <div className={styles.leaderboardSection}>
                    <div className={styles.sectionHeader}>
                        <BarChart3 size={18} />
                        <h2>Live Rankings</h2>
                        <span className={styles.liveIndicator}>● LIVE</span>
                    </div>
                    
                    <div className={styles.leaderboard}>
                        <div className={styles.leaderboardHeader}>
                            <span>Rank</span>
                            <span>Agent</span>
                            <span>Score</span>
                            <span>Performance</span>
                            <span>Bonuses</span>
                        </div>
                        
                        {agentRankings.map(stats => (
                            <LeaderboardRow 
                                key={stats.agent.id}
                                stats={stats}
                                isCurrentUser={stats.agent.id === user?.id}
                                onClick={() => setSelectedAgent(stats)}
                            />
                        ))}
                    </div>
                </div>

                {/* Right - Your Stats */}
                {currentUserStats && (
                    <div className={styles.yourStatsSection}>
                        <div className={styles.sectionHeader}>
                            <Target size={18} />
                            <h2>Your Performance</h2>
                        </div>
                        
                        <div className={styles.yourRankCard}>
                            <div className={styles.currentRank}>
                                <span className={styles.rankLabel}>Your Rank</span>
                                <span className={styles.rankValue}>#{currentUserStats.rank}</span>
                                <span className={styles.rankTotal}>of {agentRankings.length}</span>
                            </div>
                            <TierBadge tier={currentUserStats.tier} size="lg" />
                        </div>

                        <div className={styles.statsGrid}>
                            <StatCard 
                                icon={Users}
                                label="Leads Submitted"
                                value={currentUserStats.totalLeads}
                                subtext={`${currentUserStats.qualifiedLeads} qualified`}
                                trend="up"
                            />
                            <StatCard 
                                icon={Trophy}
                                label="Deals Closed"
                                value={currentUserStats.dealsClosed}
                                subtext={`${currentUserStats.conversionRate.toFixed(1)}% conversion`}
                                trend="up"
                            />
                            <StatCard 
                                icon={DollarSign}
                                label="Deal Value"
                                value={`R${(currentUserStats.totalDealValue / 1000000).toFixed(1)}M`}
                                subtext="Total pipeline"
                                trend="up"
                            />
                            <StatCard 
                                icon={Zap}
                                label="Commission"
                                value={`R${currentUserStats.commissionEarned.toLocaleString()}`}
                                subtext={`${currentUserStats.bonusesAchieved} bonuses`}
                                trend="up"
                            />
                        </div>

                        <PerformanceChart data={weeklyData} />

                        {/* Next Tier Progress */}
                        <div className={styles.progressSection}>
                            <h4>Progress to Next Tier</h4>
                            <div className={styles.progressInfo}>
                                <TierBadge tier={currentUserStats.tier} size="sm" />
                                <span className={styles.arrow}>→</span>
                                {(() => {
                                    const tiers: RankTier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
                                    const currentIdx = tiers.indexOf(currentUserStats.tier);
                                    const nextTier = tiers[currentIdx + 1];
                                    return nextTier ? <TierBadge tier={nextTier} size="sm" /> : <span>MAX</span>;
                                })()}
                            </div>
                            <div className={styles.progressBar}>
                                <div 
                                    className={styles.progressFill}
                                    style={{ width: `${Math.min((currentUserStats.score % 1000) / 1000 * 100, 100)}%` }}
                                />
                            </div>
                            <span className={styles.progressText}>
                                {currentUserStats.score.toLocaleString()} / {(() => {
                                    const tiers: RankTier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
                                    const currentIdx = tiers.indexOf(currentUserStats.tier);
                                    const nextTier = tiers[currentIdx + 1];
                                    return nextTier ? TIER_CONFIG[nextTier].minScore.toLocaleString() : 'MAX';
                                })()} pts
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* How Scoring Works */}
            <div className={styles.scoringInfo}>
                <h3>How Rankings Work</h3>
                <div className={styles.scoringGrid}>
                    <div className={styles.scoringItem}>
                        <span className={styles.points}>+10</span>
                        <span>per Lead</span>
                    </div>
                    <div className={styles.scoringItem}>
                        <span className={styles.points}>+50</span>
                        <span>per Qualified</span>
                    </div>
                    <div className={styles.scoringItem}>
                        <span className={styles.points}>+500</span>
                        <span>per Closed Deal</span>
                    </div>
                    <div className={styles.scoringItem}>
                        <span className={styles.points}>+1000</span>
                        <span>per Bonus</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
