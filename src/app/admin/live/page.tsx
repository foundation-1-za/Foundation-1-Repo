'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Lead, User, LeadStatus } from '@/lib/types';
import { 
    Activity, Zap, TrendingUp, Users, Clock, AlertCircle, 
    CheckCircle, DollarSign, BarChart3, MapPin, Wifi, 
    WifiOff, Play, Pause, RefreshCw, Bell, ArrowUpRight,
    ArrowDownRight, ArrowRightLeft, Target, Flame, Award, Phone, FileText,
    UserCheck, Timer, MoreHorizontal, Filter, Maximize2,
    Minimize2, XCircle, PauseCircle, PlayCircle
} from 'lucide-react';
import styles from './page.module.css';

// ==========================================
// TYPES - Real-time specific
// ==========================================
type ActivityType = 'lead_submitted' | 'status_changed' | 'commission_earned' | 'agent_login' | 'document_uploaded' | 'contract_signed' | 'payment_received';

interface LiveActivity {
    id: string;
    type: ActivityType;
    message: string;
    user?: string;
    amount?: number;
    timestamp: Date;
    metadata?: any;
}

interface AgentLiveStatus {
    agent: User;
    isOnline: boolean;
    lastActive: Date;
    currentAction?: string;
    leadsToday: number;
    dealsClosedToday: number;
}

interface DealFlow {
    stage: LeadStatus;
    count: number;
    velocity: number; // deals per hour
    trend: 'up' | 'down' | 'stable';
}

interface SystemHealth {
    status: 'healthy' | 'warning' | 'critical';
    activeUsers: number;
    serverLoad: number;
    lastUpdate: Date;
}

// ==========================================
// MOCK REAL-TIME DATA GENERATOR
// ==========================================
const ACTIVITY_MESSAGES: Record<ActivityType, string[]> = {
    lead_submitted: [
        'New business lead submitted',
        'Hot lead just came in',
        'New prospect registered',
        'Lead captured from website'
    ],
    status_changed: [
        'Lead status updated',
        'Deal moved to next stage',
        'Progress recorded',
        'Status transition completed'
    ],
    commission_earned: [
        'Commission earned! 💰',
        'Deal closed - commission triggered',
        'Revenue recognized',
        'Sales rep just got paid'
    ],
    agent_login: [
        'Sales rep logged in',
        'Agent started their day',
        'Team member online',
        'New session started'
    ],
    document_uploaded: [
        'Document uploaded',
        'Utility bill received',
        'New file added',
        'Paperwork submitted'
    ],
    contract_signed: [
        'Contract signed! 🎉',
        'Deal finalized',
        'Agreement executed',
        'Contract completed'
    ],
    payment_received: [
        'Payment received',
        'Revenue collected',
        'Funds deposited',
        'Transaction complete'
    ]
};

const BUSINESS_NAMES = [
    'Sunset Manufacturing', 'Golden Farms Ltd', 'SilverTech Solutions', 
    'Blue Horizon Logistics', 'Peak Performance Gym', 'Apex Construction',
    'Nova Energy Corp', 'Titanium Works', 'Vertex Solutions'
];

const AGENT_ACTIONS = [
    'Submitting new lead...',
    'Reviewing documents...',
    'On call with client...',
    'Updating deal status...',
    'Uploading contract...',
    'Idle'
];

// ==========================================
// COMPONENTS
// ==========================================

// Pulse Animation for Live Indicator
function LivePulse() {
    return (
        <div className={styles.pulseContainer}>
            <div className={styles.pulse} />
            <div className={styles.pulseRing} />
        </div>
    );
}

// Activity Item Component
function ActivityItem({ activity }: { activity: LiveActivity }) {
    const getIcon = () => {
        switch (activity.type) {
            case 'lead_submitted': return <Users size={16} className={styles.activityIconBlue} />;
            case 'commission_earned': return <DollarSign size={16} className={styles.activityIconGreen} />;
            case 'contract_signed': return <CheckCircle size={16} className={styles.activityIconGold} />;
            case 'payment_received': return <TrendingUp size={16} className={styles.activityIconPurple} />;
            default: return <Activity size={16} className={styles.activityIconGray} />;
        }
    };

    const getAmount = () => {
        if (activity.amount) {
            return (
                <span className={styles.activityAmount}>
                    {activity.amount > 0 ? '+' : ''}R{Math.abs(activity.amount).toLocaleString()}
                </span>
            );
        }
        return null;
    };

    const timeAgo = () => {
        const seconds = Math.floor((new Date().getTime() - activity.timestamp.getTime()) / 1000);
        if (seconds < 10) return 'Just now';
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        return `${Math.floor(seconds / 3600)}h ago`;
    };

    return (
        <div className={styles.activityItem}>
            <div className={styles.activityIcon}>{getIcon()}</div>
            <div className={styles.activityContent}>
                <div className={styles.activityHeader}>
                    <span className={styles.activityMessage}>{activity.message}</span>
                    {getAmount()}
                </div>
                <div className={styles.activityMeta}>
                    <span className={styles.activityUser}>{activity.user}</span>
                    <span className={styles.activityTime}>{timeAgo()}</span>
                </div>
            </div>
        </div>
    );
}

// Agent Card Component
function AgentCard({ status }: { status: AgentLiveStatus }) {
    return (
        <div className={`${styles.agentCard} ${status.isOnline ? styles.online : styles.offline}`}>
            <div className={styles.agentHeader}>
                <div className={styles.agentAvatar}>
                    {status.agent.firstName[0]}{status.agent.lastName[0]}
                </div>
                <div className={styles.agentInfo}>
                    <span className={styles.agentName}>{status.agent.firstName} {status.agent.lastName}</span>
                    <div className={styles.agentStatus}>
                        {status.isOnline ? (
                            <><div className={styles.onlineDot} /> Online</>
                        ) : (
                            <><WifiOff size={10} /> Offline</>
                        )}
                    </div>
                </div>
            </div>
            <div className={styles.agentStats}>
                <div className={styles.agentStat}>
                    <span className={styles.statLabel}>Today</span>
                    <span className={styles.statValue}>{status.leadsToday} leads</span>
                </div>
                <div className={styles.agentStat}>
                    <span className={styles.statLabel}>Closed</span>
                    <span className={styles.statValue}>{status.dealsClosedToday}</span>
                </div>
            </div>
            {status.isOnline && status.currentAction && (
                <div className={styles.agentAction}>
                    <div className={styles.actionPulse} />
                    {status.currentAction}
                </div>
            )}
        </div>
    );
}

// Deal Flow Stage Component
function DealFlowStage({ flow, index }: { flow: DealFlow; index: number }) {
    const getTrendIcon = () => {
        if (flow.trend === 'up') return <ArrowUpRight size={14} className={styles.trendUp} />;
        if (flow.trend === 'down') return <ArrowDownRight size={14} className={styles.trendDown} />;
        return <span className={styles.trendStable}>→</span>;
    };

    return (
        <div className={styles.flowStage}>
            <div className={styles.stageNumber}>{index + 1}</div>
            <div className={styles.stageContent}>
                <div className={styles.stageName}>{flow.stage.replace(/_/g, ' ')}</div>
                <div className={styles.stageMetrics}>
                    <span className={styles.stageCount}>{flow.count}</span>
                    <span className={styles.stageVelocity}>{flow.velocity}/hr {getTrendIcon()}</span>
                </div>
                <div className={styles.stageBar}>
                    <div 
                        className={styles.stageFill} 
                        style={{ width: `${Math.min(flow.count * 5, 100)}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

// Alert Banner Component
function AlertBanner({ message, type }: { message: string; type: 'success' | 'warning' | 'info' }) {
    const alertClass = type === 'success' ? styles.alertSuccess : 
                       type === 'warning' ? styles.alertWarning : styles.alertInfo;
    
    return (
        <div className={`${styles.alertBanner} ${alertClass}`}>
            {type === 'success' && <CheckCircle size={16} />}
            {type === 'warning' && <AlertCircle size={16} />}
            {type === 'info' && <Bell size={16} />}
            <span>{message}</span>
        </div>
    );
}

// Real-time Ticker Component
function RevenueTicker({ value, label }: { value: number; label: string }) {
    const [displayValue, setDisplayValue] = useState(value);
    
    useEffect(() => {
        setDisplayValue(value);
    }, [value]);

    return (
        <div className={styles.ticker}>
            <span className={styles.tickerLabel}>{label}</span>
            <span className={styles.tickerValue}>R{displayValue.toLocaleString()}</span>
        </div>
    );
}

// ==========================================
// MAIN LIVE COMMAND CENTER
// ==========================================
export default function LiveCommandCenter() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [activities, setActivities] = useState<LiveActivity[]>([]);
    const [agentStatuses, setAgentStatuses] = useState<AgentLiveStatus[]>([]);
    const [dealFlows, setDealFlows] = useState<DealFlow[]>([]);
    const [systemHealth, setSystemHealth] = useState<SystemHealth>({
        status: 'healthy',
        activeUsers: 0,
        serverLoad: 15,
        lastUpdate: new Date()
    });
    const [isLive, setIsLive] = useState(true);
    const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
    const [alerts, setAlerts] = useState<{message: string; type: 'success' | 'warning' | 'info'}[]>([]);
    const [todayRevenue, setTodayRevenue] = useState(0);
    const [todayCommissions, setTodayCommissions] = useState(0);
    
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Initial data fetch
    useEffect(() => {
        fetchData();
    }, []);

    // Real-time simulation loop
    useEffect(() => {
        if (!isLive) return;

        const interval = speed === 'slow' ? 5000 : speed === 'fast' ? 1500 : 3000;
        
        intervalRef.current = setInterval(() => {
            simulateRealTimeActivity();
        }, interval);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isLive, speed, leads, users]);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/admin');
            const data = await res.json();
            setLeads(data.leads || []);
            setUsers(data.users || []);
            
            // Initialize agent statuses
            const agents = (data.users || []).filter((u: User) => u.role === 'sales_rep');
            setAgentStatuses(agents.map((agent: User) => ({
                agent,
                isOnline: Math.random() > 0.3,
                lastActive: new Date(),
                currentAction: AGENT_ACTIONS[Math.floor(Math.random() * AGENT_ACTIONS.length)],
                leadsToday: Math.floor(Math.random() * 5),
                dealsClosedToday: Math.floor(Math.random() * 3)
            })));
            
            // Initialize deal flows
            const stages = ['submitted', 'pre_validated', 'partner_review', 'approved', 'contract_signed', 'commission_earned'];
            setDealFlows(stages.map(stage => ({
                stage: stage as LeadStatus,
                count: Math.floor(Math.random() * 20) + 5,
                velocity: Math.random() * 3,
                trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable'
            })));
            
            // Add initial activities
            generateInitialActivities(agents);
            
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
    };

    const generateInitialActivities = (agents: User[]) => {
        const initialActivities: LiveActivity[] = [];
        const types = Object.keys(ACTIVITY_MESSAGES) as ActivityType[];
        
        for (let i = 0; i < 10; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            initialActivities.push({
                id: `act_${Date.now()}_${i}`,
                type,
                message: ACTIVITY_MESSAGES[type][Math.floor(Math.random() * ACTIVITY_MESSAGES[type].length)],
                user: agents[Math.floor(Math.random() * agents.length)]?.firstName + ' ' + agents[Math.floor(Math.random() * agents.length)]?.lastName || 'System',
                amount: type === 'commission_earned' || type === 'payment_received' ? Math.floor(Math.random() * 50000) + 10000 : undefined,
                timestamp: new Date(Date.now() - i * 60000),
                metadata: {}
            });
        }
        
        setActivities(initialActivities);
    };

    const simulateRealTimeActivity = () => {
        // Generate new activity
        const types = Object.keys(ACTIVITY_MESSAGES) as ActivityType[];
        const type = types[Math.floor(Math.random() * types.length)];
        const agents = users.filter(u => u.role === 'sales_rep');
        
        const newActivity: LiveActivity = {
            id: `act_${Date.now()}`,
            type,
            message: ACTIVITY_MESSAGES[type][Math.floor(Math.random() * ACTIVITY_MESSAGES[type].length)],
            user: agents[Math.floor(Math.random() * agents.length)]?.firstName + ' ' + agents[Math.floor(Math.random() * agents.length)]?.lastName || 'System',
            amount: type === 'commission_earned' ? 2000 : type === 'payment_received' ? Math.floor(Math.random() * 100000) + 50000 : undefined,
            timestamp: new Date(),
            metadata: {
                businessName: BUSINESS_NAMES[Math.floor(Math.random() * BUSINESS_NAMES.length)]
            }
        };
        
        setActivities(prev => [newActivity, ...prev].slice(0, 50)); // Keep last 50
        
        // Update revenue if commission earned
        if (type === 'commission_earned') {
            setTodayCommissions(prev => prev + 2000);
            setTodayRevenue(prev => prev + 150000); // Average deal size
            
            // Add success alert
            setAlerts((prev: { message: string; type: 'info' | 'success' | 'warning' }[]) => [{
                message: `💰 Deal closed! Commission earned: R2,000`,
                type: 'success' as const
            }, ...prev].slice(0, 3));
        }
        
        // Update agent statuses randomly
        setAgentStatuses(prev => prev.map(status => ({
            ...status,
            isOnline: Math.random() > 0.1, // 90% stay online
            currentAction: Math.random() > 0.7 ? AGENT_ACTIONS[Math.floor(Math.random() * AGENT_ACTIONS.length)] : status.currentAction,
            leadsToday: type === 'lead_submitted' && Math.random() > 0.5 ? status.leadsToday + 1 : status.leadsToday,
            dealsClosedToday: type === 'commission_earned' && Math.random() > 0.7 ? status.dealsClosedToday + 1 : status.dealsClosedToday
        })));
        
        // Update system health
        setSystemHealth({
            status: Math.random() > 0.95 ? 'warning' : 'healthy',
            activeUsers: Math.floor(Math.random() * 20) + 5,
            serverLoad: Math.floor(Math.random() * 40) + 10,
            lastUpdate: new Date()
        });
        
        // Randomly update deal flow velocity
        setDealFlows(prev => prev.map(flow => ({
            ...flow,
            velocity: Math.max(0, flow.velocity + (Math.random() - 0.5)),
            count: type === 'status_changed' && Math.random() > 0.5 ? flow.count + 1 : flow.count,
            trend: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'up' : 'down') : flow.trend
        })));
    };

    const getActiveAgents = () => agentStatuses.filter(a => a.isOnline).length;
    const getTotalLeadsToday = () => agentStatuses.reduce((sum, a) => sum + a.leadsToday, 0);
    const getTotalClosedToday = () => agentStatuses.reduce((sum, a) => sum + a.dealsClosedToday, 0);

    return (
        <div className={styles.livePage}>
            {/* Header */}
            <header className={styles.liveHeader}>
                <div className={styles.headerLeft}>
                    <LivePulse />
                    <div>
                        <h1 className={styles.liveTitle}>LIVE COMMAND CENTER</h1>
                        <span className={styles.liveSubtitle}>Real-time business intelligence</span>
                    </div>
                </div>
                
                <div className={styles.headerCenter}>
                    <div className={styles.tickerContainer}>
                        <RevenueTicker value={todayRevenue} label="Today's Revenue" />
                        <RevenueTicker value={todayCommissions} label="Today's Commissions" />
                    </div>
                </div>
                
                <div className={styles.headerRight}>
                    <div className={styles.systemStatus}>
                        <div className={`${styles.healthDot} ${styles[systemHealth.status]}`} />
                        <span className={styles.healthText}>
                            {systemHealth.status === 'healthy' ? 'Systems Optimal' : 'Check Systems'}
                        </span>
                        <span className={styles.serverLoad}>{systemHealth.serverLoad}% load</span>
                    </div>
                    
                    <div className={styles.controls}>
                        <button 
                            className={`${styles.speedBtn} ${speed === 'slow' ? styles.active : ''}`}
                            onClick={() => setSpeed('slow')}
                        >
                            0.5x
                        </button>
                        <button 
                            className={`${styles.speedBtn} ${speed === 'normal' ? styles.active : ''}`}
                            onClick={() => setSpeed('normal')}
                        >
                            1x
                        </button>
                        <button 
                            className={`${styles.speedBtn} ${speed === 'fast' ? styles.active : ''}`}
                            onClick={() => setSpeed('fast')}
                        >
                            2x
                        </button>
                        <button 
                            className={styles.pauseBtn}
                            onClick={() => setIsLive(!isLive)}
                        >
                            {isLive ? <Pause size={18} /> : <Play size={18} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Alert Banners */}
            <div className={styles.alertsContainer}>
                {alerts.map((alert, idx) => (
                    <AlertBanner key={idx} message={alert.message} type={alert.type} />
                ))}
            </div>

            {/* Main Grid */}
            <div className={styles.mainGrid}>
                {/* Left Column - Activity Feed */}
                <div className={styles.leftColumn}>
                    <div className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <Activity size={18} />
                            <h3>Live Activity Stream</h3>
                            <span className={styles.badge}>{activities.length} events</span>
                        </div>
                        <div className={styles.activityFeed}>
                            {activities.map(activity => (
                                <ActivityItem key={activity.id} activity={activity} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Center Column - Metrics & Deal Flow */}
                <div className={styles.centerColumn}>
                    {/* Quick Stats */}
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <Users size={20} className={styles.statIcon} />
                            <div className={styles.statValueLarge}>{getActiveAgents()}</div>
                            <div className={styles.statLabelSmall}>Agents Online</div>
                        </div>
                        <div className={styles.statCard}>
                            <FileText size={20} className={styles.statIcon} />
                            <div className={styles.statValueLarge}>{getTotalLeadsToday()}</div>
                            <div className={styles.statLabelSmall}>Leads Today</div>
                        </div>
                        <div className={styles.statCard}>
                            <CheckCircle size={20} className={styles.statIcon} />
                            <div className={styles.statValueLarge}>{getTotalClosedToday()}</div>
                            <div className={styles.statLabelSmall}>Deals Closed</div>
                        </div>
                        <div className={styles.statCard}>
                            <Flame size={20} className={styles.statIcon} />
                            <div className={styles.statValueLarge}>{dealFlows.reduce((s, f) => s + f.velocity, 0).toFixed(1)}</div>
                            <div className={styles.statLabelSmall}>Deals/Hour</div>
                        </div>
                    </div>

                    {/* Deal Flow Visualization */}
                    <div className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <ArrowRightLeft size={18} />
                            <h3>Live Deal Flow</h3>
                        </div>
                        <div className={styles.dealFlowContainer}>
                            {dealFlows.map((flow, idx) => (
                                <DealFlowStage key={flow.stage} flow={flow} index={idx} />
                            ))}
                        </div>
                    </div>

                    {/* Predictive Insight */}
                    <div className={styles.insightCard}>
                        <Target size={20} className={styles.insightIcon} />
                        <div className={styles.insightContent}>
                            <h4>Predictive Insight</h4>
                            <p>
                                Based on current velocity, you should expect <strong>{Math.round(dealFlows[dealFlows.length - 1]?.velocity * 8)} deals</strong> to close in the next 8 hours. 
                                Revenue projection: <strong>R{(dealFlows[dealFlows.length - 1]?.velocity * 8 * 150000).toLocaleString()}</strong>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column - Agent Status */}
                <div className={styles.rightColumn}>
                    <div className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <UserCheck size={18} />
                            <h3>Agent Activity</h3>
                            <span className={styles.badge}>{getActiveAgents()}/{agentStatuses.length}</span>
                        </div>
                        <div className={styles.agentGrid}>
                            {agentStatuses.map(status => (
                                <AgentCard key={status.agent.id} status={status} />
                            ))}
                        </div>
                    </div>

                    {/* Performance Leaderboard */}
                    <div className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <Award size={18} />
                            <h3>Today's Leaders</h3>
                        </div>
                        <div className={styles.leaderboard}>
                            {agentStatuses
                                .sort((a, b) => b.dealsClosedToday - a.dealsClosedToday)
                                .slice(0, 3)
                                .map((status, idx) => (
                                    <div key={status.agent.id} className={styles.leaderItem}>
                                        <div className={styles.leaderRank}>#{idx + 1}</div>
                                        <div className={styles.leaderName}>{status.agent.firstName} {status.agent.lastName}</div>
                                        <div className={styles.leaderScore}>{status.dealsClosedToday} deals</div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
