import React from 'react';
import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'How It Works | Foundation-1',
    description: 'Understand the zero capital expenditure solar model — ownership, installation, maintenance, and long-term energy savings for South African businesses.',
};

export default function HowItWorksPage() {
    return (
        <div className={styles.page}>
            {/* HERO */}
            <section className={styles.hero}>
                <div className={styles.heroInner}>
                    <h1 className={styles.pageTitle}>
                        How it works.<br />
                        Zero capex solar.
                    </h1>
                    <p className={styles.pageSubtitle}>
                        Generocity removes the capital barrier to renewable energy. Your business gets
                        a fully funded solar installation with immediate savings and zero risk.
                    </p>
                </div>
            </section>

            {/* THE MODEL */}
            <section className="section">
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>The financial model</h2>
                        <p className={styles.sectionSubtitle}>
                            Through Generocity, systems are financed through institutional partners. You pay only for the
                            energy produced — at a rate lower than grid.
                        </p>
                    </div>

                    <div className={styles.explainerGrid}>
                        <div className={styles.explainerCard}>
                            <div className={styles.explainerNumber}>01</div>
                            <h3 className={styles.explainerCardTitle}>Institutional financing</h3>
                            <p className={styles.explainerCardText}>
                                The solar system — panels, inverters, installation — is funded through
                                a dedicated finance facility. No deposit, no credit applications.
                            </p>
                        </div>
                        <div className={styles.explainerCard}>
                            <div className={styles.explainerNumber}>02</div>
                            <h3 className={styles.explainerCardTitle}>Tariff arbitrage</h3>
                            <p className={styles.explainerCardText}>
                                Pay for solar energy at a locked-in rate below grid tariffs.
                                Savings start from day one of operation.
                            </p>
                        </div>
                        <div className={styles.explainerCard}>
                            <div className={styles.explainerNumber}>03</div>
                            <h3 className={styles.explainerCardTitle}>Full risk coverage</h3>
                            <p className={styles.explainerCardText}>
                                Maintenance, insurance, and performance monitoring are included.
                                If the system doesn't produce, you don't pay.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* PROCESS */}
            <section className="section">
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Implementation process</h2>
                        <p className={styles.sectionSubtitle}>
                            From assessment to operation in three structured phases.
                        </p>
                    </div>

                    <div className={styles.processGrid}>
                        <div className={styles.processStep}>
                            <div className={styles.processStepNumber}>1</div>
                            <h3 className={styles.processStepTitle}>Feasibility audit</h3>
                            <p className={styles.processStepText}>
                                Technical assessment of roof integrity, grid connection capacity,
                                and historical energy consumption patterns.
                            </p>
                        </div>
                        <div className={styles.processStep}>
                            <div className={styles.processStepNumber}>2</div>
                            <h3 className={styles.processStepTitle}>System engineering</h3>
                            <p className={styles.processStepText}>
                                Custom design optimized for your specific load profile and seasonal
                                consumption patterns.
                            </p>
                        </div>
                        <div className={styles.processStep}>
                            <div className={styles.processStepNumber}>3</div>
                            <h3 className={styles.processStepTitle}>Deployment &amp; monitoring</h3>
                            <p className={styles.processStepText}>
                                Professional installation by accredited teams, followed by ongoing
                                remote monitoring for maximum yield.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* OWNERSHIP */}
            <section className="section">
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Ownership structure</h2>
                        <p className={styles.sectionSubtitle}>
                            Clear terms during the agreement period and a defined path to asset transfer.
                        </p>
                    </div>

                    <div className={styles.ownershipGrid}>
                        <div className={styles.ownershipCard}>
                            <h3 className={styles.ownershipCardTitle}>During the agreement</h3>
                            <div className={styles.ownershipList}>
                                <div className={styles.ownershipItem}>
                                    <span className={styles.ownershipMarker} />
                                    <span>System is owned by the financing entity.</span>
                                </div>
                                <div className={styles.ownershipItem}>
                                    <span className={styles.ownershipMarker} />
                                    <span>Installed via roof-lease or Power Purchase Agreement.</span>
                                </div>
                                <div className={styles.ownershipItem}>
                                    <span className={styles.ownershipMarker} />
                                    <span>No obligation to purchase the equipment.</span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.ownershipCard}>
                            <h3 className={styles.ownershipCardTitle}>After the agreement</h3>
                            <div className={styles.ownershipList}>
                                <div className={styles.ownershipItem}>
                                    <span className={styles.ownershipMarker} />
                                    <span>Ownership may transfer to your business at end of term.</span>
                                </div>
                                <div className={styles.ownershipItem}>
                                    <span className={styles.ownershipMarker} />
                                    <span>System continues generating free energy for the asset life.</span>
                                </div>
                                <div className={styles.ownershipItem}>
                                    <span className={styles.ownershipMarker} />
                                    <span>Terms are clearly defined and structured for your benefit.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
