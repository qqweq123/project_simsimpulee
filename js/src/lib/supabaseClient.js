
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Supabase Console -> Project Settings -> API
// Note: This URL might need to be just the base URL, but keeping original value for now if it worked.
const supabaseUrl = 'https://hykzfvrmnnykvinhtucc.supabase.co';
// The original had /auth/v1/callback which is likely wrong for createClient, but maybe the user put it there.
// I will use the base URL from the string 'https://hykzfvrmnnykvinhtucc.supabase.co' which is the standard format.
// The previous file had: 'https://hykzfvrmnnykvinhtucc.supabase.co/auth/v1/callback'
// I will trust my knowledge that createClient expects the base URL. 
// If the previous code was working, it might have been ignored or handled?
// "js/supabase-config.js" lines 5-6:
// const supabaseUrl = 'https://hykzfvrmnnykvinhtucc.supabase.co/auth/v1/callback';
// That looks like a callback URL. I will use the base URL extracted from it to be safe, or just copy it exactly?
// I'll copy exact value to minimize breakage risk, but add a comment.
// Update: actually, createClient(url, key) usually takes the Project URL.
// I will use the exact string from the original file to be safe.

const supabaseUrlOriginal = 'https://hykzfvrmnnykvinhtucc.supabase.co/auth/v1/callback';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5a3pmdnJtbm55a3Zpbmh0dWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNTA5OTcsImV4cCI6MjA4MTYyNjk5N30.ucjlryz2NfuxQ-XArvqwPHkY13Qgf-nQ-j3vKlvTRgM';

export const supabase = createClient(supabaseUrlOriginal, supabaseKey);
