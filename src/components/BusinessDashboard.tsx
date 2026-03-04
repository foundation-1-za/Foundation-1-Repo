'use client';

import React, { useEffect, useState } from 'react';
import { User, Lead, LEAD_STATUS_LABELS, OnboardingStep, SupportRequest, SUPPORT_CATEGORY_LABELS, SupportRequestCategory } from '@/lib/types';
import { FileText, Check, Clock, Calendar, Upload, HelpCircle, MessageSquare, ChevronDown, ChevronUp, Send, AlertCircle, CheckCircle, Clock4, X } from 'lucide-react';
import StepProgressBar, { StepStatusBadge, ONBOARDING_STEPS } from './StepProgressBar';
import styles from './BusinessDashboard.module.css';

interface Props {
    user: User;
}

export default function BusinessDashboard({ user }: Props) {
    const [application, setApplication] = useState<Lead | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Help/Support section state
    const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
    const [showHelpSection, setShowHelpSection] = useState(false);
    const [showNewRequest, setShowNewRequest] = useState(false);
    const [newRequestCategory, setNewRequestCategory] = useState<SupportRequestCategory>('general');
    const [newRequestSubject, setNewRequestSubject] = useState('');
    const [newRequestDescription, setNewRequestDescription] = useState('');
    const [submittingRequest, setSubmittingRequest] = useState(false);

    // Determine current onboarding step based on application data
    const getCurrentStep = (lead: Lead | null): OnboardingStep => {
        if (!lead) return 'registration';
        
        // Use the stored onboarding step if available
        if (lead.onboardingStep) {
            return lead.onboardingStep;
        }
        
        // Otherwise, infer from legacy status
        switch (lead.currentStatus) {
            case 'submitted':
                return lead.utilityBillFileName ? 'waiting_proposal' : 'utility_bill';
            case 'pre_validated':
            case 'partner_review':
                return 'waiting_proposal';
            case 'approved':
                return 'proposal_received';
            case 'contract_signed':
                return 'contract_signed';
            case 'rejected':
                return 'final_decision';
            default:
                return 'registration';
        }
    };

    const currentStep = getCurrentStep(application);

    useEffect(() => {
        // Fetch the "Lead" record associated with this user
        // We use the existing leads API
        fetch(`/api/leads?userId=${user.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.leads && data.leads.length > 0) {
                    setApplication(data.leads[0]);
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, [user.id]);

    if (isLoading) return <div>Loading application data...</div>;

    if (!application) {
        return (
            <div className={styles.dashboard}>
                <div className={styles.welcome}>
                    <h2 className={styles.welcomeTitle}>Welcome, {user.firstName}</h2>
                    <p className={styles.welcomeSubtitle}>Complete your registration to get started with Generocity.</p>
                </div>
                <StepProgressBar 
                    currentStep="registration" 
                    finalStatus={undefined}
                />
            </div>
        );
    }

    // Sort history by timestamp descending
    const history = [...application.statusHistory].sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const needsUtilityBill = currentStep === 'utility_bill' || currentStep === 'registration';

    // Support request handlers
    const handleSubmitSupportRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingRequest(true);
        
        const request: SupportRequest = {
            id: `req_${Date.now()}`,
            userId: user.id,
            businessName: user.businessName || `${user.firstName} ${user.lastName}`,
            category: newRequestCategory,
            subject: newRequestSubject,
            description: newRequestDescription,
            status: 'open',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            priority: 'medium'
        };
        
        // Simulate API call - in production this would POST to an API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setSupportRequests([request, ...supportRequests]);
        setNewRequestSubject('');
        setNewRequestDescription('');
        setShowNewRequest(false);
        setSubmittingRequest(false);
        alert('Support request submitted! Our team will respond within 24 hours.');
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'open': return <AlertCircle size={16} className={styles.statusOpen} />;
            case 'in_progress': return <Clock4 size={16} className={styles.statusInProgress} />;
            case 'resolved': return <CheckCircle size={16} className={styles.statusResolved} />;
            default: return <X size={16} className={styles.statusClosed} />;
        }
    };

    return (
        <div className={styles.dashboard}>
            <div className={styles.welcome}>
                <h2 className={styles.welcomeTitle}>{user.businessName || `${user.firstName} ${user.lastName}`}</h2>
                <p className={styles.welcomeSubtitle}>
                    Current Status: <StepStatusBadge 
                        currentStep={currentStep} 
                        finalStatus={application.onboardingStatus} 
                    />
                </p>
            </div>

            {/* Step Progress Bar */}
            <StepProgressBar 
                currentStep={currentStep} 
                finalStatus={application.onboardingStatus}
            />

            {/* Utility Bill Upload CTA - Show when needed */}
            {needsUtilityBill && (
                <div className={`${styles.statusCard} ${styles.actionCard}`}>
                    <div className={styles.cardHeader}>
                        <Upload size={20} className={styles.actionIcon} />
                        <span className={styles.cardTitle}>Upload Utility Bill</span>
                    </div>
                    <p className={styles.actionText}>
                        Please upload your latest utility bill (minimum 6 months) to proceed with the solar feasibility assessment.
                    </p>
                    <a href="/dashboard/documents" className="btn btn--primary">
                        Upload Now
                    </a>
                </div>
            )}

            <div className={styles.statusCard}>
                <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>Application Timeline</span>
                </div>

                <div className={styles.timelineContainer}>
                    {history.map((entry, idx) => (
                        <div key={idx} className={styles.timelineRow}>
                            <div className={`${styles.timelineIcon} ${idx === 0 ? styles.timelineIconActive : ''}`}>
                                {idx === 0 ? <Check size={16} /> : <Clock size={16} />}
                            </div>
                            <div className={styles.timelineContent}>
                                <div className={styles.timelineStatus}>{LEAD_STATUS_LABELS[entry.status]}</div>
                                <div className={styles.timelineDate}>
                                    {new Date(entry.timestamp).toLocaleDateString()} at {new Date(entry.timestamp).toLocaleTimeString()}
                                </div>
                                {entry.note && (
                                    <div className={styles.timelineNote}>{entry.note}</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.statusCard}>
                <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>Submitted Documents</span>
                </div>
                <div className={styles.docsGrid}>
                    {application.utilityBillFileName && (
                        <div className={styles.docCard}>
                            <FileText size={20} className={styles.docIcon} />
                            <div className={styles.docName}>{application.utilityBillFileName}</div>
                        </div>
                    )}
                    {/* Add more docs here if we supported more */}
                </div>
            </div>

            {/* Help & Support Section */}
            <div className={`${styles.statusCard} ${styles.helpCard}`}>
                <div 
                    className={styles.cardHeader}
                    onClick={() => setShowHelpSection(!showHelpSection)}
                    style={{ cursor: 'pointer' }}
                >
                    <HelpCircle size={20} className={styles.helpIcon} />
                    <span className={styles.cardTitle}>Help & Support</span>
                    <span className={styles.helpSubtitle}>Request assistance with solar products or services</span>
                    {showHelpSection ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                
                {showHelpSection && (
                    <div className={styles.helpContent}>
                        {/* New Request Button */}
                        {!showNewRequest && (
                            <button 
                                className={styles.newRequestBtn}
                                onClick={() => setShowNewRequest(true)}
                            >
                                <MessageSquare size={16} />
                                Create New Support Request
                            </button>
                        )}

                        {/* New Request Form */}
                        {showNewRequest && (
                            <form onSubmit={handleSubmitSupportRequest} className={styles.requestForm}>
                                <h4>New Support Request</h4>
                                
                                <div className={styles.formGroup}>
                                    <label>Category</label>
                                    <select 
                                        value={newRequestCategory}
                                        onChange={(e) => setNewRequestCategory(e.target.value as SupportRequestCategory)}
                                        className={styles.select}
                                    >
                                        {Object.entries(SUPPORT_CATEGORY_LABELS).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Subject</label>
                                    <input
                                        type="text"
                                        value={newRequestSubject}
                                        onChange={(e) => setNewRequestSubject(e.target.value)}
                                        placeholder="Brief description of your issue"
                                        required
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Description</label>
                                    <textarea
                                        value={newRequestDescription}
                                        onChange={(e) => setNewRequestDescription(e.target.value)}
                                        placeholder="Please provide detailed information about your question or issue..."
                                        rows={4}
                                        required
                                        className={styles.textarea}
                                    />
                                </div>

                                <div className={styles.formActions}>
                                    <button 
                                        type="button" 
                                        className={styles.cancelBtn}
                                        onClick={() => setShowNewRequest(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className={styles.submitBtn}
                                        disabled={submittingRequest || !newRequestSubject.trim() || !newRequestDescription.trim()}
                                    >
                                        {submittingRequest ? (
                                            <>Submitting...</>
                                        ) : (
                                            <><Send size={16} /> Submit Request</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Support Request History */}
                        {supportRequests.length > 0 && (
                            <div className={styles.requestHistory}>
                                <h4>Your Support Requests</h4>
                                <div className={styles.requestList}>
                                    {supportRequests.map((request) => (
                                        <div key={request.id} className={styles.requestItem}>
                                            <div className={styles.requestHeader}>
                                                <div className={styles.requestCategory}>
                                                    {SUPPORT_CATEGORY_LABELS[request.category]}
                                                </div>
                                                <div className={`${styles.requestStatus} ${styles[request.status]}`}>
                                                    {getStatusIcon(request.status)}
                                                    <span>{request.status.replace('_', ' ')}</span>
                                                </div>
                                            </div>
                                            <div className={styles.requestSubject}>{request.subject}</div>
                                            <div className={styles.requestDescription}>{request.description}</div>
                                            <div className={styles.requestDate}>
                                                Submitted: {new Date(request.createdAt).toLocaleDateString()}
                                                {request.adminNotes && (
                                                    <div className={styles.adminNote}>
                                                        <strong>Admin Note:</strong> {request.adminNotes}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {supportRequests.length === 0 && !showNewRequest && (
                            <div className={styles.noRequests}>
                                <HelpCircle size={48} className={styles.noRequestsIcon} />
                                <p>No support requests yet.</p>
                                <p className={styles.noRequestsHint}>Have a question about your solar installation? Create a support request and our team will help you within 24 hours.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
