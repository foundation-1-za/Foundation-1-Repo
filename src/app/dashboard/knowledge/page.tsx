'use client';

import React, { useState } from 'react';
import { 
    BookOpen, 
    Target, 
    CheckCircle, 
    AlertCircle, 
    DollarSign, 
    Users,
    Zap,
    Building2,
    FileText,
    TrendingUp,
    XCircle,
    HelpCircle,
    ChevronDown,
    ChevronRight,
    Award,
    Clock,
    ShieldCheck,
    Briefcase
} from 'lucide-react';
import styles from './page.module.css';

interface SectionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

function Section({ title, icon, children, defaultOpen = false }: SectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    
    return (
        <div className={styles.section}>
            <button 
                className={styles.sectionHeader}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className={styles.sectionTitle}>
                    {icon}
                    <h3>{title}</h3>
                </div>
                {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            {isOpen && (
                <div className={styles.sectionContent}>
                    {children}
                </div>
            )}
        </div>
    );
}

export default function KnowledgePage() {
    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerIcon}>
                    <BookOpen size={32} />
                </div>
                <div>
                    <h1 className={styles.title}>Knowledge Base</h1>
                    <p className={styles.subtitle}>
                        Everything you need to know to succeed as a Generocity Sales Representative
                    </p>
                </div>
            </header>

            {/* QUICK REFERENCE CARDS */}
            <div className={styles.quickRefGrid}>
                <div className={styles.quickRefCard}>
                    <div className={styles.quickRefIcon}>
                        <Target size={24} />
                    </div>
                    <h4>Weekly Target</h4>
                    <p className={styles.quickRefValue}>20</p>
                    <p className={styles.quickRefLabel}>Qualified Businesses</p>
                </div>

                <div className={styles.quickRefCard}>
                    <div className={styles.quickRefIcon}>
                        <DollarSign size={24} />
                    </div>
                    <h4>Commission</h4>
                    <p className={styles.quickRefValue}>R2,000</p>
                    <p className={styles.quickRefLabel}>Per Qualified Lead</p>
                </div>

                <div className={styles.quickRefCard}>
                    <div className={styles.quickRefIcon}>
                        <Building2 size={24} />
                    </div>
                    <h4>Min. Bill Required</h4>
                    <p className={styles.quickRefValue}>R15,000</p>
                    <p className={styles.quickRefLabel}>Monthly Electricity</p>
                </div>

                <div className={styles.quickRefCard}>
                    <div className={styles.quickRefIcon}>
                        <FileText size={24} />
                    </div>
                    <h4>Documents</h4>
                    <p className={styles.quickRefValue}>6 Months</p>
                    <p className={styles.quickRefLabel}>Utility Bills Required</p>
                </div>
            </div>

            {/* MAIN CONTENT SECTIONS */}
            <div className={styles.sectionsContainer}>
                
                {/* WHAT IS GENEROCITY */}
                <Section 
                    title="What is Generocity?" 
                    icon={<Zap size={20} />}
                    defaultOpen={true}
                >
                    <div className={styles.contentBlock}>
                        <p className={styles.leadText}>
                            Generocity operates in partnership with <strong>Green Share Virtual Power Plant</strong>, 
                            an energy trading business with a growing generation portfolio across utility-scale, 
                            commercial and industrial, and residential sectors.
                        </p>
                        
                        <div className={styles.highlightBox}>
                            <ShieldCheck size={24} className={styles.highlightIcon} />
                            <div>
                                <h4>Zero Capital Expenditure Model</h4>
                                <p>
                                    Green Share enables financed energy solutions through an approved facility with 
                                    <strong> Nedbank</strong>, administered via Nedbank's Utility and Facilities Management Service.
                                </p>
                            </div>
                        </div>

                        <p>
                            This allows qualifying customers to access a <strong>zero capital expenditure solar and battery solution</strong>. 
                            Under this structure:
                        </p>

                        <ul className={styles.benefitList}>
                            <li>
                                <CheckCircle size={16} />
                                <span>Solar photovoltaic panels and battery systems installed at <strong>no upfront cost</strong></span>
                            </li>
                            <li>
                                <CheckCircle size={16} />
                                <span>Recovery through a <strong>Power Purchase Agreement</strong></span>
                            </li>
                            <li>
                                <CheckCircle size={16} />
                                <span>Customers pay only for energy consumed at a <strong>lower tariff than City Power</strong></span>
                            </li>
                            <li>
                                <CheckCircle size={16} />
                                <span>Immediate and sustained electricity cost reduction</span>
                            </li>
                            <li>
                                <CheckCircle size={16} />
                                <span><strong>No ownership, financing, or balance sheet exposure</strong> for the customer</span>
                            </li>
                        </ul>
                    </div>
                </Section>

                {/* YOUR ROLE */}
                <Section 
                    title="Your Role: Lead Generation Only" 
                    icon={<Briefcase size={20} />}
                >
                    <div className={styles.contentBlock}>
                        <div className={styles.importantNotice}>
                            <AlertCircle size={20} />
                            <p>
                                <strong>Important:</strong> You are a <span className={styles.highlightText}>Lead Generator</span>, 
                                not a closer. Your job is to find interest, not to close deals.
                            </p>
                        </div>

                        <h4 className={styles.subSectionTitle}>What You DO:</h4>
                        <ul className={styles.taskList}>
                            <li className={styles.taskItem}>
                                <CheckCircle size={18} className={styles.doIcon} />
                                <span>Identify registered businesses (small, medium, large enterprises)</span>
                            </li>
                            <li className={styles.taskItem}>
                                <CheckCircle size={18} className={styles.doIcon} />
                                <span>Speak directly to decision-makers (owners, founders, executives)</span>
                            </li>
                            <li className={styles.taskItem}>
                                <CheckCircle size={18} className={styles.doIcon} />
                                <span>Confirm interest in a zero-cost solar solution</span>
                            </li>
                            <li className={styles.taskItem}>
                                <CheckCircle size={18} className={styles.doIcon} />
                                <span>Verify existence of 6 months utility bills</span>
                            </li>
                            <li className={styles.taskItem}>
                                <CheckCircle size={18} className={styles.doIcon} />
                                <span>Hand over qualified, interested businesses to the closing team</span>
                            </li>
                        </ul>

                        <h4 className={styles.subSectionTitle}>What You DON'T Do:</h4>
                        <ul className={styles.taskList}>
                            <li className={styles.taskItem}>
                                <XCircle size={18} className={styles.dontIcon} />
                                <span>Close deals or negotiate contracts</span>
                            </li>
                            <li className={styles.taskItem}>
                                <XCircle size={18} className={styles.dontIcon} />
                                <span>Convince skeptics or handle objections</span>
                            </li>
                            <li className={styles.taskItem}>
                                <XCircle size={18} className={styles.dontIcon} />
                                <span>Process paperwork or manage installations</span>
                            </li>
                        </ul>

                        <div className={styles.keyMessage}>
                            <HelpCircle size={20} />
                            <p>
                                You do not close. You do not convince skeptics. You find businesses that are 
                                <strong> already open</strong> to the solution.
                            </p>
                        </div>
                    </div>
                </Section>

                {/* QUALIFIED BUSINESS CRITERIA */}
                <Section 
                    title="What Counts as a Qualified Business?" 
                    icon={<CheckCircle size={20} />}
                    defaultOpen={true}
                >
                    <div className={styles.contentBlock}>
                        <p className={styles.leadText}>
                            A qualified business is any <strong>registered South African business</strong> that meets 
                            ALL of the following criteria:
                        </p>

                        <div className={styles.criteriaGrid}>
                            <div className={styles.criteriaCard}>
                                <div className={styles.criteriaNumber}>1</div>
                                <div className={styles.criteriaContent}>
                                    <h4>Registered Business</h4>
                                    <p>Must be a legally registered business entity with a valid registration number</p>
                                </div>
                            </div>

                            <div className={styles.criteriaCard}>
                                <div className={styles.criteriaNumber}>2</div>
                                <div className={styles.criteriaContent}>
                                    <h4>Operational</h4>
                                    <p>Business must be actively operating (not dormant or closing down)</p>
                                </div>
                            </div>

                            <div className={styles.criteriaCard}>
                                <div className={styles.criteriaNumber}>3</div>
                                <div className={styles.criteriaContent}>
                                    <h4>6 Month Utility Bills</h4>
                                    <p>Must have 6 consecutive months of electricity bills available</p>
                                </div>
                            </div>

                            <div className={styles.criteriaCard}>
                                <div className={styles.criteriaNumber}>4</div>
                                <div className={styles.criteriaContent}>
                                    <h4>Min. R15,000/Month</h4>
                                    <p>Monthly electricity bill must be R15,000 or more</p>
                                </div>
                            </div>

                            <div className={styles.criteriaCard}>
                                <div className={styles.criteriaNumber}>5</div>
                                <div className={styles.criteriaContent}>
                                    <h4>Expressed Interest</h4>
                                    <p>Decision-maker has clearly expressed interest in zero-cost solar</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.warningBox}>
                            <AlertCircle size={20} />
                            <div>
                                <h4>That is the filter. Nothing else.</h4>
                                <p>
                                    Do not overthink it. If they meet these 5 criteria, submit the lead. 
                                    If they don't, move on to the next business.
                                </p>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* WHO WE WANT */}
                <Section 
                    title="Who We're Looking For" 
                    icon={<Users size={20} />}
                >
                    <div className={styles.contentBlock}>
                        <h4 className={styles.subSectionTitle}>We Want:</h4>
                        <ul className={styles.profileList}>
                            <li>
                                <TrendingUp size={18} />
                                <span>Top-performing sales or business development personalities</span>
                            </li>
                            <li>
                                <Zap size={18} />
                                <span>Confident communicators who don't hesitate or fumble</span>
                            </li>
                            <li>
                                <Building2 size={18} />
                                <span>People comfortable dealing with owners, founders, and executives</span>
                            </li>
                            <li>
                                <Target size={18} />
                                <span>Relentless follow-up and zero excuse mentality</span>
                            </li>
                            <li>
                                <Clock size={18} />
                                <span>Fully self-managed in a remote environment</span>
                            </li>
                        </ul>

                        <div className={styles.divider} />

                        <h4 className={styles.subSectionTitle}>We DON'T Care About:</h4>
                        <div className={styles.dontCareGrid}>
                            <span className={styles.dontCareItem}>❌ Degrees</span>
                            <span className={styles.dontCareItem}>❌ Diplomas</span>
                            <span className={styles.dontCareItem}>❌ Certificates</span>
                            <span className={styles.dontCareItem}>❌ Academic background</span>
                            <span className={styles.dontCareItem}>❌ Corporate pedigree</span>
                        </div>

                        <div className={styles.keyMessage}>
                            <Award size={20} />
                            <p>
                                <strong>If you can produce qualified interest, you are qualified.</strong>
                            </p>
                        </div>
                    </div>
                </Section>

                {/* COMPENSATION */}
                <Section 
                    title="Compensation & Performance" 
                    icon={<DollarSign size={20} />}
                    defaultOpen={true}
                >
                    <div className={styles.contentBlock}>
                        <div className={styles.compensationHighlight}>
                            <h2>R2,000</h2>
                            <p>Commission per qualified business handed over</p>
                        </div>

                        <div className={styles.performanceSection}>
                            <h4 className={styles.subSectionTitle}>Weekly Target</h4>
                            <div className={styles.targetBox}>
                                <Target size={32} />
                                <div>
                                    <p className={styles.targetNumber}>20</p>
                                    <p className={styles.targetLabel}>Qualified Businesses Per Week</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.importantNotice}>
                            <AlertCircle size={20} />
                            <div>
                                <h4>About Performance & Penalties</h4>
                                <p>
                                    You <strong>will</strong> still get paid if you underperform. However, 
                                    consistent underperformance will trigger penalties. If you continue to miss 
                                    targets week after week, your payout rate will be reduced.
                                </p>
                                <p className={styles.penaltyNote}>
                                    Bottom line: <strong>Make the effort. Submit quality leads. Get paid.</strong>
                                </p>
                            </div>
                        </div>

                        <div className={styles.volumeBonusReminder}>
                            <TrendingUp size={20} />
                            <p>
                                Don't forget: You also earn <strong>volume bonuses</strong> when you hit monthly targets! 
                                Check your Earnings page for the full breakdown.
                            </p>
                        </div>
                    </div>
                </Section>

                {/* GETTING STARTED */}
                <Section 
                    title="Getting Started Checklist" 
                    icon={<BookOpen size={20} />}
                >
                    <div className={styles.contentBlock}>
                        <div className={styles.checklist}>
                            <label className={styles.checklistItem}>
                                <input type="checkbox" defaultChecked readOnly />
                                <span>Sign your Independent Contractor Agreement</span>
                            </label>
                            <label className={styles.checklistItem}>
                                <input type="checkbox" />
                                <span>Review this Knowledge Base thoroughly</span>
                            </label>
                            <label className={styles.checklistItem}>
                                <input type="checkbox" />
                                <span>Get your referral link from the Overview page</span>
                            </label>
                            <label className={styles.checklistItem}>
                                <input type="checkbox" />
                                <span>Identify your first 20 target businesses</span>
                            </label>
                            <label className={styles.checklistItem}>
                                <input type="checkbox" />
                                <span>Start calling and submit your first lead</span>
                            </label>
                        </div>

                        <div className={styles.ctaBox}>
                            <h4>Ready to start earning?</h4>
                            <p>Your first commission is just one qualified lead away.</p>
                            <a href="/dashboard/submit" className={styles.ctaButton}>
                                Submit Your First Lead
                            </a>
                        </div>
                    </div>
                </Section>
            </div>
        </div>
    );
}
