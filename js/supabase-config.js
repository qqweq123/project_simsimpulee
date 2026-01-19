
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// TODO: 본인의 Supabase 프로젝트 설정 값으로 덮어쓰세요.
// Supabase Console -> Project Settings -> API
const supabaseUrl = 'https://hykzfvrmnnykvinhtucc.supabase.co/auth/v1/callback';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5a3pmdnJtbm55a3Zpbmh0dWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNTA5OTcsImV4cCI6MjA4MTYyNjk5N30.ucjlryz2NfuxQ-XArvqwPHkY13Qgf-nQ-j3vKlvTRgM';

export const supabase = createClient(supabaseUrl, supabaseKey);
/*아 왜 왜 안되는거야*/