'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { User } from '@/lib/types';
import styles from './page.module.css';

export default function ProfilePage() {
    const { user, updateProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [phone, setPhone] = useState(user?.phone || '');

    // Banking Details
    const [bankName, setBankName] = useState(user?.bankName || '');
    const [accountNumber, setAccountNumber] = useState(user?.accountNumber || '');
    const [branchCode, setBranchCode] = useState(user?.branchCode || '');

    // Password Change (Mock)
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (newPassword && newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            const updates: Partial<User> = {
                firstName,
                lastName,
                phone,
                bankName,
                accountNumber,
                branchCode,
            };

            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: user!.id, ...updates }),
            });

            if (!res.ok) {
                throw new Error('Failed to update profile.');
            }

            updateProfile(updates);
            setSuccess(true);
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h2 className={styles.title}>Your Profile</h2>
                <p className={styles.subtitle}>
                    Manage your personal information and banking details for commission payouts.
                </p>
            </header>

            <form onSubmit={handleSubmit} className={styles.formGrid}>
                {/* PERSONAL DETAILS */}
                <section className={styles.card}>
                    <h3 className={styles.cardTitle}>Personal Information</h3>
                    <div className={styles.fields}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-input"
                                value={user.email}
                                disabled
                                style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                            />
                            <span className="form-hint">Email cannot be changed directly. Contact support.</span>
                        </div>

                        <div className={styles.row}>
                            <div className="form-group">
                                <label className="form-label">First Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Last Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input
                                type="tel"
                                className="form-input"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </section>

                {/* BANKING DETAILS */}
                <section className={styles.card}>
                    <h3 className={styles.cardTitle}>Banking Details (For Commissions)</h3>
                    <div className={styles.fields}>
                        <div className="form-group">
                            <label className="form-label">Bank Name</label>
                            <select
                                className="form-input"
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                                required
                            >
                                <option value="">Select Bank...</option>
                                <option value="FNB">FNB</option>
                                <option value="Standard Bank">Standard Bank</option>
                                <option value="Absa">Absa</option>
                                <option value="Nedbank">Nedbank</option>
                                <option value="Capitec">Capitec</option>
                                <option value="Investec">Investec</option>
                                <option value="Discovery Bank">Discovery Bank</option>
                                <option value="TymeBank">TymeBank</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Account Number</label>
                            <input
                                type="text"
                                className="form-input"
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                                placeholder="Enter account number"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Branch Code</label>
                            <input
                                type="text"
                                className="form-input"
                                value={branchCode}
                                onChange={(e) => setBranchCode(e.target.value)}
                                placeholder="Enter branch code"
                            />
                        </div>
                    </div>
                </section>

                {/* PASSWORD */}
                <section className={styles.card}>
                    <h3 className={styles.cardTitle}>Change Password</h3>
                    <div className={styles.fields}>
                        <div className="form-group">
                            <label className="form-label">New Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Leave blank to keep current"
                                minLength={6}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm New Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                minLength={6}
                            />
                        </div>
                    </div>
                </section>

                {/* ACTIONS */}
                <div className={styles.actionRow}>
                    {success && (
                        <div className={styles.successMessage}>Settings saved successfully.</div>
                    )}
                    {error && (
                        <div className={styles.errorMessage}>{error}</div>
                    )}
                    <button
                        type="submit"
                        className="btn btn--primary btn--lg"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
