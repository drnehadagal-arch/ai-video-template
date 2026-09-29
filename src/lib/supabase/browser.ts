import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  // Inlined at build time; must be referenced directly for the browser bundle.
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
}
