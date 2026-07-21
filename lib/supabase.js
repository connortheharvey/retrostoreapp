import { createClient } from "@supabase/supabase-js";

// Public client: safe to use for reads/inserts (protected by Row Level Security policies)
export function getPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Admin client: bypasses Row Level Security. Only ever used inside API routes
// that first check the admin password — never expose the service role key to the browser.
export function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
