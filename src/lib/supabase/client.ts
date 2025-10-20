import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Get environment variables with fallbacks
const getSupabaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }
  return url;
};

const getSupabaseAnonKey = () => {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  }
  return key;
};

const getSupabaseServiceKey = () => {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }
  return key;
};

// Browser client for client components
export const createSupabaseBrowserClient = () => {
  return createBrowserClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey()
  );
};

// Simple client for non-SSR usage (lazy initialization)
let _supabase: ReturnType<typeof createClient<Database>> | null = null;

export const getSupabaseClient = () => {
  if (!_supabase) {
    _supabase = createClient<Database>(
      getSupabaseUrl(),
      getSupabaseAnonKey()
    );
  }
  return _supabase;
};

// Getter for supabase client (use this instead of direct import)
export const supabase = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get: (target, prop) => {
    const client = getSupabaseClient();
    return (client as any)[prop];
  }
});

// Admin client (server-side only - DO NOT use in client components)
let _supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null;

export const getSupabaseAdmin = () => {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient<Database>(
      getSupabaseUrl(),
      getSupabaseServiceKey(),
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }
  return _supabaseAdmin;
};

// Getter for admin client (use this instead of direct import)
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get: (target, prop) => {
    const client = getSupabaseAdmin();
    return (client as any)[prop];
  }
});
