'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Lead } from '@/lib/types';
import { Upload, FileText, Download, Trash2 } from 'lucide-react';
import styles from './page.module.css';

export default function DocumentsPage() {
    const { user } = useAuth();
    const [application, setApplication] = useState<Lead | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Simulated "additional docs" state
    const [additionalDocs, setAdditionalDocs] = useState<string[]>([]);

    useEffect(() => {
        if (user) {
            fetch(`/api/leads?userId=${user.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.leads && data.leads.length > 0) {
                        setApplication(data.leads[0]);
                    }
                    setIsLoading(false);
                })
                .catch(() => setIsLoading(false));
        }
    }, [user]);

    const handleUpload = (fileName?: string) => {
        const docName = fileName || `Document_${new Date().getTime()}.pdf`;
        setAdditionalDocs(prev => [...prev, docName]);
        alert(`Document uploaded: ${docName}`);
    };

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            Array.from(files).forEach(file => {
                handleUpload(file.name);
            });
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            Array.from(files).forEach(file => {
                handleUpload(file.name);
            });
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Documents</h1>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.png,.jpg,.jpeg"
                multiple
                style={{ display: 'none' }}
            />
            <div 
                className={`${styles.uploadZone} ${isDragging ? styles.uploadZoneDragging : ''}`}
                onClick={handleClick}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <Upload size={48} className={styles.uploadIcon} />
                <p className={styles.uploadText}>
                    {isDragging ? 'Drop files here' : 'Click or drag & drop to upload'}
                </p>
                <p className={styles.uploadSub}>PDF, PNG, JPG up to 10MB</p>
            </div>

            <div>
                <h2 className={styles.sectionTitle}>Uploaded Files</h2>
                <div className={styles.docsList}>
                    {application?.utilityBillFileName && (
                        <div className={styles.docItem}>
                            <FileText size={24} />
                            <div className={styles.docInfo}>
                                <div className={styles.docName}>{application.utilityBillFileName}</div>
                                <div className={styles.docMeta}>Initial Submission • Utility Bill</div>
                            </div>
                            <button className={styles.downloadBtn} title="Download">
                                <Download size={20} />
                            </button>
                        </div>
                    )}

                    {additionalDocs.map((doc, idx) => (
                        <div key={idx} className={styles.docItem}>
                            <FileText size={24} />
                            <div className={styles.docInfo}>
                                <div className={styles.docName}>{doc}</div>
                                <div className={styles.docMeta}>Uploaded Just Now</div>
                            </div>
                            <button className={styles.downloadBtn} title="Download">
                                <Download size={20} />
                            </button>
                            <button className={styles.downloadBtn} style={{ color: 'var(--color-error)' }} onClick={() => {
                                setAdditionalDocs(prev => prev.filter(d => d !== doc));
                            }}>
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}

                    {!application?.utilityBillFileName && additionalDocs.length === 0 && (
                        <p style={{ color: 'var(--color-text-secondary)' }}>No documents found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
