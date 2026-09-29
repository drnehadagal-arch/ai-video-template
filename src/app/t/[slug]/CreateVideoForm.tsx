"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { ALLOWED_IMAGE_TYPES, UPLOAD_BUCKET, validateImageFile } from "@/lib/uploads";

export function CreateVideoForm({ templateSlug, userId }: { templateSlug: string; userId: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function onPick(picked: File | undefined) {
    setError(null);
    if (!picked) return setFile(null);
    const problem = validateImageFile(picked);
    if (problem) return setError(problem);
    setFile(picked);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !consent) return;
    setBusy(true);
    setError(null);
    try {
      const path = `${userId}/${crypto.randomUUID()}.${ALLOWED_IMAGE_TYPES[file.type]}`;
      const supabase = createSupabaseBrowserClient();
      const { error: uploadError } = await supabase.storage
        .from(UPLOAD_BUCKET)
        .upload(path, file, { contentType: file.type });
      if (uploadError) throw new Error("Upload failed. Please try again.");

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateSlug, inputPath: path, consent }),
      });
      const body = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
      if (!res.ok || !body.id) throw new Error(body.error ?? "Something went wrong on our side. Please try again.");
      router.push(`/videos/${body.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <label>
        Your photo (JPG, PNG or WebP, up to 10 MB)
        <input
          type="file"
          accept={Object.keys(ALLOWED_IMAGE_TYPES).join(",")}
          onChange={(e) => onPick(e.target.files?.[0])}
          disabled={busy}
        />
      </label>
      {file && previewUrl && <img className="preview" src={previewUrl} alt="Your photo" />}
      <label>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} disabled={busy} />{" "}
        This is my photo, or I have permission from everyone in it. No one in it is under 18.
      </label>
      {error && <p className="error">{error}</p>}
      <button className="button" type="submit" disabled={!file || !consent || busy}>
        {busy ? "Starting…" : "Make my free video"}
      </button>
    </form>
  );
}
