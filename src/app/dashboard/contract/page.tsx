'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { FileCheck2, Download, CheckCircle, AlertCircle } from 'lucide-react';
import styles from './page.module.css';

// Function to generate contract with user details populated
const generateContractText = (user: any, effectiveDate: string, signatureName?: string, signedDate?: string) => {
    const contractorName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || '[CONTRACTOR NAME]';
    const idNumber = user?.idNumber || '[ID NUMBER]';
    const email = user?.email || '[EMAIL]';
    const phone = user?.phone || '[PHONE]';
    const homeAddress = user?.homeAddress || '[RESIDENTIAL ADDRESS]';
    
    return `================================================================================
                    INDEPENDENT CONTRACTOR AGREEMENT
              FOUNDATION-1 SALES REPRESENTATIVE PROGRAM
================================================================================

EFFECTIVE DATE: ${effectiveDate}

--------------------------------------------------------------------------------
PARTIES
--------------------------------------------------------------------------------

COMPANY:
Foundation-1 (Pty) Ltd
Registration Number: 2026/138664/07
Email: info@foundation-1.co.za

CONTRACTOR:
Name: ${contractorName}
ID Number: ${idNumber}
Email: ${email}
Phone: ${phone}
Residential Address: ${homeAddress}

--------------------------------------------------------------------------------
RECITALS
--------------------------------------------------------------------------------

WHEREAS, Generocity provides bank-backed, Zero Capital Expenditure energy 
solutions to businesses in South Africa through its Generocity platform;

WHEREAS, Company requires independent sales representatives to identify and 
submit client opportunities;

WHEREAS, Contractor represents that they possess the requisite skills, discipline, 
and commitment to identify and submit client opportunities;

NOW, THEREFORE, in consideration of the mutual covenants and promises 
contained herein, the Parties agree as follows:

--------------------------------------------------------------------------------
1. INDEPENDENT CONTRACTOR STATUS
--------------------------------------------------------------------------------

Contractor is engaged as an independent contractor by Generocity for deal 
origination. Nothing in this Agreement shall create an employer-employee 
relationship, a partnership, joint venture, or agency.

Contractor acknowledges and agrees that:

   a) They are responsible for all taxes, levies, and statutory obligations 
      arising from payments received under this Agreement.

   b) Contractor is not entitled to employee benefits, leave, severance, or 
      any protections under South African labour law.

   c) Contractor shall not make any claim against the Company under employment 
      or labour legislation.

--------------------------------------------------------------------------------
2. ENGAGEMENT AND DUTIES
--------------------------------------------------------------------------------

Contractor shall:

   a) Identify and submit client opportunities in accordance with Company protocols
   b) Speak only to authorised decision makers within client organisations
   c) Accurately collect and submit six months of utility bills for prospective 
      clients who express interest
   d) Operate with strict discipline, professionalism, honesty, and ethics
   e) Maintain strict adherence to Key Performance Indicators (KPIs)
   f) Respond promptly to communications and follow all documented processes

Contractor acknowledges that performance is strictly measured by funded and 
approved projects, adherence to KPIs, and compliance with conduct standards.

--------------------------------------------------------------------------------
3. COMPENSATION
--------------------------------------------------------------------------------

BASE COMMISSION:
   R2,000 per successfully funded and approved client

--------------------------------------------------------------------------------
4. VOLUME INCENTIVE STRUCTURE
--------------------------------------------------------------------------------

In addition to base commission, Contractor shall receive volume-based bonuses:

TIER 1 - STARTER (1 to 9 clients)
   Bonus:          R0
   Calculation:    R2,000 × number of clients
   Example:        5 clients = R10,000

TIER 2 - RISING STAR (10 to 19 clients)
   Bonus:          R5,000
   Calculation:    (R2,000 × clients) + R5,000
   Example:        10 clients = R25,000

TIER 3 - TOP PERFORMER (20 to 29 clients)
   Bonus:          R10,000
   Calculation:    (R2,000 × clients) + R10,000
   Example:        20 clients = R50,000

TIER 4 - ELITE PERFORMER (30 clients)
   Bonus:          R15,000
   Calculation:    (R2,000 × 30) + R15,000 = R75,000

IMPORTANT NOTES:
   • Base commission applies to each successfully funded and approved client
   • Volume bonus is added once contractor reaches the threshold for each tier
   • Bonuses paid within 72 hours of last funded client verification
   • Bonuses are objective and non-discretionary
   • Additional bonuses may apply for contractors exceeding 30 clients

--------------------------------------------------------------------------------
5. STANDARDS OF CONDUCT AND ETHICS
--------------------------------------------------------------------------------

Contractor shall:

   a) Maintain the highest standards of honesty and professionalism
   b) Avoid false or exaggerated statements, pressure tactics, misrepresentation
   c) Abide by all processes, guidelines, and KPIs provided by the Company
   d) Recognise that failure to adhere constitutes material breach

--------------------------------------------------------------------------------
6. NON-CIRCUMVENTION
--------------------------------------------------------------------------------

For a period of two (2) years following termination, Contractor shall not:

   a) Contact, solicit, or enter into business with any client introduced 
      through the Company
   b) Bypass, avoid, or circumvent the Company for personal gain
   c) Use Company information to compete with or undermine the Company

Breach may result in immediate legal action, including damages and injunctive relief.

--------------------------------------------------------------------------------
7. FRAUD AND MISREPRESENTATION LIABILITY
--------------------------------------------------------------------------------

Contractor acknowledges that all client information and utility bills must be:
   • ACCURATE
   • COMPLETE
   • VERIFIABLE

Contractor shall NOT:
   • Falsify, fabricate, or alter client information
   • Submit knowingly non-serious, incomplete, or fraudulent leads
   • Misrepresent their engagement to any third party

PENALTIES FOR FRAUD:
Contractor shall be personally liable for all damages, penalties, and losses 
incurred by the Company, including:
   • Lost revenue or funding
   • Legal fees or claims by third parties
   • Reputational damage and corrective costs

The Company reserves the right to immediate termination and legal remedies.

--------------------------------------------------------------------------------
8. TERMINATION
--------------------------------------------------------------------------------

COMPANY MAY TERMINATE IMMEDIATELY for:
   • Breach of ethics or conduct standards
   • Failure to meet KPIs or performance expectations
   • Misrepresentation or submission of fraudulent leads

CONTRACTOR MAY TERMINATE with seven (7) days' written notice.

Upon termination, Contractor is only entitled to payment for funded and approved 
projects completed prior to termination. No compensation for incomplete work.

--------------------------------------------------------------------------------
9. CONFIDENTIALITY
--------------------------------------------------------------------------------

Contractor shall maintain strict confidentiality regarding:
   • Client lists and business information
   • Bank agreements and pricing structures
   • Company methods, systems, and intellectual property
   • All information obtained in course of performing duties

This obligation survives termination of this Agreement.

--------------------------------------------------------------------------------
10. INDEMNIFICATION AND LIABILITY
--------------------------------------------------------------------------------

Contractor shall indemnify and hold harmless the Company from any claims, losses, 
damages, or expenses arising from Contractor's actions or breach.

The Company shall not be liable for any consequences arising from Contractor's 
actions. Contractor assumes full responsibility for managing business risks.

--------------------------------------------------------------------------------
11. GOVERNING LAW AND DISPUTE RESOLUTION
--------------------------------------------------------------------------------

This Agreement is governed by the laws of the Republic of South Africa.

Disputes shall first be submitted to mediation. If unresolved, disputes shall 
be settled by arbitration in Johannesburg under AFSA rules.

--------------------------------------------------------------------------------
12. ENTIRE AGREEMENT
--------------------------------------------------------------------------------

This Agreement supersedes all prior discussions, negotiations, or agreements. 
Any amendments must be in writing and signed by both Parties.

--------------------------------------------------------------------------------
13. ACKNOWLEDGMENT
--------------------------------------------------------------------------------

Contractor acknowledges having read, understood, and agreed to all terms, 
including duties, obligations, KPIs, ethical requirements, non-circumvention 
obligations, volume incentives, fraud liability, and liability limitations.

Contractor accepts these terms voluntarily and understands that performance 
is strictly tied to funded and approved projects.


================================================================================
                           SIGNATURE PAGE
================================================================================

${signedDate ? 'SIGNATURES COMPLETED' : 'PENDING SIGNATURES'}

COMPANY: FOUNDATION-1 (PTY) LTD
   Signature:     _______________________
   Company:       Generocity (Pty) Ltd
   Reg Number:    2026/138664/07
   Role:          Authorised Signatory
   Email:         info@foundation-1.co.za
   Date:          ${effectiveDate}

CONTRACTOR:
   Signature:     ${signatureName ? signatureName : '_______________________'}
   Full Name:     ${contractorName}
   ID Number:     ${idNumber}
   Email:         ${email}
   Phone:         ${phone}
   Address:       ${homeAddress}
   Date:          ${signedDate || '_________________'}

================================================================================
                    CONTRACT VERSION: 2026.02.16
              Generocity (Pty) Ltd - All Rights Reserved
================================================================================`;
};

export default function ContractPage() {
    const { user, updateProfile } = useAuth();
    const [showContract, setShowContract] = useState(true);
    const [signatureName, setSignatureName] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [signed, setSigned] = useState(user?.contractSigned || false);
    const [signedAt, setSignedAt] = useState(user?.contractSignedAt || '');

    // Format today's date
    const today = new Date();
    const effectiveDate = today.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).replace(/\//g, '/');

    const signedDateFormatted = signedAt 
        ? new Date(signedAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '/')
        : '';

    // Generate contract text with user's details
    const contractText = generateContractText(user, effectiveDate, signatureName, signedDateFormatted);

    const handleSign = () => {
        if (!signatureName.trim() || !agreed) return;

        const now = new Date().toISOString();
        setSigned(true);
        setSignedAt(now);

        // Update user profile
        updateProfile({
            contractSigned: true,
            contractSignedAt: now,
        });
    };

    const handleDownload = () => {
        const blob = new Blob([contractText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fileSuffix = signed ? '_SIGNED' : '';
        a.download = `GreenShare_VPP_Contract_${user?.lastName || 'Contractor'}${fileSuffix}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Check if user has required info for contract
    const hasRequiredInfo = user?.idNumber && user?.homeAddress;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Independent Contractor Agreement</h1>
                {signed ? (
                    <div className={styles.statusBadge + ' ' + styles.statusSigned}>
                        <CheckCircle size={16} />
                        <span>Signed</span>
                    </div>
                ) : (
                    <div className={styles.statusBadge + ' ' + styles.statusPending}>
                        <AlertCircle size={16} />
                        <span>Pending Signature</span>
                    </div>
                )}
            </div>

            {!hasRequiredInfo && !signed && (
                <div className={styles.missingInfoBanner}>
                    <AlertCircle size={20} />
                    <div>
                        <p className={styles.missingInfoTitle}>Missing Required Information</p>
                        <p className={styles.missingInfoText}>
                            Your profile is missing ID Number or Home Address. Please update your{' '}
                            <a href="/dashboard/profile" className={styles.missingInfoLink}>profile</a>{' '}
                            before signing the contract.
                        </p>
                    </div>
                </div>
            )}

            {signed && (
                <div className={styles.signedBanner}>
                    <CheckCircle size={20} />
                    <div>
                        <p className={styles.signedBannerTitle}>Contract Signed Successfully</p>
                        <p className={styles.signedBannerText}>
                            Signed on {new Date(signedAt).toLocaleDateString('en-ZA', {
                                year: 'numeric', month: 'long', day: 'numeric'
                            })} by {user?.firstName} {user?.lastName}
                        </p>
                    </div>
                </div>
            )}

            {/* CONTRACT DOCUMENT */}
            <div className={styles.contractCard}>
                <div className={styles.contractHeader}>
                    <div className={styles.contractHeaderLeft}>
                        <FileCheck2 size={20} />
                        <span>GreenShare VPP Deal Origination Agreement</span>
                    </div>
                    <div className={styles.contractActions}>
                        <button
                            className={styles.toggleBtn}
                            onClick={() => setShowContract(!showContract)}
                        >
                            {showContract ? 'Collapse' : 'Read Contract'}
                        </button>
                        <button
                            className={styles.downloadContractBtn}
                            onClick={handleDownload}
                        >
                            <Download size={16} />
                            <span>Download</span>
                        </button>
                    </div>
                </div>

                {showContract && (
                    <div className={styles.contractBody}>
                        <pre className={styles.contractText}>{contractText}</pre>
                    </div>
                )}
            </div>

            {/* SIGNATURE SECTION */}
            {!signed && hasRequiredInfo && (
                <div className={styles.signatureSection}>
                    <h2 className={styles.signatureTitle}>Sign Contract</h2>
                    <p className={styles.signatureSubtitle}>
                        Please read the contract above carefully. By signing, you agree to all terms and conditions.
                    </p>

                    <div className={styles.signatureForm}>
                        <div className={styles.signatureField}>
                            <label className={styles.signatureLabel}>Full Name (as signature)</label>
                            <input
                                type="text"
                                className={styles.signatureInput}
                                value={signatureName}
                                onChange={(e) => setSignatureName(e.target.value)}
                                placeholder={`${user?.firstName || ''} ${user?.lastName || ''}`}
                            />
                        </div>

                        <div className={styles.agreeRow}>
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                id="agree-contract"
                                className={styles.agreeCheckbox}
                            />
                            <label htmlFor="agree-contract" className={styles.agreeLabel}>
                                I have read, understood, and agree to all terms and conditions in this Independent Contractor Agreement, including the commission structure, volume incentives, non-circumvention clause, and fraud liability provisions.
                            </label>
                        </div>

                        <button
                            className="btn btn--primary btn--lg btn--full"
                            onClick={handleSign}
                            disabled={!signatureName.trim() || !agreed}
                            id="sign-contract-btn"
                        >
                            Sign Contract
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
