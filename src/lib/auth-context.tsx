'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User } from './types';
import { useUser, useClerk, useAuth as useClerkAuth } from '@clerk/nextjs';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone: string;
    }) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { user: clerkUser, isLoaded, isSignedIn } = useUser();
    const { signOut } = useClerk();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Map Clerk user to internal User type
    useEffect(() => {
        if (isLoaded) {
            if (isSignedIn && clerkUser) {
                const metadata = clerkUser.publicMetadata as Record<string, any>;
                const unsafeMetadata = clerkUser.unsafeMetadata as Record<string, any>;

                setUser({
                    id: clerkUser.id,
                    email: clerkUser.primaryEmailAddress?.emailAddress || '',
                    firstName: clerkUser.firstName || '',
                    lastName: clerkUser.lastName || '',
                    role: (metadata?.role as any) || 'sales_rep',
                    phone: (unsafeMetadata?.phone as string) || '',
                    status: (metadata?.status as any) || 'pending',
                    referenceCode: (metadata?.referenceCode as string) || '',
                    referralLink: (metadata?.referralLink as string) || '',
                    contractSigned: (metadata?.contractSigned as boolean) || false,
                    idNumber: (unsafeMetadata?.idNumber as string) || '',
                    homeAddress: (unsafeMetadata?.homeAddress as string) || '',
                    businessName: (unsafeMetadata?.businessName as string) || '',
                    registrationNumber: (unsafeMetadata?.registrationNumber as string) || '',
                    industry: (unsafeMetadata?.industry as string) || '',
                    employees: (unsafeMetadata?.employees as string) || '',
                } as User);
            } else {
                setUser(null);
            }
            setIsLoading(false);
        }
    }, [isLoaded, isSignedIn, clerkUser]);

    const login = useCallback(async (email: string, password: string) => {
        // Clerk handles login via its own components. 
        // This is a stub for backward compatibility if needed.
        return { success: false, error: 'Please use the login form' };
    }, []);

    const register = useCallback(async (regData: any) => {
        // Clerk handles registration via its own components.
        return { success: false, error: 'Please use the registration form' };
    }, []);

    const logout = useCallback(async () => {
        await signOut();
        setUser(null);
    }, [signOut]);

    const updateProfile = useCallback(async (updates: Partial<User>) => {
        if (!clerkUser) return;

        // In Clerk, we update metadata. 
        // For production, this should happen via a backend API to update database + Clerk metadata.
        try {
            await clerkUser.update({
                unsafeMetadata: {
                    ...clerkUser.unsafeMetadata,
                    ...updates,
                }
            });
            setUser((prev) => prev ? { ...prev, ...updates } : null);
        } catch (error: any) {
            console.error('Error updating profile:', error);
        }
    }, [clerkUser]);

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
