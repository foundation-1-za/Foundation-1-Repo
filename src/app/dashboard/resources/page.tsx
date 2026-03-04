'use client';

import React, { useState } from 'react';
import { Download, FileText, Image as ImageIcon, File, ExternalLink, Search, Filter } from 'lucide-react';
import styles from './page.module.css';

// Resource types
interface Resource {
    id: string;
    title: string;
    description: string;
    fileName: string;
    fileType: 'pdf' | 'doc' | 'image' | 'xlsx' | 'other';
    fileSize: string;
    category: 'brochures' | 'presentations' | 'contracts' | 'guides' | 'media';
    uploadedAt: string;
    downloadUrl: string;
}

// Sample resources - These will be replaced with actual uploaded documents
const SAMPLE_RESOURCES: Resource[] = [
    {
        id: '1',
        title: 'Generocity Product Brochure',
        description: 'Complete overview of our solar solutions, pricing, and benefits for businesses.',
        fileName: 'generocity-product-brochure.pdf',
        fileType: 'pdf',
        fileSize: '2.4 MB',
        category: 'brochures',
        uploadedAt: '2026-02-18',
        downloadUrl: '/resources/generocity-product-brochure.pdf'
    },
    {
        id: '2',
        title: 'Sales Presentation Template',
        description: 'Use this PowerPoint template when presenting to potential business clients.',
        fileName: 'sales-presentation-template.pptx',
        fileType: 'other',
        fileSize: '5.1 MB',
        category: 'presentations',
        uploadedAt: '2026-02-18',
        downloadUrl: '/resources/sales-presentation-template.pptx'
    },
    {
        id: '3',
        title: 'Commission Structure Guide',
        description: 'Detailed breakdown of commission tiers, volume bonuses, and payment schedules.',
        fileName: 'commission-structure-guide.pdf',
        fileType: 'pdf',
        fileSize: '1.8 MB',
        category: 'guides',
        uploadedAt: '2026-02-18',
        downloadUrl: '/resources/commission-structure-guide.pdf'
    },
    {
        id: '4',
        title: 'Lead Qualification Checklist',
        description: 'Step-by-step checklist to ensure businesses meet qualification criteria.',
        fileName: 'lead-qualification-checklist.pdf',
        fileType: 'pdf',
        fileSize: '890 KB',
        category: 'guides',
        uploadedAt: '2026-02-18',
        downloadUrl: '/resources/lead-qualification-checklist.pdf'
    },
    {
        id: '5',
        title: 'Solar System Infographics',
        description: 'Visual diagrams explaining how our solar solutions work for businesses.',
        fileName: 'solar-system-infographics.zip',
        fileType: 'image',
        fileSize: '12.5 MB',
        category: 'media',
        uploadedAt: '2026-02-18',
        downloadUrl: '/resources/solar-system-infographics.zip'
    },
    {
        id: '6',
        title: 'Sales Agent Agreement Template',
        description: 'Standard contract template for new sales agent partnerships.',
        fileName: 'sales-agent-agreement-template.docx',
        fileType: 'doc',
        fileSize: '45 KB',
        category: 'contracts',
        uploadedAt: '2026-02-18',
        downloadUrl: '/resources/sales-agent-agreement-template.docx'
    }
];

const CATEGORY_LABELS: Record<Resource['category'], string> = {
    brochures: 'Brochures & Flyers',
    presentations: 'Presentations',
    contracts: 'Contracts & Agreements',
    guides: 'Guides & Training',
    media: 'Images & Media'
};

const FILE_TYPE_ICONS: Record<Resource['fileType'], React.ReactNode> = {
    pdf: <FileText size={24} className={styles.pdfIcon} />,
    doc: <FileText size={24} className={styles.docIcon} />,
    xlsx: <FileText size={24} className={styles.sheetIcon} />,
    image: <ImageIcon size={24} className={styles.imageIcon} />,
    other: <File size={24} className={styles.fileIcon} />
};

export default function ResourcesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');

    const filteredResources = SAMPLE_RESOURCES.filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || resource.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const handleDownload = (resource: Resource) => {
        // In production, this would trigger an actual file download
        alert(`Downloading: ${resource.fileName}\n\nIn production, this would download the actual file from: ${resource.downloadUrl}`);
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1 className={styles.title}>Sales Resources</h1>
                <p className={styles.subtitle}>Download brochures, presentations, guides, and other materials for your sales activities.</p>
            </header>

            {/* Controls */}
            <div className={styles.controls}>
                <div className={styles.searchBox}>
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search resources..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
                <div className={styles.filterBox}>
                    <Filter size={18} />
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="all">All Categories</option>
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Resources Grid */}
            <div className={styles.resourcesGrid}>
                {filteredResources.map(resource => (
                    <div key={resource.id} className={styles.resourceCard}>
                        <div className={styles.resourceIcon}>
                            {FILE_TYPE_ICONS[resource.fileType]}
                        </div>
                        <div className={styles.resourceContent}>
                            <div className={styles.resourceHeader}>
                                <span className={styles.categoryBadge}>
                                    {CATEGORY_LABELS[resource.category]}
                                </span>
                                <span className={styles.fileSize}>{resource.fileSize}</span>
                            </div>
                            <h3 className={styles.resourceTitle}>{resource.title}</h3>
                            <p className={styles.resourceDescription}>{resource.description}</p>
                            <div className={styles.resourceFooter}>
                                <span className={styles.fileName}>{resource.fileName}</span>
                                <button
                                    className={styles.downloadBtn}
                                    onClick={() => handleDownload(resource)}
                                >
                                    <Download size={16} />
                                    Download
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredResources.length === 0 && (
                <div className={styles.emptyState}>
                    <File size={48} className={styles.emptyIcon} />
                    <h3>No resources found</h3>
                    <p>Try adjusting your search or filter criteria.</p>
                </div>
            )}

            {/* Upload Info Section */}
            <div className={styles.uploadInfo}>
                <h3>Need More Resources?</h3>
                <p>Contact the admin team to request additional documents or materials for your sales activities.</p>
                <a href="mailto:admin@foundation-1.co.za" className={styles.contactLink}>
                    <ExternalLink size={16} />
                    Contact Admin Team
                </a>
            </div>
        </div>
    );
}
