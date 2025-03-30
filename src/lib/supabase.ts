import { createClient } from "@supabase/supabase-js";

// These environment variables need to be defined in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Missing Supabase environment variables. Please check your .env.local file."
  );
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  supabaseUrl || "https://placeholder-url.supabase.co", // Fallback to prevent runtime errors
  supabaseKey || "placeholder-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
