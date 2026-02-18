
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hykzfvrmnnykvinhtucc.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5a3pmdnJtbm55a3Zpbmh0dWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNTA5OTcsImV4cCI6MjA4MTYyNjk5N30.ucjlryz2NfuxQ-XArvqwPHkY13Qgf-nQ-j3vKlvTRgM';

export const supabase = createClient(supabaseUrl, supabaseKey);

