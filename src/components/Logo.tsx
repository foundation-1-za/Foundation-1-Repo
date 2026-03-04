'use client';

import React from 'react';
import Image from 'next/image';
import { useTheme } from '@/lib/theme-context';

interface LogoProps {
    className?: string; // Additional classes for positioning/sizing if needed
    size?: number;      // Pixel size for width/height
}

export default function Logo({ className, size = 32 }: LogoProps) {
    const { theme } = useTheme();
    const logoSource = theme === 'light' ? '/logo-light-v2.png' : '/logo.png';

    return (
        <div className={className} style={{ width: size, height: size, position: 'relative' }}>
            {/* 
                Using next/image to load the user's logo file.
                The files must exist at /public/logo.png and /public/logo-light.png
            */}
            <Image
                key={logoSource}
                src={logoSource}
                alt="Foundation-1 Logo"
                width={size}
                height={size}
                property="true"
                style={{
                    objectFit: 'contain',
                    maxWidth: '100%',
                    maxHeight: '100%'
                }}
            />
        </div>
    );
}
