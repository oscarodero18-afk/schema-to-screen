import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://ztzrcbfdhqliwpvufown.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0enJjYmZkaHFsaXdwdnVmb3duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MjI5MTQsImV4cCI6MjA5NjQ5ODkxNH0.cTkKZ56UtmApZ-RaGhd9Ffr2GvcPoHGuWY_vooZQU_E';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.");
}

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
