'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UploadCloud, CheckCircle, AlertCircle, FileCheck2, ArrowRight } from 'lucide-react';
import styles from './page.module.css';

export default function SubmitLeadPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Check if contract is signed
    const contractSigned = user?.contractSigned || false;

    // Form State
    const [businessName, setBusinessName] = useState('');
    const [registrationNumber, setRegistrationNumber] = useState('');
    const [physicalAddress, setPhysicalAddress] = useState('');
    const [contactName, setContactName] = useState('');
    const [contactRole, setContactRole] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [utilityBill, setUtilityBill] = useState<File | null>(null);
    const [confirmedInterest, setConfirmedInterest] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!user) return;
        if (!utilityBill) {
            setError('Please upload a utility bill.');
            return;
        }
        if (!confirmedInterest) {
            setError('You must confirm the client has expressed interest.');
            return;
        }

        setLoading(true);

        try {
            // In a real app, we would upload the file to storage here first
            // and get a URL/filename to store in the DB.
            // We'll simulate this by just sending the filename.

            const payload = {
                submittedBy: user.id,
                businessName,
                registrationNumber,
                physicalAddress,
                contactName,
                contactRole,
                contactPhone,
                contactEmail,
                utilityBillFileName: utilityBill.name,
                confirmedInterest
            };

            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to submit lead.');
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/dashboard/leads');
            }, 2000);

        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className={styles.successState}>
                <CheckCircle size={64} className={styles.successIcon} />
                <h2 className={styles.successTitle}>Lead Submitted Successfully</h2>
                <p className={styles.successText}>Redirecting you to your leads dashboard...</p>
            </div>
        );
    }

    // Show contract required message if not signed
    if (!contractSigned) {
        return (
            <div className={styles.page}>
                <div className={styles.contractRequiredCard}>
                    <div className={styles.contractIcon}>
                        <FileCheck2 size={48} />
                    </div>
                    <h2 className={styles.contractTitle}>Contract Signature Required</h2>
                    <p className={styles.contractText}>
                        You must sign your Independent Contractor Agreement before you can start submitting client leads.
                    </p>
                    <div className={styles.contractSteps}>
                        <div className={styles.step}>
                            <span className={styles.stepNumber}>1</span>
                            <span>Review your contract</span>
                        </div>
                        <div className={styles.step}>
                            <span className={styles.stepNumber}>2</span>
                            <span>Sign digitally with your name</span>
                        </div>
                        <div className={styles.step}>
                            <span className={styles.stepNumber}>3</span>
                            <span>Start submitting leads</span>
                        </div>
                    </div>
                    <button 
                        className="btn btn--primary btn--lg"
                        onClick={() => router.push('/dashboard/contract')}
                    >
                        Go to Contract <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            {/* QUALIFICATION REQUIREMENTS BANNER */}
            <div className={styles.qualificationsBanner}>
                <div className={styles.qualificationsHeader}>
                    <AlertCircle size={24} />
                    <h3>Business Qualification Requirements</h3>
                </div>
                <ul className={styles.qualificationsList}>
                    <li>✓ Business must be <strong>registered</strong> (valid registration number required)</li>
                    <li>✓ Must provide <strong>minimum 6 months</strong> of utility bills</li>
                    <li>✓ Minimum electricity bill of <strong>R15,000 per month</strong></li>
                </ul>
                <p className={styles.qualificationsNote}>
                    Only submit leads that meet ALL three criteria. Submissions not meeting these requirements will be rejected.
                </p>
            </div>

            <header className={styles.header}>
                <h2 className={styles.title}>New Lead Submission</h2>
                <p className={styles.subtitle}>
                    Enter the details of the qualifying business. All fields are mandatory.
                </p>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>
                {/* SECTION 1: BUSINESS DETAILS */}
                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Business Details</h3>
                    <div className={styles.grid}>
                        <div className="form-group">
                            <label className="form-label form-label--required">Business Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                required
                                placeholder="e.g. Acme Manufacturing"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label form-label--required">Registration Number</label>
                            <input
                                type="text"
                                className="form-input"
                                value={registrationNumber}
                                onChange={(e) => setRegistrationNumber(e.target.value)}
                                required
                                placeholder="e.g. 2020/123456/07"
                            />
                        </div>
                        <div className="form-group full-width">
                            <label className="form-label form-label--required">Physical Address</label>
                            <textarea
                                className="form-input"
                                value={physicalAddress}
                                onChange={(e) => setPhysicalAddress(e.target.value)}
                                required
                                placeholder="Full street address including postal code"
                                rows={3}
                            />
                        </div>
                    </div>
                </section>

                {/* SECTION 2: CONTACT PERSON */}
                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Key Contact Person</h3>
                    <div className={styles.grid}>
                        <div className="form-group">
                            <label className="form-label form-label--required">Full Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={contactName}
                                onChange={(e) => setContactName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label form-label--required">Role / Job Title</label>
                            <input
                                type="text"
                                className="form-input"
                                value={contactRole}
                                onChange={(e) => setContactRole(e.target.value)}
                                required
                                placeholder="e.g. Operations Manager"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label form-label--required">Phone Number</label>
                            <input
                                type="tel"
                                className="form-input"
                                value={contactPhone}
                                onChange={(e) => setContactPhone(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label form-label--required">Email Address</label>
                            <input
                                type="email"
                                className="form-input"
                                value={contactEmail}
                                onChange={(e) => setContactEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </section>

                {/* SECTION 3: DOCUMENTS */}
                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Documentation</h3>
                    <div className={styles.uploadBox}>
                        <input
                            type="file"
                            id="utility-bill"
                            className={styles.fileInput}
                            accept=".pdf,.jpg,.png"
                            onChange={(e) => setUtilityBill(e.target.files ? e.target.files[0] : null)}
                        />
                        <label htmlFor="utility-bill" className={styles.uploadLabel}>
                            <UploadCloud size={32} className={styles.uploadIcon} />
                            <span className={styles.uploadText}>
                                {utilityBill ? utilityBill.name : 'Click to upload recent utility bill'}
                            </span>
                            <span className={styles.uploadHint}>PDF, JPG or PNG (Max 5MB)</span>
                        </label>
                    </div>
                </section>

                {/* SECTION 4: CONFIRMATION */}
                <section className={styles.section}>
                    <div className="form-checkbox">
                        <input
                            type="checkbox"
                            id="confirm-interest"
                            checked={confirmedInterest}
                            onChange={(e) => setConfirmedInterest(e.target.checked)}
                            required
                        />
                        <label htmlFor="confirm-interest" className="form-label">
                            I confirm that this business has explicitly expressed interest in a zero capital
                            expenditure solar solution and understands that they will be contacted for further assessment.
                        </label>
                    </div>
                </section>

                {error && (
                    <div className={styles.errorBox}>
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                <div className={styles.actions}>
                    <button
                        type="button"
                        className="btn btn--secondary"
                        onClick={() => router.back()}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn--primary"
                        disabled={loading}
                    >
                        {loading ? 'Submitting...' : 'Submit Lead'}
                    </button>
                </div>
            </form>
        </div>
    );
}
