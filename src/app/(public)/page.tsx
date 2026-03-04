import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function HomePage() {
    return (
        <>
            {/* ===== HERO ===== */}
            <section className={styles.hero}>
                <div className={styles.heroInner}>
                    <h1 className={styles.heroTitle}>
                        Introducing Generocity.<br />
                        Solar for your business.<br />
                        Zero capital expenditure.
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Foundation-1 presents Generocity — fully funded solar
                        installations for qualifying South African businesses, in partnership
                        with Green Share VPP. No upfront cost, immediate energy savings.
                    </p>
                    <div className={styles.heroCtas}>
                        <Link href="/for-business" className="btn btn--primary btn--lg" id="cta-for-business">
                            For Businesses
                        </Link>
                        <Link href="/careers" className="btn btn--secondary btn--lg" id="cta-careers">
                            Careers
                        </Link>
                    </div>
                </div>
            </section>

            {/* ===== VALUE EXPLANATION ===== */}
            <section className={`section ${styles.valueSection}`}>
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>What zero capital expenditure means</h2>
                        <p className={styles.sectionSubtitle}>
                            Your business gets a solar installation with no upfront payment, no financing
                            applications, and no balance sheet impact.
                        </p>
                    </div>

                    <div className={styles.valueGrid}>
                        <div className={styles.valueCard}>
                            <div className={styles.valueNumber}>01</div>
                            <h3 className={styles.valueCardTitle}>No upfront cost</h3>
                            <p className={styles.valueCardText}>
                                The entire solar system — panels, inverters, installation — is funded through
                                our finance partner. Your business pays nothing to get started.
                            </p>
                        </div>
                        <div className={styles.valueCard}>
                            <div className={styles.valueNumber}>02</div>
                            <h3 className={styles.valueCardTitle}>Immediate savings</h3>
                            <p className={styles.valueCardText}>
                                From day one, you reduce your electricity bill. The solar system generates
                                power that offsets your grid consumption directly.
                            </p>
                        </div>
                        <div className={styles.valueCard}>
                            <div className={styles.valueNumber}>03</div>
                            <h3 className={styles.valueCardTitle}>No maintenance burden</h3>
                            <p className={styles.valueCardText}>
                                System monitoring, maintenance, and performance guarantees are handled
                                entirely by the installation partner. You focus on your business.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== WHO THIS IS FOR ===== */}
            <section className={`section ${styles.whoSection}`}>
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Who this is for</h2>
                        <p className={styles.sectionSubtitle}>
                            Generocity by Foundation-1 is designed for commercial and industrial businesses in South Africa
                            that meet specific qualification criteria. This is not a residential product.
                        </p>
                    </div>

                    <div className={styles.whoGrid}>
                        <div className={styles.whoCard}>
                            <h3 className={styles.whoCardTitle}>Commercial premises</h3>
                            <p className={styles.whoCardText}>Warehouses, factories, retail centres, or logistics facilities.</p>
                        </div>
                        <div className={styles.whoCard}>
                            <h3 className={styles.whoCardTitle}>R15,000+ monthly spend</h3>
                            <p className={styles.whoCardText}>Minimum monthly electricity expenditure to qualify.</p>
                        </div>
                        <div className={styles.whoCard}>
                            <h3 className={styles.whoCardTitle}>Suitable roof or ground space</h3>
                            <p className={styles.whoCardText}>Unshaded area for high-yield panel placement.</p>
                        </div>
                        <div className={styles.whoCard}>
                            <h3 className={styles.whoCardTitle}>2+ years operating</h3>
                            <p className={styles.whoCardText}>Registered PTY Ltd or CC with established history.</p>
                        </div>
                        <div className={styles.whoCard}>
                            <h3 className={styles.whoCardTitle}>South African entity</h3>
                            <p className={styles.whoCardText}>Business must be based and operating within South Africa.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== PROCESS ===== */}
            <section className="section">
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>The process</h2>
                        <p className={styles.sectionSubtitle}>
                            From first contact to energy savings in four clear steps.
                        </p>
                    </div>

                    <div className={styles.processGrid}>
                        <div className={styles.processStep}>
                            <div className={styles.processStepNumber}>1</div>
                            <h3 className={styles.processStepTitle}>Business qualification</h3>
                            <p className={styles.processStepText}>
                                Your business details are assessed against strict criteria to ensure
                                eligibility for zero capital expenditure solar.
                            </p>
                        </div>
                        <div className={styles.processStep}>
                            <div className={styles.processStepNumber}>2</div>
                            <h3 className={styles.processStepTitle}>Partner feasibility</h3>
                            <p className={styles.processStepText}>
                                Green Share VPP conducts a technical and financial feasibility assessment
                                of your premises.
                            </p>
                        </div>
                        <div className={styles.processStep}>
                            <div className={styles.processStepNumber}>3</div>
                            <h3 className={styles.processStepTitle}>Installation</h3>
                            <p className={styles.processStepText}>
                                Approved projects proceed to system design and professional installation
                                with zero cost to you.
                            </p>
                        </div>
                        <div className={styles.processStep}>
                            <div className={styles.processStepNumber}>4</div>
                            <h3 className={styles.processStepTitle}>Ongoing savings</h3>
                            <p className={styles.processStepText}>
                                Your system generates clean energy, reducing your electricity costs
                                from day one with ongoing monitoring.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== CREDIBILITY ===== */}
            <section className={`section ${styles.credSection}`}>
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Backed by established partners</h2>
                    </div>

                    <div className={styles.credGrid}>
                        <div className={styles.credCard}>
                            <h3 className={styles.credCardTitle}>Green Share VPP</h3>
                            <p className={styles.credCardText}>
                                Our installation and operations partner. Responsible for system design,
                                deployment, monitoring, and ongoing maintenance of every solar installation.
                            </p>
                        </div>
                        <div className={styles.credCard}>
                            <h3 className={styles.credCardTitle}>Nedbank Facility</h3>
                            <p className={styles.credCardText}>
                                All installations are financed through a dedicated Nedbank facility.
                                Institutional-grade financing ensures reliability and long-term commitment.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FINAL CTA ===== */}
            <section className={styles.finalCta}>
                <div className="container">
                    <h2 className={styles.finalCtaTitle}>
                        Ready to reduce your energy costs?
                    </h2>
                    <p className={styles.finalCtaText}>
                        Find out if your business qualifies for Generocity — zero capital expenditure solar by Foundation-1.
                    </p>
                    <Link href="/for-business" className="btn btn--primary btn--lg" id="cta-final">
                        Check eligibility
                    </Link>
                </div>
            </section>
        </>
    );
}
