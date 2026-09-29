import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { supabasePublishableKey, supabaseUrl } from "./env";

/** Acts as the signed-in user; row-level security applies. */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl(), supabasePublishableKey(), {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component, where cookies are read-only; proxy.ts refreshes sessions.
        }
      },
    },
  });
}

/** Bypasses row-level security. Only use after checking the user yourself. */
export function createSupabaseAdminClient() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error("SUPABASE_SECRET_KEY is not set");
  if (!key.startsWith("sb_secret_")) {
    throw new Error(
      "SUPABASE_SECRET_KEY must be the secret key (starts with sb_secret_) from Supabase Project Settings -> API Keys",
    );
  }
  return createClient(supabaseUrl(), key, { auth: { persistSession: false, autoRefreshToken: false } });
}
