
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Supabase Console -> Project Settings -> API
const supabaseUrl = 'https://hykzfvrmnnykvinhtucc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5a3pmdnJtbm55a3Zpbmh0dWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNTA5OTcsImV4cCI6MjA4MTYyNjk5N30.ucjlryz2NfuxQ-XArvqwPHkY13Qgf-nQ-j3vKlvTRgM';

export const supabase = createClient(supabaseUrl, supabaseKey);
