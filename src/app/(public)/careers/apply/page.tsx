'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Wizard from '@/components/Wizard';
import { useAuth } from '@/lib/auth-context';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import styles from './page.module.css';

export default function SalesRepApplicationPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [registrationResult, setRegistrationResult] = useState<{
        referenceCode: string;
        referralLink: string;
    } | null>(null);
    const [copiedRef, setCopiedRef] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        idNumber: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        city: '',
        homeAddress: '',
        cvFileName: '',
        linkedinUrl: '',
        experience: '',
        termsAgreed: false,
        privacyAgreed: false,
        commissionAgreed: false,
    });

    const [passwordError, setPasswordError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, cvFileName: e.target.files![0].name }));
        }
    };

    const handleDownloadTerms = () => {
        const content = `FOUNDATION-1 — SALES PARTNER TERMS & CONDITIONS\n\nLast updated: 2026-01-01\n\n1. INDEPENDENT CONTRACTOR\nSales Representatives operate as independent contractors and are not employees of Foundation-1.\n\n2. COMMISSION STRUCTURE\nCommissions are earned upon successful contract signature and installation confirmation.\n\n3. REFERRAL TRACKING\nEach representative receives a unique reference code for client tracking.\n\n4. OBLIGATIONS\nRepresentatives must present Foundation-1 services truthfully and professionally.\n\n5. CONFIDENTIALITY\nAll client and business information must be treated as confidential.\n\n6. TERMINATION\nEither party may terminate the relationship with 30 days written notice.\n\n7. GOVERNING LAW\nThese terms are governed by the laws of the Republic of South Africa.\n\nFor full terms, contact legal@foundation-1.co.za`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Foundation-1_Sales_Partner_Terms_and_Conditions.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDownloadPrivacy = () => {
        const content = `FOUNDATION-1 — PRIVACY POLICY\n\nLast updated: 2026-01-01\n\n1. INFORMATION WE COLLECT\nWe collect personal information, professional details, and sales performance data.\n\n2. HOW WE USE YOUR INFORMATION\nYour data is used for identity verification, commission calculations, and communication.\n\n3. DATA SHARING\nWe do not share your personal data with third parties except as required for service delivery.\n\n4. DATA SECURITY\nWe implement industry-standard security measures to protect your information.\n\n5. YOUR RIGHTS\nYou have the right to access, correct, and delete your personal data under POPIA.\n\n6. CONTACT\nFor privacy inquiries: privacy@foundation-1.co.za`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Foundation-1_Privacy_Policy.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    const copyToClipboard = async (text: string, type: 'ref' | 'link') => {
        try {
            await navigator.clipboard.writeText(text);
            if (type === 'ref') {
                setCopiedRef(true);
                setTimeout(() => setCopiedRef(false), 2000);
            } else {
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2000);
            }
        } catch {
            alert('Copied: ' + text);
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/onboarding/sales-rep', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (data.success) {
                // Show the reference code and referral link
                setRegistrationResult({
                    referenceCode: data.user.referenceCode,
                    referralLink: `${window.location.origin}${data.user.referralLink}`,
                });
            } else {
                alert(data.error || 'Submission failed');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoToDashboard = async () => {
        try {
            await login(formData.email, formData.password);
            router.push('/dashboard');
        } catch {
            router.push('/auth');
        }
    };

    // ===== SUCCESS SCREEN =====
    if (registrationResult) {
        return (
            <main className={styles.page}>
                <div className="container">
                    <div className={styles.successContainer}>
                        <div className={styles.successIcon}>✓</div>
                        <h1 className={styles.successTitle}>Welcome to Generocity!</h1>
                        <p className={styles.successSubtitle}>
                            Your application has been submitted successfully. Here are your personalised details:
                        </p>

                        <div className={styles.credentialCard}>
                            <div className={styles.credentialItem}>
                                <label className={styles.credentialLabel}>Your Reference Code</label>
                                <div className={styles.credentialValue}>
                                    <span className={styles.refCode}>{registrationResult.referenceCode}</span>
                                    <button
                                        className={styles.copyBtn}
                                        onClick={() => copyToClipboard(registrationResult.referenceCode, 'ref')}
                                        title="Copy reference code"
                                    >
                                        {copiedRef ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                                <p className={styles.credentialHint}>
                                    Share this code with potential clients. They can enter it during registration so their account is linked to you.
                                </p>
                            </div>

                            <div className={styles.credentialDivider} />

                            <div className={styles.credentialItem}>
                                <label className={styles.credentialLabel}>Your Personalised Referral Link</label>
                                <div className={styles.credentialValue}>
                                    <span className={styles.refLink}>{registrationResult.referralLink}</span>
                                    <button
                                        className={styles.copyBtn}
                                        onClick={() => copyToClipboard(registrationResult.referralLink, 'link')}
                                        title="Copy referral link"
                                    >
                                        {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                                <p className={styles.credentialHint}>
                                    Send this link to businesses. It takes them directly to the sign-up page with your reference pre-filled.
                                </p>
                            </div>
                        </div>

                        <button
                            className="btn btn--primary btn--lg btn--full"
                            onClick={handleGoToDashboard}
                        >
                            Go to Dashboard →
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    // Step Components
    const PersonalInfoStep = (
        <div>
            <div className={styles.formGroup}>
                <label className={styles.label}>First Name</label>
                <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="e.g. James"
                />
            </div>
            <div className={styles.formGroup}>
                <label className={styles.label}>Last Name</label>
                <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="e.g. Molefe"
                />
            </div>
            <div className={styles.formGroup}>
                <label className={styles.label}>ID Number <span className={styles.required}>*</span></label>
                <input
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="e.g. 9001011234081"
                    required
                />
                <p className={styles.fieldHint}>Required for contract generation</p>
            </div>
            <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="name@example.com"
                />
            </div>
            <div className={styles.formGroup}>
                <label className={styles.label}>Create Password</label>
                <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Create a secure password"
                />
            </div>
            <div className={styles.formGroup}>
                <label className={styles.label}>Confirm Password</label>
                <input
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => {
                        handleChange(e);
                        if (e.target.value !== formData.password) {
                            setPasswordError('Passwords do not match');
                        } else {
                            setPasswordError('');
                        }
                    }}
                    onBlur={() => {
                        if (formData.confirmPassword !== formData.password) {
                            setPasswordError('Passwords do not match');
                        } else {
                            setPasswordError('');
                        }
                    }}
                    className={styles.input}
                    placeholder="Re-enter your password"
                />
                {passwordError && <span className={styles.errorText}>{passwordError}</span>}
            </div>
            <div className={styles.formGroup}>
                <label className={styles.label}>Phone Number</label>
                <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="0711230333"
                />
            </div>
            <div className={styles.formGroup}>
                <label className={styles.label}>City</label>
                <input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="e.g. Johannesburg"
                />
            </div>
            <div className={styles.formGroup}>
                <label className={styles.label}>Home Address <span className={styles.required}>*</span></label>
                <textarea
                    name="homeAddress"
                    value={formData.homeAddress}
                    onChange={handleChange}
                    className={styles.textarea}
                    placeholder="Street number and name, Suburb, City, Postal Code"
                    required
                />
                <p className={styles.fieldHint}>Required for contract generation</p>
            </div>
        </div>
    );

    const ProfessionalStep = (
        <div>
            <div className={styles.formGroup}>
                <label className={styles.label}>Upload CV (PDF/DOC)</label>
                <div className={styles.fileUpload}>
                    <input type="file" onChange={handleFileUpload} accept=".pdf,.doc,.docx" />
                    {formData.cvFileName && <p>Selected: {formData.cvFileName}</p>}
                </div>
            </div>
            <div className={styles.formGroup}>
                <label className={styles.label}>LinkedIn Profile (Optional)</label>
                <input
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="https://linkedin.com/in/..."
                />
            </div>
            <div className={styles.formGroup}>
                <label className={styles.label}>Past Sales Experience</label>
                <textarea
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className={styles.textarea}
                    placeholder="Tell us briefly about your sales background..."
                />
            </div>
        </div>
    );

    const ConsentStep = (
        <div>
            <div className={styles.checkboxGroup}>
                <input
                    type="checkbox"
                    name="termsAgreed"
                    checked={formData.termsAgreed}
                    onChange={handleCheckboxChange}
                    className={styles.checkbox}
                />
                <label className={styles.checkboxLabel}>
                    I agree to the{' '}
                    <a href="#" onClick={(e) => { e.preventDefault(); handleDownloadTerms(); }} className={styles.legalLink}>
                        Terms &amp; Conditions
                    </a>{' '}
                    of the Generocity Sales Partner Program.
                </label>
            </div>
            <div className={styles.checkboxGroup}>
                <input
                    type="checkbox"
                    name="privacyAgreed"
                    checked={formData.privacyAgreed}
                    onChange={handleCheckboxChange}
                    className={styles.checkbox}
                />
                <label className={styles.checkboxLabel}>
                    I confirm I have read and understood the{' '}
                    <a href="#" onClick={(e) => { e.preventDefault(); handleDownloadPrivacy(); }} className={styles.legalLink}>
                        Privacy Policy
                    </a>.
                </label>
            </div>
            <div className={styles.checkboxGroup}>
                <input
                    type="checkbox"
                    name="commissionAgreed"
                    checked={formData.commissionAgreed}
                    onChange={handleCheckboxChange}
                    className={styles.checkbox}
                />
                <label className={styles.checkboxLabel}>
                    I acknowledge that commissions are paid only upon successful contract signature and installation confirmation as per the schedule.
                </label>
            </div>

            <div className={styles.downloadLinks}>
                <button type="button" onClick={handleDownloadTerms} className={styles.downloadBtn}>
                    ↓ Download Terms &amp; Conditions
                </button>
                <button type="button" onClick={handleDownloadPrivacy} className={styles.downloadBtn}>
                    ↓ Download Privacy Policy
                </button>
            </div>
        </div>
    );

    const SummaryStep = (
        <div className={styles.summary}>
            <h3>Review your details</h3>
            <div className={styles.summaryRow}>
                <span className={styles.summaryKey}>Name:</span>
                <span className={styles.summaryValue}>{formData.firstName} {formData.lastName}</span>
            </div>
            <div className={styles.summaryRow}>
                <span className={styles.summaryKey}>Email:</span>
                <span className={styles.summaryValue}>{formData.email}</span>
            </div>
            <div className={styles.summaryRow}>
                <span className={styles.summaryKey}>City:</span>
                <span className={styles.summaryValue}>{formData.city}</span>
            </div>
            <div className={styles.summaryRow}>
                <span className={styles.summaryKey}>CV:</span>
                <span className={styles.summaryValue}>{formData.cvFileName || 'None uploaded'}</span>
            </div>
        </div>
    );

    // Step Definitions
    const steps = [
        {
            id: 'personal',
            label: 'Personal Info',
            component: PersonalInfoStep,
            isValid: !!(formData.firstName && formData.lastName && formData.idNumber && formData.email && formData.password && formData.city && formData.homeAddress),
        },
        {
            id: 'professional',
            label: 'Professional Details',
            component: ProfessionalStep,
            isValid: !!(formData.cvFileName),
        },
        {
            id: 'consent',
            label: 'Agreements',
            component: ConsentStep,
            isValid: !!(formData.termsAgreed && formData.privacyAgreed && formData.commissionAgreed),
        },
        {
            id: 'confirm',
            label: 'Confirmation',
            component: SummaryStep,
            isValid: true,
        },
    ];

    return (
        <main className={styles.page}>
            <div className="container">
                <Link href="/auth?mode=register" className={styles.backLink} id="sales-back-home">
                    <ArrowLeft size={16} />
                    <span>Back to Role Selection</span>
                </Link>
                <div className={styles.intro}>
                    <h1 className={styles.introTitle}>Join the Generocity Sales Team</h1>
                    <p className={styles.introSubtitle}>Complete the steps below to apply as a Generocity Sales Representative.</p>
                </div>

                <Wizard
                    steps={steps}
                    onComplete={handleSubmit}
                    title="Sales Representative Application"
                    isLoading={isLoading}
                />
            </div>
        </main>
    );
}
