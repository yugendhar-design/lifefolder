import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from Vite env or local storage fallback
let storedUrl = typeof window !== 'undefined' ? localStorage.getItem('lifefolder_supabase_url') : null;
let storedKey = typeof window !== 'undefined' ? localStorage.getItem('lifefolder_supabase_key') : null;

if (storedUrl) {
  storedUrl = storedUrl.trim();
  if (!storedUrl.startsWith('http://') && !storedUrl.startsWith('https://')) {
    storedUrl = `https://${storedUrl}`;
  }
}
if (storedKey) {
  storedKey = storedKey.trim();
}

const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const SUPABASE_URL = storedUrl || envUrl;
export const SUPABASE_ANON_KEY = storedKey || envKey;

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  (SUPABASE_URL.startsWith('https://') || SUPABASE_URL.startsWith('http://')) &&
  !SUPABASE_URL.includes('your-project-url') &&
  !SUPABASE_URL.includes('your-project-id')
);

let client: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
  }
}

export const supabase = client;

export function saveSupabaseConfig(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('lifefolder_supabase_url', url.trim());
    localStorage.setItem('lifefolder_supabase_key', key.trim());
    window.location.reload();
  }
}

export function clearSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('lifefolder_supabase_url');
    localStorage.removeItem('lifefolder_supabase_key');
    window.location.reload();
  }
}
