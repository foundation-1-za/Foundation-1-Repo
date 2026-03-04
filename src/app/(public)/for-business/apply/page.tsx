'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Wizard from '@/components/Wizard';
import { useAuth } from '@/lib/auth-context';
import { ArrowLeft } from 'lucide-react';
import styles from './page.module.css';

export default function BusinessApplicationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Pre-fill rep reference from query param (e.g. ?ref=F1-JMOL-4821)
    const prefilledRef = searchParams.get('ref') || '';

    // Form State
    const [formData, setFormData] = useState({
        businessName: '',
        registrationNumber: '',
        physicalAddress: '',
        industry: '',
        employees: '',
        primaryContactName: '',
        primaryContactRole: '',
        primaryContactPhone: '',
        primaryContactEmail: '',
        primaryContactPassword: '',
        confirmPassword: '',
        utilityBillFileName: '',
        skipUtilityBill: false,
        salesRepRef: prefilledRef,
        termsAgreed: false,
        privacyAgreed: false,
        zeroCapexInterest: false,
    });

    const [passwordError, setPasswordError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, utilityBillFileName: e.target.files![0].name }));
        }
    };

    const handleDownloadTerms = () => {
        const content = `FOUNDATION-1 — TERMS & CONDITIONS\n\nLast updated: 2026-01-01\n\n1. ACCEPTANCE OF TERMS\nBy registering and using the Foundation-1 platform, you agree to be bound by these Terms & Conditions.\n\n2. SERVICES\nFoundation-1 facilitates zero-capital solar energy solutions for businesses in South Africa.\n\n3. ELIGIBILITY\nYou must be a registered South African business entity to apply.\n\n4. DATA USE\nAll data provided will be used solely for the purposes of evaluating your solar application.\n\n5. LIMITATION OF LIABILITY\nFoundation-1 acts as an intermediary and is not liable for installation outcomes.\n\n6. GOVERNING LAW\nThese terms are governed by the laws of the Republic of South Africa.\n\nFor full terms, contact legal@foundation-1.co.za`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Foundation-1_Terms_and_Conditions.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDownloadPrivacy = () => {
        const content = `FOUNDATION-1 — PRIVACY POLICY\n\nLast updated: 2026-01-01\n\n1. INFORMATION WE COLLECT\nWe collect business information, contact details, and utility data for solar feasibility assessment.\n\n2. HOW WE USE YOUR INFORMATION\nYour data is used to evaluate eligibility, communicate with you, and improve services.\n\n3. DATA SHARING\nWe share relevant data with our accredited solar installation partners for evaluation purposes only.\n\n4. DATA SECURITY\nWe implement industry-standard security measures to protect your information.\n\n5. YOUR RIGHTS\nYou have the right to access, correct, and delete your personal data under POPIA.\n\n6. CONTACT\nFor privacy inquiries: privacy@foundation-1.co.za`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Foundation-1_Privacy_Policy.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const payload = {
                email: formData.primaryContactEmail,
                password: formData.primaryContactPassword,
                firstName: formData.primaryContactName.split(' ')[0] || 'Business',
                lastName: formData.primaryContactName.split(' ').slice(1).join(' ') || 'User',
                phone: formData.primaryContactPhone,
                businessName: formData.businessName,
                registrationNumber: formData.registrationNumber,
                physicalAddress: formData.physicalAddress,
                industry: formData.industry,
                employees: formData.employees,
                primaryContactRole: formData.primaryContactRole,
                utilityBillFileName: formData.utilityBillFileName,
                salesRepRef: formData.salesRepRef || undefined,
            };

            const res = await fetch('/api/onboarding/business', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (data.success) {
                try {
                    await login(formData.primaryContactEmail, formData.primaryContactPassword);
                    router.push('/dashboard');
                } catch (err) {
                    console.error('Auto-login failed', err);
                    router.push('/auth');
                }
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

    // Step Components
    const BusinessInfoStep = (
        <div>
            <div className={styles.formGroup}>
                <label className={styles.label}>Business Name</label>
                <input
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="e.g. Acme Corp (Pty) Ltd"
                />
            </div>
            <div className={styles.formGroup}>
                <label className={styles.label}>Registration Number</label>
                <input
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="20XX/XXXXXX/XX"
                />
            </div>
            <div className={styles.formGroup}>
                <label className={styles.label}>Physical Address</label>
                <input
                    name="physicalAddress"
                    value={formData.physicalAddress}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Street, City, Postal Code"
                />
            </div>
            <div className={styles.formGroup}>
                <label className={styles.label}>Industry</label>
                <select name="industry" value={formData.industry} onChange={handleChange} className={styles.select}>
                    <option value="">Select Industry...</option>
                    <option value="agriculture_food">Agriculture and Food Systems</option>
                    <option value="construction_real_assets">Construction and Real Assets</option>
                    <option value="consumer_services">Consumer Services</option>
                    <option value="creative_cultural">Creative and Cultural Industries</option>
                    <option value="defence">Defence</option>
                    <option value="education_research">Education and Research</option>
                    <option value="emerging_frontier">Emerging and Frontier Industries</option>
                    <option value="energy_utilities">Energy and Utilities</option>
                    <option value="environmental_climate">Environmental and Climate</option>
                    <option value="financial_services">Financial Services</option>
                    <option value="government_public">Government and Public Sector</option>
                    <option value="healthcare_life_sciences">Healthcare and Life Sciences</option>
                    <option value="hospitality_tourism">Hospitality and Tourism</option>
                    <option value="human_services">Human Services</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="manufacturing_industrial">Manufacturing and Industrial</option>
                    <option value="media_entertainment">Media and Entertainment</option>
                    <option value="non_profit_social">Non-Profit and Social Impact</option>
                    <option value="platform_digital">Platform and Digital Economies</option>
                    <option value="professional_services">Professional Services</option>
                    <option value="real_estate">Real Estate</option>
                    <option value="retail_commerce">Retail and Commerce</option>
                    <option value="science_engineering">Science and Engineering</option>
                    <option value="security_risk">Security and Risk</option>
                    <option value="space_aerospace">Space and Aerospace</option>
                    <option value="technology_digital">Technology and Digital</option>
                    <option value="telecommunications">Telecommunications</option>
                    <option value="transportation_logistics">Transportation and Logistics</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div className={styles.formGroup}>
                <label className={styles.label}>Number of Employees</label>
                <select name="employees" value={formData.employees} onChange={handleChange} className={styles.select}>
                    <option value="">Select Range...</option>
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-200">51-200</option>
                    <option value="200+">200+</option>
                </select>
            </div>
        </div>
    );

    const ContactStep = (
        <div>
            <div className={styles.formGroup}>
                <label className={styles.label}>Primary Contact Name</label>
                <input
                    name="primaryContactName"
                    value={formData.primaryContactName}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="First & Last Name"
                />
            </div>
            <div className={styles.formGroup}>
                <label className={styles.label}>Job Title / Role</label>
                <input
                    name="primaryContactRole"
                    value={formData.primaryContactRole}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="e.g. Director or Operations Manager"
                />
            </div>
            <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <input
                    name="primaryContactEmail"
                    type="email"
                    value={formData.primaryContactEmail}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="name@company.co.za"
                />
            </div>
            <div className={styles.formGroup}>
                <label className={styles.label}>Create Password</label>
                <input
                    name="primaryContactPassword"
                    type="password"
                    value={formData.primaryContactPassword}
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
                        if (e.target.value !== formData.primaryContactPassword) {
                            setPasswordError('Passwords do not match');
                        } else {
                            setPasswordError('');
                        }
                    }}
                    onBlur={() => {
                        if (formData.confirmPassword !== formData.primaryContactPassword) {
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
                    name="primaryContactPhone"
                    type="tel"
                    value={formData.primaryContactPhone}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="0711230333"
                />
            </div>
            <div className={styles.formGroup}>
                <label className={styles.label}>Sales Representative Reference <span className={styles.optional}>(Optional)</span></label>
                <input
                    name="salesRepRef"
                    value={formData.salesRepRef}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="e.g. F1-JMOL-4821"
                />
                <p className={styles.fieldHint}>
                    If a sales representative referred you, enter their reference code here.
                </p>
            </div>
        </div>
    );

    const DocsStep = (
        <div>
            <div className={styles.formGroup}>
                <label className={styles.label}>Latest Utility Bill (PDF)</label>
                <div className={styles.fileUpload}>
                    <input 
                        type="file" 
                        onChange={handleFileUpload} 
                        accept=".pdf,.png,.jpg" 
                        disabled={formData.skipUtilityBill}
                    />
                    {formData.utilityBillFileName && <p>Selected: {formData.utilityBillFileName}</p>}
                </div>
                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                    Required for solar feasibility assessment.
                </p>
            </div>
            <div className={styles.checkboxGroup}>
                <input
                    type="checkbox"
                    name="skipUtilityBill"
                    checked={formData.skipUtilityBill}
                    onChange={handleCheckboxChange}
                    className={styles.checkbox}
                />
                <label className={styles.checkboxLabel}>
                    I will upload my utility bill later (you can submit this from your dashboard after registration).
                </label>
            </div>
        </div>
    );

    const ConsentStep = (
        <div>
            <div className={styles.checkboxGroup}>
                <input
                    type="checkbox"
                    name="zeroCapexInterest"
                    checked={formData.zeroCapexInterest}
                    onChange={handleCheckboxChange}
                    className={styles.checkbox}
                />
                <label className={styles.checkboxLabel}>
                    I confirm we are interested in Generocity, a Zero Capital Expenditure solar solution.
                </label>
            </div>
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
                    </a>.
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
                    I have read and accept the{' '}
                    <a href="#" onClick={(e) => { e.preventDefault(); handleDownloadPrivacy(); }} className={styles.legalLink}>
                        Privacy Policy
                    </a>.
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
            <h3>Review Application</h3>
            <div className={styles.summaryRow}>
                <span className={styles.summaryKey}>Business:</span>
                <span className={styles.summaryValue}>{formData.businessName}</span>
            </div>
            <div className={styles.summaryRow}>
                <span className={styles.summaryKey}>Contact:</span>
                <span className={styles.summaryValue}>{formData.primaryContactName}</span>
            </div>
            <div className={styles.summaryRow}>
                <span className={styles.summaryKey}>Email:</span>
                <span className={styles.summaryValue}>{formData.primaryContactEmail}</span>
            </div>
            <div className={styles.summaryRow}>
                <span className={styles.summaryKey}>Reg No:</span>
                <span className={styles.summaryValue}>{formData.registrationNumber}</span>
            </div>
            {formData.salesRepRef && (
                <div className={styles.summaryRow}>
                    <span className={styles.summaryKey}>Rep Ref:</span>
                    <span className={styles.summaryValue}>{formData.salesRepRef}</span>
                </div>
            )}
        </div>
    );

    // Step Definitions
    const steps = [
        {
            id: 'business',
            label: 'Business Info',
            component: BusinessInfoStep,
            isValid: !!(formData.businessName && formData.registrationNumber && formData.physicalAddress && formData.industry),
        },
        {
            id: 'contact',
            label: 'Contact Person',
            component: ContactStep,
            isValid: !!(formData.primaryContactName && formData.primaryContactEmail && formData.primaryContactPassword),
        },
        {
            id: 'docs',
            label: 'Documentation',
            component: DocsStep,
            isValid: !!(formData.utilityBillFileName) || formData.skipUtilityBill,
        },
        {
            id: 'consent',
            label: 'Agreements',
            component: ConsentStep,
            isValid: !!(formData.termsAgreed && formData.privacyAgreed && formData.zeroCapexInterest),
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
                <Link href="/auth?mode=register" className={styles.backLink} id="business-back-home">
                    <ArrowLeft size={16} />
                    <span>Back to Role Selection</span>
                </Link>
                <div className={styles.intro}>
                    <h1 className={styles.introTitle}>Apply for Generocity</h1>
                    <p className={styles.introSubtitle}>Get started with your zero-capital solar application.</p>
                </div>

                <Wizard
                    steps={steps}
                    onComplete={handleSubmit}
                    title="Business Application"
                    isLoading={isLoading}
                />
            </div>
        </main>
    );
}
