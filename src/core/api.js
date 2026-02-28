
import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Data Governance Error: Missing Supabase environment variables! Ensure .env is loaded without hardcoded secrets.');
}
export const supabase = createClient(supabaseUrl, supabaseKey);

