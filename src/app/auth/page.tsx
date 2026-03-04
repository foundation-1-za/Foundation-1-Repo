'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import Logo from '@/components/Logo';
import { Building2, Briefcase, ArrowLeft } from 'lucide-react';
import styles from './page.module.css';

type RoleChoice = 'business' | 'sales' | null;

function AuthForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { login, user } = useAuth();

    const [mode, setMode] = useState<'login' | 'register'>(
        searchParams.get('mode') === 'register' ? 'register' : 'login'
    );
    const [roleChoice, setRoleChoice] = useState<RoleChoice>(
        (searchParams.get('role') as RoleChoice) || null
    );

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            router.push(user.role === 'admin' ? '/admin' : '/dashboard');
        }
    }, [user, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(email, password);
            if (!result.success) {
                setError(result.error || 'Login failed.');
            }
        } catch {
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterRedirect = () => {
        if (roleChoice === 'sales') {
            router.push('/careers/apply');
        } else if (roleChoice === 'business') {
            router.push('/for-business/apply');
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.formContainer}>
                {/* Back to Home */}
                <Link href="/" className={styles.backLink} id="back-to-home">
                    <ArrowLeft size={16} />
                    <span>Back to Home</span>
                </Link>

                <Link href="/" className={styles.logo}>
                    <Logo className={styles.logoMark} size={36} />
                    <span className={styles.logoText}>Foundation-1</span>
                </Link>

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
                        onClick={() => { setMode('login'); setError(''); setRoleChoice(null); }}
                        id="tab-login"
                    >
                        Login
                    </button>
                    <button
                        className={`${styles.tab} ${mode === 'register' ? styles.tabActive : ''}`}
                        onClick={() => { setMode('register'); setError(''); }}
                        id="tab-register"
                    >
                        Register
                    </button>
                </div>

                {/* ===== LOGIN MODE ===== */}
                {mode === 'login' && (
                    <>
                        <form onSubmit={handleLogin} className={styles.form}>
                            <div className="form-group">
                                <label className="form-label form-label--required" htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    className="form-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@company.co.za"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label form-label--required" htmlFor="password">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    className="form-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    required
                                />
                            </div>

                            {error && (
                                <div className={styles.error}>{error}</div>
                            )}

                            <button
                                type="submit"
                                className="btn btn--primary btn--full btn--lg"
                                disabled={loading}
                                id="auth-submit"
                            >
                                {loading ? 'Please wait...' : 'Login'}
                            </button>

                            <button type="button" className={styles.forgotLink}>
                                Forgot password?
                            </button>
                        </form>

                        <div className={styles.demoHint}>
                            <p className={styles.demoHintTitle}>Demo credentials</p>
                            <p className={styles.demoHintText}>
                                Business: business@foundation-1.co.za / business123<br />
                                Sales Rep: demo@foundation-1.co.za / demo123<br />
                                Admin: admin@foundation-1.co.za / admin123
                            </p>
                        </div>
                    </>
                )}

                {/* ===== REGISTER MODE — Role Selection ===== */}
                {mode === 'register' && (
                    <div className={styles.form}>
                        <h2 className={styles.roleTitle}>How would you like to register?</h2>
                        <p className={styles.roleSubtitle}>Choose your account type to join Generocity.</p>

                        <div className={styles.roleCards}>
                            <button
                                className={`${styles.roleCard} ${roleChoice === 'business' ? styles.roleCardActive : ''}`}
                                onClick={() => setRoleChoice('business')}
                                id="role-business"
                            >
                                <div className={styles.roleCardIcon}>
                                    <Building2 size={28} />
                                </div>
                                <h3 className={styles.roleCardTitle}>Business</h3>
                                <p className={styles.roleCardDesc}>
                                    Apply for Generocity — a zero-capital solar solution for your business.
                                </p>
                            </button>

                            <button
                                className={`${styles.roleCard} ${roleChoice === 'sales' ? styles.roleCardActive : ''}`}
                                onClick={() => setRoleChoice('sales')}
                                id="role-sales"
                            >
                                <div className={styles.roleCardIcon}>
                                    <Briefcase size={28} />
                                </div>
                                <h3 className={styles.roleCardTitle}>Sales Representative</h3>
                                <p className={styles.roleCardDesc}>
                                    Join the Generocity sales team and earn commission by signing businesses.
                                </p>
                            </button>
                        </div>

                        <button
                            className="btn btn--primary btn--full btn--lg"
                            disabled={!roleChoice}
                            onClick={handleRegisterRedirect}
                            id="continue-register"
                        >
                            Continue
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={
            <div className={styles.page}>
                <div className={styles.formContainer}>
                    <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading...</p>
                </div>
            </div>
        }>
            <AuthForm />
        </Suspense>
    );
}
