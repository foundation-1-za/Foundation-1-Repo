// Export all Supabase clients from a single entry point
export { createClient as createBrowserClient } from './client';
export { createClient as createServerClient } from './server';
export { updateSession } from './middleware';
export type { Database } from './database.types';
