'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User } from './types';
import { createClient } from './supabase/client';

// Mock users for local development (fallback when Supabase not connected)
const mockUsers: Array<{ email: string; password: string; user: User }> = [
    {
        email: 'admin@foundation-1.co.za',
        password: 'admin123',
        user: {
            id: 'admin-001',
            email: 'admin@foundation-1.co.za',
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            phone: '+27 11 000 0000',
            status: 'approved',
        }
    },
    {
        email: 'demo@foundation-1.co.za',
        password: 'demo123',
        user: {
            id: 'rep-001',
            email: 'demo@foundation-1.co.za',
            firstName: 'James',
            lastName: 'Molefe',
            role: 'sales_rep',
            phone: '+27 82 000 0001',
            status: 'approved',
            referenceCode: 'F1-JMOL-4821',
            contractSigned: true,
        }
    },
    {
        email: 'sarah@foundation-1.co.za',
        password: 'sarah123',
        user: {
            id: 'rep-002',
            email: 'sarah@foundation-1.co.za',
            firstName: 'Sarah',
            lastName: 'Naidoo',
            role: 'sales_rep',
            phone: '+27 83 000 0002',
            status: 'approved',
            referenceCode: 'F1-SNAI-7293',
            contractSigned: true,
        }
    },
    {
        email: 'business@foundation-1.co.za',
        password: 'business123',
        user: {
            id: 'biz-001',
            email: 'business@foundation-1.co.za',
            firstName: 'John',
            lastName: 'Smith',
            role: 'business',
            phone: '0711230333',
            status: 'approved',
            businessName: 'Demo Business (Pty) Ltd',
        }
    },
];

function mockAuthenticate(email: string, password: string): User | null {
    const found = mockUsers.find(u => u.email === email && u.password === password);
    return found?.user || null;
}

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
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    // Fetch user profile from Supabase
    const fetchUserProfile = useCallback(async (userId: string) => {
        const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error || !profile) return null;

        return {
            id: profile.id,
            email: profile.id, // We get email from auth
            firstName: profile.first_name,
            lastName: profile.last_name,
            role: profile.role,
            phone: profile.phone || '',
            status: profile.status,
            bankName: profile.bank_name,
            accountNumber: profile.account_number,
            branchCode: profile.branch_code,
            referenceCode: profile.reference_code,
            referralLink: profile.referral_link,
            contractSigned: profile.contract_signed,
            contractSignedAt: profile.contract_signed_at,
            idNumber: profile.id_number,
            homeAddress: profile.home_address,
            businessName: profile.business_name,
            registrationNumber: profile.registration_number,
            industry: profile.industry,
            employees: profile.employees,
            primaryContactRole: profile.primary_contact_role,
            utilityBillFileName: profile.utility_bill_url,
            salesRepRef: profile.sales_rep_ref,
        } as User;
    }, [supabase]);

    // Listen for auth changes
    useEffect(() => {
        // Check for mock user in localStorage first (fallback mode)
        const checkMockUser = () => {
            if (typeof window !== 'undefined') {
                const stored = localStorage.getItem('f1_user');
                if (stored) {
                    try {
                        setUser(JSON.parse(stored));
                        setIsLoading(false);
                        return true;
                    } catch {
                        localStorage.removeItem('f1_user');
                    }
                }
            }
            return false;
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const profile = await fetchUserProfile(session.user.id);
                if (profile) {
                    // Add email from auth
                    setUser({ ...profile, email: session.user.email || profile.id });
                }
            } else {
                // Check mock user if no session
                if (!checkMockUser()) {
                    setUser(null);
                }
            }
            setIsLoading(false);
        });

        // Initial check
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session?.user) {
                const profile = await fetchUserProfile(session.user.id);
                if (profile) {
                    setUser({ ...profile, email: session.user.email || profile.id });
                }
            } else {
                // Check mock user if no session
                checkMockUser();
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [supabase, fetchUserProfile]);

    const login = useCallback(async (email: string, password: string) => {
        try {
            // Try Supabase auth first
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                // Fallback to mock data for local development
                const mockUser = mockAuthenticate(email, password);
                if (mockUser) {
                    setUser(mockUser);
                    // Store in localStorage for session
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('f1_user', JSON.stringify(mockUser));
                    }
                    return { success: true };
                }
                return { success: false, error: error.message };
            }

            if (data.user) {
                const profile = await fetchUserProfile(data.user.id);
                if (profile) {
                    setUser({ ...profile, email: data.user.email || profile.id });
                    return { success: true };
                }
            }
            return { success: false, error: 'Profile not found' };
        } catch {
            // Fallback to mock data when Supabase not connected
            const mockUser = mockAuthenticate(email, password);
            if (mockUser) {
                setUser(mockUser);
                // Store in localStorage for session
                if (typeof window !== 'undefined') {
                    localStorage.setItem('f1_user', JSON.stringify(mockUser));
                }
                return { success: true };
            }
            return { success: false, error: 'Invalid credentials. Try admin@foundation-1.co.za / admin123' };
        }
    }, [supabase, fetchUserProfile]);

    const register = useCallback(async (regData: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone: string;
    }) => {
        try {
            // Sign up with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: regData.email,
                password: regData.password,
                options: {
                    data: {
                        first_name: regData.firstName,
                        last_name: regData.lastName,
                        phone: regData.phone,
                    },
                },
            });

            if (authError) {
                // Fallback to mock registration
                const newUser: User = {
                    id: `user-${Date.now()}`,
                    email: regData.email,
                    firstName: regData.firstName,
                    lastName: regData.lastName,
                    role: 'sales_rep',
                    phone: regData.phone,
                    status: 'pending',
                };
                setUser(newUser);
                if (typeof window !== 'undefined') {
                    localStorage.setItem('f1_user', JSON.stringify(newUser));
                }
                return { success: true };
            }

            if (authData.user) {
                // Profile will be created by database trigger or edge function
                // For now, wait a moment and fetch
                await new Promise(resolve => setTimeout(resolve, 500));
                const profile = await fetchUserProfile(authData.user.id);
                if (profile) {
                    setUser({ ...profile, email: authData.user.email || profile.id });
                    return { success: true };
                }
            }
            return { success: false, error: 'Registration incomplete' };
        } catch {
            // Fallback to mock registration
            const newUser: User = {
                id: `user-${Date.now()}`,
                email: regData.email,
                firstName: regData.firstName,
                lastName: regData.lastName,
                role: 'sales_rep',
                phone: regData.phone,
                status: 'pending',
            };
            setUser(newUser);
            if (typeof window !== 'undefined') {
                localStorage.setItem('f1_user', JSON.stringify(newUser));
            }
            return { success: true };
        }
    }, [supabase, fetchUserProfile]);

    const logout = useCallback(async () => {
        await supabase.auth.signOut();
        // Also clear mock user from localStorage
        if (typeof window !== 'undefined') {
            localStorage.removeItem('f1_user');
        }
        setUser(null);
    }, [supabase]);

    const updateProfile = useCallback(async (updates: Partial<User>) => {
        if (!user) return;

        const dbUpdates: Record<string, unknown> = {};
        if (updates.firstName) dbUpdates.first_name = updates.firstName;
        if (updates.lastName) dbUpdates.last_name = updates.lastName;
        if (updates.phone) dbUpdates.phone = updates.phone;
        if (updates.bankName) dbUpdates.bank_name = updates.bankName;
        if (updates.accountNumber) dbUpdates.account_number = updates.accountNumber;
        if (updates.branchCode) dbUpdates.branch_code = updates.branchCode;
        if (updates.idNumber) dbUpdates.id_number = updates.idNumber;
        if (updates.homeAddress) dbUpdates.home_address = updates.homeAddress;

        const { error } = await supabase
            .from('user_profiles')
            .update(dbUpdates)
            .eq('id', user.id);

        if (!error) {
            setUser((prev) => prev ? { ...prev, ...updates } : null);
        }
    }, [supabase, user]);

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
