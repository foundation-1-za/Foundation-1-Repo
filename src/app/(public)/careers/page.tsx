import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'Careers | Foundation-1',
    description: 'Join Foundation-1 as an independent sales representative. Commission-based, performance-tracked, and directly contributing to South Africa\'s energy transition.',
};

export default function CareersPage() {
    return (
        <div className={styles.page}>
            {/* HERO */}
            <section className={styles.hero}>
                <div className={styles.heroInner}>
                    <div className={styles.heroContent}>
                        <h1 className={styles.pageTitle}>
                            Careers.<br />
                            Independent sales.
                        </h1>
                        <p className={styles.pageSubtitle}>
                            Join the Generocity network of independent representatives driving South Africa’s
                            commercial solar transition. Performance-based, fully transparent.
                        </p>
                    </div>
                    <div className={styles.heroAction}>
                        <Link href="/careers/apply" className="btn btn--primary btn--lg">
                            Apply Now
                        </Link>
                    </div>
                </div>
            </section>

            {/* THE ROLE */}
            <section className="section">
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>The role</h2>
                        <p className={styles.sectionSubtitle}>
                            You operate as an independent partner within the Generocity programme.
                            We provide the platform, tools, and pipeline infrastructure.
                        </p>
                    </div>

                    <div className={styles.roleGrid}>
                        <div className={styles.roleCard}>
                            <h3 className={styles.roleCardTitle}>Independent operation</h3>
                            <p className={styles.roleCardText}>
                                Manage your own schedule, territory, and client relationships.
                                No office requirement, no fixed hours.
                            </p>
                        </div>
                        <div className={styles.roleCard}>
                            <h3 className={styles.roleCardTitle}>Uncapped commission</h3>
                            <p className={styles.roleCardText}>
                                Earning potential is directly proportional to the value you
                                bring. No ceiling on what you can earn.
                            </p>
                        </div>
                        <div className={styles.roleCard}>
                            <h3 className={styles.roleCardTitle}>Real-time dashboard</h3>
                            <p className={styles.roleCardText}>
                                Track every lead, milestone, and commission through a
                                dedicated partner portal.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* COMPENSATION PROCESS */}
            <section className="section">
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>How commission works</h2>
                        <p className={styles.sectionSubtitle}>
                            From lead submission to payout in four steps.
                        </p>
                    </div>

                    <div className={styles.compGrid}>
                        <div className={styles.compCard}>
                            <div className={styles.compNumber}>1</div>
                            <h3 className={styles.compCardTitle}>Identify &amp; submit</h3>
                            <p className={styles.compCardText}>
                                Submit qualified commercial leads through the partner portal.
                            </p>
                        </div>
                        <div className={styles.compCard}>
                            <div className={styles.compNumber}>2</div>
                            <h3 className={styles.compCardTitle}>Technical review</h3>
                            <p className={styles.compCardText}>
                                Leads are validated through partner feasibility audits.
                            </p>
                        </div>
                        <div className={styles.compCard}>
                            <div className={styles.compNumber}>3</div>
                            <h3 className={styles.compCardTitle}>Contract closing</h3>
                            <p className={styles.compCardText}>
                                Commission is confirmed upon successful agreement signing.
                            </p>
                        </div>
                        <div className={styles.compCard}>
                            <div className={styles.compNumber}>4</div>
                            <h3 className={styles.compCardTitle}>Payout</h3>
                            <p className={styles.compCardText}>
                                Earned commissions are paid on a transparent schedule.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SUCCESS CRITERIA */}
            <section className="section">
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Lead standards</h2>
                        <p className={styles.sectionSubtitle}>
                            What makes a qualified lead — and what doesn't.
                        </p>
                    </div>

                    <div className={styles.criteriaGrid}>
                        <div className={styles.criteriaCard}>
                            <h3 className={styles.criteriaCardTitle}>Qualified lead</h3>
                            <div className={styles.criteriaList}>
                                <div className={styles.criteriaItem}>
                                    <span className={styles.criteriaCheck}>✓</span>
                                    <span>Verified commercial business entity.</span>
                                </div>
                                <div className={styles.criteriaItem}>
                                    <span className={styles.criteriaCheck}>✓</span>
                                    <span>Complete decision-maker contact details.</span>
                                </div>
                                <div className={styles.criteriaItem}>
                                    <span className={styles.criteriaCheck}>✓</span>
                                    <span>Recent, accurate utility consumption data.</span>
                                </div>
                                <div className={styles.criteriaItem}>
                                    <span className={styles.criteriaCheck}>✓</span>
                                    <span>Confirmed interest in zero-capex solar.</span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.criteriaCard}>
                            <h3 className={styles.criteriaCardTitle}>Common rejections</h3>
                            <div className={styles.criteriaList}>
                                <div className={styles.criteriaItem}>
                                    <span className={styles.criteriaX}>✕</span>
                                    <span>Residential or small-scale commercial.</span>
                                </div>
                                <div className={styles.criteriaItem}>
                                    <span className={styles.criteriaX}>✕</span>
                                    <span>Inaccurate or missing contact information.</span>
                                </div>
                                <div className={styles.criteriaItem}>
                                    <span className={styles.criteriaX}>✕</span>
                                    <span>Missing 3-month utility bill history.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* EXPECTATIONS */}
            <section className="section">
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Expectations</h2>
                        <p className={styles.sectionSubtitle}>
                            What we expect from every representative in the network.
                        </p>
                    </div>

                    <div className={styles.expectGrid}>
                        <div className={styles.expectCard}>
                            <h3 className={styles.expectCardTitle}>Professional integrity</h3>
                            <p className={styles.expectCardText}>
                                You represent the Foundation-1 brand. Accuracy and professional
                                ethics are non-negotiable.
                            </p>
                        </div>
                        <div className={styles.expectCard}>
                            <h3 className={styles.expectCardTitle}>Data compliance</h3>
                            <p className={styles.expectCardText}>
                                Strict adherence to POPIA regulations during all data collection
                                and lead submission.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className={styles.finalCta}>
                <div className="container">
                    <h2 className={styles.finalCtaTitle}>
                        Ready to join the network?
                    </h2>
                    <p className={styles.finalCtaText}>
                        Register as an independent Generocity representative and start submitting
                        qualified leads.
                    </p>
                    <Link href="/careers/apply" className="btn btn--primary btn--lg" id="cta-register">
                        Apply as representative
                    </Link>
                </div>
            </section>
        </div>
    );
}
