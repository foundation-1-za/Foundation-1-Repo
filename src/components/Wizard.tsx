'use client';

import React, { useState } from 'react';
import styles from './Wizard.module.css';

interface WizardStep {
    id: string;
    label: string;
    component: React.ReactNode;
    isValid?: boolean; // Can define if this step is complete
}

interface WizardProps {
    steps: WizardStep[];
    onComplete: () => void;
    title: string;
    isLoading?: boolean;
}

export default function Wizard({ steps, onComplete, title, isLoading }: WizardProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    const currentStep = steps[currentStepIndex];
    const isLastStep = currentStepIndex === steps.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            onComplete();
        } else {
            setCurrentStepIndex((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setCurrentStepIndex((prev) => Math.max(0, prev - 1));
    };

    const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

    return (
        <div className={styles.wizardContainer}>
            <div className={styles.header}>
                <h2 className={styles.title}>{title}</h2>
                <div className={styles.progressContainer}>
                    <div
                        className={styles.progressBar}
                        style={{ width: `${progressPercentage}%` }}
                        role="progressbar"
                        aria-valuenow={progressPercentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    />
                </div>
                <div className={styles.stepIndicator}>
                    Step {currentStepIndex + 1} of {steps.length}: {currentStep.label}
                </div>
            </div>

            <div className={styles.content}>
                {currentStep.component}
            </div>

            <div className={styles.footer}>
                <button
                    onClick={handleBack}
                    className="btn btn--secondary"
                    disabled={currentStepIndex === 0 || isLoading}
                >
                    Back
                </button>
                <button
                    onClick={handleNext}
                    className="btn btn--primary"
                    disabled={isLoading || (currentStep.isValid === false)} // If validation provided
                >
                    {isLoading ? 'Submitting...' : (isLastStep ? 'Submit Application' : 'Next')}
                </button>
            </div>
        </div>
    );
}
