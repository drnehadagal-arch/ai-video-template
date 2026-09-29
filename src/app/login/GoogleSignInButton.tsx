"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function GoogleSignInButton({ next }: { next: string }) {
  const [busy, setBusy] = useState(false);

  async function signIn() {
    setBusy(true);
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await createSupabaseBrowserClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) setBusy(false);
  }

  return (
    <button className="button" onClick={signIn} disabled={busy}>
      {busy ? "Opening Google…" : "Continue with Google"}
    </button>
  );
}
