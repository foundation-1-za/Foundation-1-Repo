'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, HelpCircle, Sparkles, ArrowRight, BookOpen, DollarSign, Target, FileText, User } from 'lucide-react';
import Link from 'next/link';
import styles from './AssistPanel.module.css';

interface Message {
    id: string;
    type: 'user' | 'assistant';
    text: string;
    links?: { label: string; href: string; icon?: React.ReactNode }[];
    timestamp: Date;
}

interface SuggestedQuestion {
    label: string;
    query: string;
}

const KNOWLEDGE_BASE: Record<string, { response: string; links?: { label: string; href: string; icon?: React.ReactNode }[] }> = {
    'qualified': {
        response: 'A qualified business must meet ALL these criteria:\n\n1. Registered South African business\n2. Actively operational\n3. 6 months of utility bills available\n4. Minimum R15,000/month electricity bill\n5. Decision-maker expressed interest in zero-cost solar\n\nRemember: Your commission is R2,000 per qualified lead!',
        links: [
            { label: 'View Full Guidelines', href: '/dashboard/knowledge', icon: <BookOpen size={14} /> },
            { label: 'Submit a Lead', href: '/dashboard/submit', icon: <ArrowRight size={14} /> }
        ]
    },
    'qualify': {
        response: 'A qualified business must meet ALL these criteria:\n\n1. Registered South African business\n2. Actively operational\n3. 6 months of utility bills available\n4. Minimum R15,000/month electricity bill\n5. Decision-maker expressed interest in zero-cost solar\n\nRemember: Your commission is R2,000 per qualified lead!',
        links: [
            { label: 'View Full Guidelines', href: '/dashboard/knowledge', icon: <BookOpen size={14} /> },
            { label: 'Submit a Lead', href: '/dashboard/submit', icon: <ArrowRight size={14} /> }
        ]
    },
    'target': {
        response: 'Your weekly target is 20 qualified businesses.\n\nImportant notes:\n• You still get paid if you underperform (R2,000 per lead)\n• But consistent underperformance will reduce your payout rate\n• Track your progress on the Overview page\n• Volume bonuses apply for monthly targets!',
        links: [
            { label: 'View Weekly Progress', href: '/dashboard', icon: <Target size={14} /> },
            { label: 'View Commission Structure', href: '/dashboard/earnings', icon: <DollarSign size={14} /> }
        ]
    },
    'weekly': {
        response: 'Your weekly target is 20 qualified businesses.\n\nImportant notes:\n• You still get paid if you underperform (R2,000 per lead)\n• But consistent underperformance will reduce your payout rate\n• Track your progress on the Overview page\n• Volume bonuses apply for monthly targets!',
        links: [
            { label: 'View Weekly Progress', href: '/dashboard', icon: <Target size={14} /> },
            { label: 'View Commission Structure', href: '/dashboard/earnings', icon: <DollarSign size={14} /> }
        ]
    },
    'commission': {
        response: 'Your commission structure:\n\n• Base: R2,000 per qualified business\n• Volume bonuses for monthly targets:\n  - 10-19 clients: +R5,000 bonus\n  - 20-29 clients: +R10,000 bonus\n  - 30+ clients: +R15,000 bonus\n\nPaid within 72 hours of verification!',
        links: [
            { label: 'View Full Incentives', href: '/dashboard/earnings', icon: <DollarSign size={14} /> },
            { label: 'View Analytics', href: '/dashboard/analytics', icon: <ArrowRight size={14} /> }
        ]
    },
    'payment': {
        response: 'Your commission structure:\n\n• Base: R2,000 per qualified business\n• Volume bonuses for monthly targets:\n  - 10-19 clients: +R5,000 bonus\n  - 20-29 clients: +R10,000 bonus\n  - 30+ clients: +R15,000 bonus\n\nPaid within 72 hours of verification!',
        links: [
            { label: 'View Full Incentives', href: '/dashboard/earnings', icon: <DollarSign size={14} /> },
            { label: 'View Analytics', href: '/dashboard/analytics', icon: <ArrowRight size={14} /> }
        ]
    },
    'penalty': {
        response: 'About performance penalties:\n\n• You WILL still get paid if you underperform\n• R2,000 per qualified lead regardless\n• BUT consistent underperformance reduces future payout rates\n• The key is consistent effort and quality leads\n\nBottom line: Submit quality leads consistently and you\'ll be fine!',
        links: [
            { label: 'Read Performance Policy', href: '/dashboard/knowledge', icon: <BookOpen size={14} /> }
        ]
    },
    'underperform': {
        response: 'About performance penalties:\n\n• You WILL still get paid if you underperform\n• R2,000 per qualified lead regardless\n• BUT consistent underperformance reduces future payout rates\n• The key is consistent effort and quality leads\n\nBottom line: Submit quality leads consistently and you\'ll be fine!',
        links: [
            { label: 'Read Performance Policy', href: '/dashboard/knowledge', icon: <BookOpen size={14} /> }
        ]
    },
    'contract': {
        response: 'You need to sign your Independent Contractor Agreement before submitting leads.\n\nThe contract includes:\n• R2,000 commission per qualified lead\n• Volume bonus structure\n• 2-year non-circumvention clause\n• Fraud liability terms\n\nRead it carefully before signing!',
        links: [
            { label: 'View Contract', href: '/dashboard/contract', icon: <FileText size={14} /> }
        ]
    },
    'sign': {
        response: 'You need to sign your Independent Contractor Agreement before submitting leads.\n\nThe contract includes:\n• R2,000 commission per qualified lead\n• Volume bonus structure\n• 2-year non-circumvention clause\n• Fraud liability terms\n\nRead it carefully before signing!',
        links: [
            { label: 'View Contract', href: '/dashboard/contract', icon: <FileText size={14} /> }
        ]
    },
    'submit': {
        response: 'To submit a new lead:\n\n1. Ensure the business meets all 5 qualification criteria\n2. Get 6 months of utility bills\n3. Confirm R15,000+ monthly electricity spend\n4. Get clear expression of interest from decision-maker\n5. Fill in all required details\n\nRemember: Quality over quantity!',
        links: [
            { label: 'Submit New Lead', href: '/dashboard/submit', icon: <ArrowRight size={14} /> },
            { label: 'View Guidelines', href: '/dashboard/knowledge', icon: <BookOpen size={14} /> }
        ]
    },
    'lead': {
        response: 'To submit a new lead:\n\n1. Ensure the business meets all 5 qualification criteria\n2. Get 6 months of utility bills\n3. Confirm R15,000+ monthly electricity spend\n4. Get clear expression of interest from decision-maker\n5. Fill in all required details\n\nRemember: Quality over quantity!',
        links: [
            { label: 'Submit New Lead', href: '/dashboard/submit', icon: <ArrowRight size={14} /> },
            { label: 'View Guidelines', href: '/dashboard/knowledge', icon: <BookOpen size={14} /> }
        ]
    },
    'referral': {
        response: 'Your referral link is unique to you! When businesses register through your link, they\'re automatically associated with you.\n\nTo find your link:\n1. Go to Overview page\n2. Look for "Your Referral Link" section\n3. Copy and share with potential clients\n\nYou\'ll earn R2,000 commission when they sign up!',
        links: [
            { label: 'Get Referral Link', href: '/dashboard', icon: <ArrowRight size={14} /> }
        ]
    },
    'link': {
        response: 'Your referral link is unique to you! When businesses register through your link, they\'re automatically associated with you.\n\nTo find your link:\n1. Go to Overview page\n2. Look for "Your Referral Link" section\n3. Copy and share with potential clients\n\nYou\'ll earn R2,000 commission when they sign up!',
        links: [
            { label: 'Get Referral Link', href: '/dashboard', icon: <ArrowRight size={14} /> }
        ]
    },
    'analytics': {
        response: 'Your Analytics dashboard shows:\n\n• Total leads submitted\n• Conversion rate (% approved)\n• Weekly submission trend\n• Status breakdown of all leads\n• Estimated earnings\n\nUse this to track your performance against targets!',
        links: [
            { label: 'View Analytics', href: '/dashboard/analytics', icon: <ArrowRight size={14} /> }
        ]
    },
    'stats': {
        response: 'Your Analytics dashboard shows:\n\n• Total leads submitted\n• Conversion rate (% approved)\n• Weekly submission trend\n• Status breakdown of all leads\n• Estimated earnings\n\nUse this to track your performance against targets!',
        links: [
            { label: 'View Analytics', href: '/dashboard/analytics', icon: <ArrowRight size={14} /> }
        ]
    },
    'knowledge': {
        response: 'The Knowledge Base contains everything you need to succeed:\n\n• What is Generocity (Green Share VPP partnership)\n• Your role as lead generator\n• Qualified business criteria\n• Who we\'re looking for\n• Compensation & penalties\n• Getting started checklist\n\nBookmark this page and review it often!',
        links: [
            { label: 'Open Knowledge Base', href: '/dashboard/knowledge', icon: <BookOpen size={14} /> }
        ]
    },
    'help': {
        response: 'I can help you with:\n\n• What qualifies a business\n• Your weekly targets and penalties\n• Commission and payment structure\n• How to submit leads\n• Where to find your referral link\n• Understanding your analytics\n\nWhat would you like to know?',
        links: [
            { label: 'View Knowledge Base', href: '/dashboard/knowledge', icon: <BookOpen size={14} /> },
            { label: 'Submit a Lead', href: '/dashboard/submit', icon: <ArrowRight size={14} /> }
        ]
    },
    'guidelines': {
        response: 'The Knowledge Base contains everything you need to succeed:\n\n• What is Generocity (Green Share VPP partnership)\n• Your role as lead generator\n• Qualified business criteria\n• Who we\'re looking for\n• Compensation & penalties\n• Getting started checklist\n\nBookmark this page and review it often!',
        links: [
            { label: 'Open Knowledge Base', href: '/dashboard/knowledge', icon: <BookOpen size={14} /> }
        ]
    }
};

const SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
    { label: 'What counts as qualified?', query: 'What makes a business qualified?' },
    { label: 'Weekly target?', query: 'What is my weekly target?' },
    { label: 'How much do I earn?', query: 'What is my commission?' },
    { label: 'Submit a lead?', query: 'How do I submit a lead?' }
];

export default function AssistPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            type: 'assistant',
            text: 'Hi! I\'m your Generocity Assistant. I can help you with:\n\n• Understanding what qualifies a business\n• Your weekly targets and commission\n• How to submit leads\n• Where to find information\n\nWhat would you like to know?',
            links: [
                { label: 'View Knowledge Base', href: '/dashboard/knowledge', icon: <BookOpen size={14} /> },
                { label: 'Submit a Lead', href: '/dashboard/submit', icon: <ArrowRight size={14} /> }
            ],
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const findResponse = (query: string): { response: string; links?: { label: string; href: string; icon?: React.ReactNode }[] } => {
        const lowerQuery = query.toLowerCase();
        
        // Check for keyword matches
        for (const [keyword, data] of Object.entries(KNOWLEDGE_BASE)) {
            if (lowerQuery.includes(keyword)) {
                return data;
            }
        }

        // Default response if no match
        return {
            response: 'I\'m not sure I understand. Try asking about:\n\n• What qualifies a business\n• Your weekly target (20 businesses)\n• Commission structure (R2,000 per lead)\n• How to submit leads\n• Where to find your referral link\n• Analytics and performance stats\n\nOr visit the Knowledge Base for complete guidelines!',
            links: [
                { label: 'View Knowledge Base', href: '/dashboard/knowledge', icon: <BookOpen size={14} /> },
                { label: 'View Analytics', href: '/dashboard/analytics', icon: <ArrowRight size={14} /> }
            ]
        };
    };

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            text: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simulate typing delay
        setTimeout(() => {
            const response = findResponse(input);
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'assistant',
                text: response.response,
                links: response.links,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, assistantMessage]);
            setIsTyping(false);
        }, 800);
    };

    const handleSuggestedQuestion = (query: string) => {
        setInput(query);
        setTimeout(() => handleSend(), 100);
    };

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button 
                    className={styles.floatingButton}
                    onClick={() => setIsOpen(true)}
                    title="Get Help"
                >
                    <MessageCircle size={24} />
                    <span>Assist</span>
                </button>
            )}

            {/* Chat Panel */}
            {isOpen && (
                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <div className={styles.panelTitle}>
                            <Sparkles size={18} className={styles.sparkleIcon} />
                            <span>Generocity Assist</span>
                        </div>
                        <button 
                            className={styles.closeButton}
                            onClick={() => setIsOpen(false)}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className={styles.messagesContainer}>
                        {messages.map((msg) => (
                            <div 
                                key={msg.id} 
                                className={`${styles.message} ${styles[msg.type]}`}
                            >
                                <div className={styles.messageContent}>
                                    {msg.type === 'assistant' && (
                                        <div className={styles.assistantAvatar}>
                                            <HelpCircle size={14} />
                                        </div>
                                    )}
                                    <div className={styles.messageBody}>
                                        <p className={styles.messageText}>{msg.text}</p>
                                        {msg.links && msg.links.length > 0 && (
                                            <div className={styles.messageLinks}>
                                                {msg.links.map((link, idx) => (
                                                    <Link 
                                                        key={idx}
                                                        href={link.href}
                                                        className={styles.messageLink}
                                                        onClick={() => setIsOpen(false)}
                                                    >
                                                        {link.icon}
                                                        <span>{link.label}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className={`${styles.message} ${styles.assistant}`}>
                                <div className={styles.assistantAvatar}>
                                    <HelpCircle size={14} />
                                </div>
                                <div className={styles.typingIndicator}>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggested Questions */}
                    <div className={styles.suggestedQuestions}>
                        {SUGGESTED_QUESTIONS.map((q, idx) => (
                            <button
                                key={idx}
                                className={styles.suggestedQuestion}
                                onClick={() => handleSuggestedQuestion(q.query)}
                            >
                                {q.label}
                            </button>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className={styles.inputArea}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask me anything..."
                            className={styles.input}
                        />
                        <button 
                            className={styles.sendButton}
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
