'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Logo from '@/components/Logo';
import ThemeToggle from './ThemeToggle';
import styles from './Header.module.css';

const NAV_ITEMS = [
    { label: 'Home', href: '/' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'For Business', href: '/for-business' },
    { label: 'Careers', href: '/careers' },
];

export default function Header() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className={styles.header}>
            <div className={styles.inner}>
                <Link href="/" className={styles.logo}>
                    <Logo className={styles.logoMark} size={32} />
                    <span className={styles.logoText}>Foundation-1</span>
                </Link>

                <nav className={`${styles.nav} ${mobileOpen ? styles.navOpen : ''}`}>
                    <div className={styles.navLinks}>
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.navLink} ${pathname === item.href ? styles.navLinkActive : ''}`}
                                onClick={() => setMobileOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                    <div className={styles.navActions}>
                        <ThemeToggle />
                        <Link
                            href="/auth"
                            className={`btn btn--primary ${styles.navCta}`}
                            onClick={() => setMobileOpen(false)}
                        >
                            Login / Register
                        </Link>
                    </div>
                </nav>

                <button
                    className={styles.burger}
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle navigation"
                    id="mobile-menu-toggle"
                >
                    <span className={`${styles.burgerLine} ${mobileOpen ? styles.burgerLineOpen1 : ''}`} />
                    <span className={`${styles.burgerLine} ${mobileOpen ? styles.burgerLineOpen2 : ''}`} />
                    <span className={`${styles.burgerLine} ${mobileOpen ? styles.burgerLineOpen3 : ''}`} />
                </button>
            </div>
        </header>
    );
}
