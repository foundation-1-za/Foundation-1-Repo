import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'For Business | Foundation-1',
    description: 'Check if your South African business qualifies for zero capital expenditure solar. See the criteria, required data, and timeline.',
};

export default function ForBusinessPage() {
    return (
        <div className={styles.page}>
            {/* HERO */}
            <section className={styles.hero}>
                <div className={styles.heroInner}>
                    <div className={styles.heroContent}>
                        <h1 className={styles.pageTitle}>
                            For business.<br />
                            Solar eligibility.
                        </h1>
                        <p className={styles.pageSubtitle}>
                            Generocity is built for commercial and industrial entities with high energy
                            requirements and established operational history.
                        </p>
                    </div>
                    <div className={styles.heroAction}>
                        <Link href="/for-business/apply" className="btn btn--primary btn--lg">
                            Register Business
                        </Link>
                    </div>
                </div>
            </section>

            {/* QUALIFICATION */}
            <section className="section">
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Qualification criteria</h2>
                        <p className={styles.sectionSubtitle}>
                            Your business must meet all of the following to qualify for Generocity —
                            zero capital expenditure solar by Foundation-1.
                        </p>
                    </div>

                    <div className={styles.qualGrid}>
                        <div className={styles.qualCard}>
                            <h3 className={styles.qualCardTitle}>Operational footprint</h3>
                            <p className={styles.qualCardText}>
                                Warehouses, manufacturing hubs, retail centres, or logistics
                                facilities within South Africa.
                            </p>
                        </div>
                        <div className={styles.qualCard}>
                            <h3 className={styles.qualCardTitle}>Energy threshold</h3>
                            <p className={styles.qualCardText}>
                                Average monthly electricity spend exceeding R15,000 to ensure
                                system viability.
                            </p>
                        </div>
                        <div className={styles.qualCard}>
                            <h3 className={styles.qualCardTitle}>Space availability</h3>
                            <p className={styles.qualCardText}>
                                Adequate unshaded roof area or ground space for high-yield
                                panel placement.
                            </p>
                        </div>
                        <div className={styles.qualCard}>
                            <h3 className={styles.qualCardTitle}>Entity standing</h3>
                            <p className={styles.qualCardText}>
                                Registered PTY Ltd or CC with a minimum of 24 months
                                operational history.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* DISQUALIFICATION */}
            <section className={`section ${styles.disqualSection}`}>
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Exclusion criteria</h2>
                        <p className={styles.sectionSubtitle}>
                            The following will disqualify a business from the programme.
                        </p>
                    </div>

                    <div className={styles.disqualGrid}>
                        <div className={styles.disqualCard}>
                            <span className={styles.disqualX}>✕</span>
                            <span className={styles.disqualLabel}>Residential properties</span>
                        </div>
                        <div className={styles.disqualCard}>
                            <span className={styles.disqualX}>✕</span>
                            <span className={styles.disqualLabel}>Spend below R15,000/mo</span>
                        </div>
                        <div className={styles.disqualCard}>
                            <span className={styles.disqualX}>✕</span>
                            <span className={styles.disqualLabel}>New startups (&lt; 2 years)</span>
                        </div>
                        <div className={styles.disqualCard}>
                            <span className={styles.disqualX}>✕</span>
                            <span className={styles.disqualLabel}>Structural limitations</span>
                        </div>
                        <div className={styles.disqualCard}>
                            <span className={styles.disqualX}>✕</span>
                            <span className={styles.disqualLabel}>Under administration</span>
                        </div>
                        <div className={styles.disqualCard}>
                            <span className={styles.disqualX}>✕</span>
                            <span className={styles.disqualLabel}>Outside South Africa</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* REQUIRED DATA */}
            <section className="section">
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Required documentation</h2>
                        <p className={styles.sectionSubtitle}>
                            Have these ready before submitting your business for review.
                        </p>
                    </div>

                    <div className={styles.dataGrid}>
                        <div className={styles.dataCard}>
                            <div className={styles.dataNumber}>01</div>
                            <h3 className={styles.dataCardTitle}>Business registration</h3>
                            <p className={styles.dataCardText}>
                                Company registration certificates, VAT number, and
                                physical premises address.
                            </p>
                        </div>
                        <div className={styles.dataCard}>
                            <div className={styles.dataNumber}>02</div>
                            <h3 className={styles.dataCardTitle}>Decision-maker contact</h3>
                            <p className={styles.dataCardText}>
                                Direct contact details for the person authorized to approve
                                energy agreements.
                            </p>
                        </div>
                        <div className={styles.dataCard}>
                            <div className={styles.dataNumber}>03</div>
                            <h3 className={styles.dataCardTitle}>Utility history</h3>
                            <p className={styles.dataCardText}>
                                Minimum 3 months of consecutive utility bills for
                                load profiling and system sizing.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* TIMELINE */}
            <section className="section">
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Expected timeline</h2>
                        <p className={styles.sectionSubtitle}>
                            From submission to solar generation.
                        </p>
                    </div>

                    <div className={styles.timelineGrid}>
                        <div className={styles.timelineCard}>
                            <h3 className={styles.timelineCardTitle}>Pre-approval</h3>
                            <span className={styles.timelineTime}>1–3 business days</span>
                        </div>
                        <div className={styles.timelineCard}>
                            <h3 className={styles.timelineCardTitle}>Feasibility audit</h3>
                            <span className={styles.timelineTime}>2–4 weeks</span>
                        </div>
                        <div className={styles.timelineCard}>
                            <h3 className={styles.timelineCardTitle}>Deployment</h3>
                            <span className={styles.timelineTime}>4–8 weeks</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className={styles.finalCta}>
                <div className="container">
                    <h2 className={styles.finalCtaTitle}>
                        Ready to check eligibility?
                    </h2>
                    <p className={styles.finalCtaText}>
                        Submit your business details and we’ll confirm your Generocity qualification
                        within 72 hours.
                    </p>
                    <Link href="/for-business/apply" className="btn btn--primary btn--lg" id="cta-submit-interest">
                        Register interest
                    </Link>
                </div>
            </section>
        </div>
    );
}
