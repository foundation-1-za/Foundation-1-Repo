'use client';

import { createBrowserClient } from '@supabase/ssr';
import { Database } from './database.types';

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';
    
    return createBrowserClient<Database>(url, key);
}
