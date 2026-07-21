"use client";
import { createClient } from "@supabase/supabase-js";

let browserClient = null;

// Safe to use in the browser — relies on the publishable/anon key,
// which only has the low-privilege access your Row Level Security policies allow.
export function getBrowserClient() {
  if (!browserClient) {
    browserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return browserClient;
}
