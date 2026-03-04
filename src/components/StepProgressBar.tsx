'use client';

import React from 'react';
import { Check, Clock, FileText, FileCheck, Send, PenTool, ShieldCheck, Ban, Building } from 'lucide-react';
import styles from './StepProgressBar.module.css';

export type OnboardingStep =
    | 'registration'
    | 'utility_bill'
    | 'waiting_proposal'
    | 'proposal_received'
    | 'proposal_signed'
    | 'contract_sent'
    | 'contract_signed'
    | 'kyc_documents'
    | 'final_decision';

export interface StepInfo {
    id: OnboardingStep;
    label: string;
    description: string;
    icon: React.ReactNode;
}

export const ONBOARDING_STEPS: StepInfo[] = [
    {
        id: 'registration',
        label: 'Step 1',
        description: 'Registration',
        icon: <Building size={18} />,
    },
    {
        id: 'utility_bill',
        label: 'Step 2',
        description: 'Upload utility bill (minimum 6 months)',
        icon: <FileText size={18} />,
    },
    {
        id: 'waiting_proposal',
        label: 'Step 3',
        description: 'Waiting for proposal',
        icon: <Clock size={18} />,
    },
    {
        id: 'proposal_received',
        label: 'Step 4',
        description: 'Proposal received',
        icon: <FileCheck size={18} />,
    },
    {
        id: 'proposal_signed',
        label: 'Step 5',
        description: 'Business has signed and submitted proposal',
        icon: <PenTool size={18} />,
    },
    {
        id: 'contract_sent',
        label: 'Step 6',
        description: 'Contract has been sent to client',
        icon: <Send size={18} />,
    },
    {
        id: 'contract_signed',
        label: 'Step 7',
        description: 'Client has signed Contract',
        icon: <FileCheck size={18} />,
    },
    {
        id: 'kyc_documents',
        label: 'Step 8',
        description: 'KYC - Business to upload KYC documents',
        icon: <ShieldCheck size={18} />,
    },
    {
        id: 'final_decision',
        label: 'Step 9',
        description: 'Business Accepted or Rejected',
        icon: <Check size={18} />,
    },
];

interface StepProgressBarProps {
    currentStep: OnboardingStep;
    finalStatus?: 'accepted' | 'rejected' | 'pending';
    compact?: boolean;
}

export default function StepProgressBar({ currentStep, finalStatus, compact }: StepProgressBarProps) {
    const currentStepIndex = ONBOARDING_STEPS.findIndex(s => s.id === currentStep);

    return (
        <div className={`${styles.container} ${compact ? styles.compact : ''}`}>
            <div className={styles.steps}>
                {ONBOARDING_STEPS.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const isPending = index > currentStepIndex;

                    // Special styling for final decision step
                    const isFinalStep = step.id === 'final_decision';
                    const showRejected = isFinalStep && finalStatus === 'rejected';
                    const showAccepted = isFinalStep && finalStatus === 'accepted';

                    return (
                        <div key={step.id} className={styles.stepWrapper}>
                            <div className={styles.step}>
                                <div
                                    className={`${styles.icon} ${
                                        isCompleted ? styles.completed : ''
                                    } ${isCurrent ? styles.current : ''} ${
                                        isPending ? styles.pending : ''
                                    } ${showRejected ? styles.rejected : ''} ${
                                        showAccepted ? styles.accepted : ''
                                    }`}
                                >
                                    {showRejected ? (
                                        <Ban size={18} />
                                    ) : isCompleted || (isCurrent && !showRejected) ? (
                                        step.icon
                                    ) : (
                                        <span className={styles.stepNumber}>{index + 1}</span>
                                    )}
                                </div>
                                <div className={styles.stepContent}>
                                    <span className={styles.stepLabel}>{step.label}</span>
                                    <span className={styles.stepDescription}>{step.description}</span>
                                </div>
                            </div>
                            {index < ONBOARDING_STEPS.length - 1 && (
                                <div
                                    className={`${styles.connector} ${
                                        isCompleted ? styles.connectorCompleted : ''
                                    }`}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Simple status badge component for compact views
export function StepStatusBadge({
    currentStep,
    finalStatus,
}: {
    currentStep: OnboardingStep;
    finalStatus?: 'accepted' | 'rejected' | 'pending';
}) {
    const currentStepInfo = ONBOARDING_STEPS.find(s => s.id === currentStep);

    let badgeClass = styles.badgePending;
    let text = currentStepInfo?.description || 'Processing...';

    if (finalStatus === 'accepted') {
        badgeClass = styles.badgeAccepted;
        text = 'Business Accepted';
    } else if (finalStatus === 'rejected') {
        badgeClass = styles.badgeRejected;
        text = 'Business Rejected';
    }

    return <span className={`${styles.statusBadge} ${badgeClass}`}>{text}</span>;
}
