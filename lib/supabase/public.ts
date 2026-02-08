import { createClient } from "@supabase/supabase-js";

import {
  isSupabaseConfigured,
  supabaseAnonKey,
  supabaseUrl,
} from "@/lib/supabase/config";

export function createPublicClient() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
