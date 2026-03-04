import React from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.inner}>
                <div className={styles.grid}>
                    <div className={styles.brand}>
                        <div className={styles.logo}>
                            <Logo className={styles.logoMark} size={32} />
                            <span className={styles.logoText}>Foundation-1</span>
                        </div>
                        <p className={styles.tagline}>
                            Zero capital expenditure solar for South African businesses.
                        </p>
                    </div>

                    <div className={styles.column}>
                        <h4 className={styles.columnTitle}>Company</h4>
                        <Link href="/how-it-works" className={styles.link}>How It Works</Link>
                        <Link href="/for-business" className={styles.link}>For Business</Link>
                        <Link href="/careers" className={styles.link}>Careers</Link>
                    </div>

                    <div className={styles.column}>
                        <h4 className={styles.columnTitle}>Legal</h4>
                        <Link href="#" className={styles.link}>Terms of Service</Link>
                        <Link href="#" className={styles.link}>Privacy Policy</Link>
                        <Link href="#" className={styles.link}>POPIA Compliance</Link>
                    </div>

                    <div className={styles.column}>
                        <h4 className={styles.columnTitle}>Contact</h4>
                        <a href="mailto:info@foundation-1.co.za" className={styles.link}>
                            info@foundation-1.co.za
                        </a>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p className={styles.copyright}>
                        © {new Date().getFullYear()} Foundation-1. All rights reserved.
                    </p>
                    <p className={styles.partner}>
                        In partnership with Green Share VPP
                    </p>
                </div>
            </div>
        </footer>
    );
}
