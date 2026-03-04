'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Logo from '@/components/Logo';
import { Shield, Users, FileText, LogOut, BarChart3, TrendingUp, Zap } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import styles from './AdminShell.module.css';

export default function AdminShell({ children }: { children: React.ReactNode }) {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/auth');
            } else if (user.role !== 'admin') {
                router.push('/dashboard'); // Redirect non-admins to dashboard
            }
        }
    }, [user, isLoading, router]);

    if (isLoading || !user || user.role !== 'admin') {
        return <div className={styles.loading}>Loading admin access...</div>;
    }

    return (
        <div className={styles.shell}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <Link href="/admin" className={styles.logo}>
                        <Logo className={styles.logoMark} size={28} />
                        <span className={styles.logoText}>Generocity</span>
                    </Link>
                </div>
                <nav className={styles.nav}>
                    <Link href="/admin" className={styles.navItem}>
                        <FileText size={18} />
                        <span>Manage Leads</span>
                    </Link>
                    <Link href="/admin/clients" className={styles.navItem}>
                        <Users size={18} />
                        <span>Client Panel</span>
                    </Link>
                    <Link href="/admin/analytics" className={styles.navItem}>
                        <TrendingUp size={18} />
                        <span>Business Intel</span>
                    </Link>
                    <Link href="/admin/live" className={styles.navItem}>
                        <Zap size={18} />
                        <span>Live Command</span>
                    </Link>
                </nav>
                <div className={styles.footer}>
                    <div style={{ padding: '0 1rem 1rem 1rem' }}>
                        <ThemeToggle />
                    </div>
                    <button onClick={logout} className={styles.logoutBtn}>
                        <LogOut size={18} />
                        <span>Sign out</span>
                    </button>
                </div>
            </aside>
            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
}
