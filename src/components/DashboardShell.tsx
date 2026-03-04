'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Logo from '@/components/Logo';
import {
    LayoutDashboard,
    FilePlus,
    List,
    Wallet,
    User,
    LogOut,
    Menu,
    X,
    FileCheck2,
    BarChart3,
    BookOpen,
    FolderOpen,
    Trophy
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import AssistPanel from './AssistPanel';
import styles from './DashboardShell.module.css';

const NAV_ITEMS = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'New Lead', href: '/dashboard/submit', icon: FilePlus },
    { label: 'My Leads', href: '/dashboard/leads', icon: List },
    { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Earnings', href: '/dashboard/earnings', icon: Wallet },
    { label: 'Knowledge', href: '/dashboard/knowledge', icon: BookOpen },
    { label: 'Profile', href: '/dashboard/profile', icon: User },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/auth');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className={styles.loadingState}>
                <div className={styles.spinner} />
            </div>
        );
    }

    if (!user) return null;

    const SALES_NAV = [
        { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { label: 'New Lead', href: '/dashboard/submit', icon: FilePlus },
        { label: 'My Leads', href: '/dashboard/leads', icon: List },
        { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
        { label: 'Earnings', href: '/dashboard/earnings', icon: Wallet },
        { label: 'Knowledge', href: '/dashboard/knowledge', icon: BookOpen },
        { label: 'Resources', href: '/dashboard/resources', icon: FolderOpen },
        { label: 'Rankings', href: '/dashboard/rankings', icon: Trophy },
        { label: 'Contract', href: '/dashboard/contract', icon: FileCheck2 },
        { label: 'Profile', href: '/dashboard/profile', icon: User },
    ];

    const BUSINESS_NAV = [
        { label: 'Application Status', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Documents', href: '/dashboard/documents', icon: FilePlus },
        { label: 'Profile', href: '/dashboard/profile', icon: User },
    ];

    const navItems = user.role === 'business' ? BUSINESS_NAV : SALES_NAV;

    return (
        <div className={styles.shell}>
            {/* SIDEBAR */}
            <aside className={`${styles.sidebar} ${mobileMenuOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.sidebarHeader}>
                    <Link href="/dashboard" className={styles.logo}>
                        <Logo className={styles.logoMark} size={28} />
                        <span className={styles.logoText}>Generocity</span>
                    </Link>
                    <button
                        className={styles.closeBtn}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                        {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div className={styles.userDetails}>
                        <p className={styles.userName}>{user.firstName} {user.lastName}</p>
                        <p className={styles.userRole}>
                            {user.role === 'business' ? 'Business Partner' : 'Sales Representative'}
                        </p>
                    </div>
                </div>

                <nav className={styles.nav}>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <Icon size={18} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className={styles.sidebarFooter}>
                    <button onClick={logout} className={styles.logoutBtn}>
                        <LogOut size={18} />
                        <span>Sign out</span>
                    </button>
                </div>
            </aside>

            {/* MOBILE OVERLAY */}
            {mobileMenuOpen && (
                <div
                    className={styles.overlay}
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* MAIN CONTENT */}
            <main className={styles.main}>
                <header className={styles.topHeader}>
                    <button
                        className={styles.menuBtn}
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <Menu size={24} />
                    </button>
                    <h1 className={styles.pageTitle}>
                        {navItems.find(item => item.href === pathname)?.label || 'Dashboard'}
                    </h1>
                    <div style={{ marginLeft: 'auto' }}>
                        <ThemeToggle />
                    </div>
                </header>
                <div className={styles.content}>
                    {children}
                </div>
            </main>

            {/* AI Assist Panel */}
            <AssistPanel />
        </div>
    );
}
