import { createClient } from '@supabase/supabase-js';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// If the user hasn't configured the .env file yet, provide a fallback valid URL to prevent a crash
if (!supabaseUrl.startsWith('http')) {
  console.error("Invalid or missing Supabase URL in .env file. Using a placeholder.");
  supabaseUrl = 'https://placeholder.supabase.co';
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

