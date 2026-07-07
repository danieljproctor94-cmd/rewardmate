import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hfgvggvbbtzroeidwhcu.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmZ3ZnZ3ZiYnR6cm9laWR3aGN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MTA0MDIsImV4cCI6MjA5ODk4NjQwMn0.jET7THDbxYsEzwe2KMjEAU_g8yf_ngAmEV5m9qy_z2o';

export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseKey &&
  !supabaseUrl.includes('placeholder')
);

if (!isSupabaseConfigured) {
  console.warn(
    'Reward Mate: Supabase environment variables are missing or placeholders. The application will run in local simulated sandbox mode using localStorage.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
