import "server-only";
import { getModel } from "./video/models";
import { checkVideoJob } from "./video/provider";
import { createSupabaseAdminClient, createSupabaseServerClient } from "./supabase/server";

export type GenerationView = {
  id: string;
  templateSlug: string;
  status: "queued" | "processing" | "succeeded" | "failed";
  videoUrl: string | null;
  error: string | null;
};

/**
 * Loads one of the signed-in user's generations (row-level security hides
 * everyone else's) and, if it's still running, checks the provider once.
 */
export async function loadAndRefreshGeneration(id: string): Promise<GenerationView | null> {
  const supabase = await createSupabaseServerClient();
  const { data: row } = await supabase
    .from("generations")
    .select("id, template_slug, model_key, status, provider_request_id, video_url, error")
    .eq("id", id)
    .maybeSingle();
  if (!row) return null;

  const view: GenerationView = {
    id: row.id,
    templateSlug: row.template_slug,
    status: row.status,
    videoUrl: row.video_url,
    error: row.error,
  };

  const model = getModel(row.model_key);
  if (row.status !== "processing" || !row.provider_request_id || !model) return view;

  const check = await checkVideoJob(model, row.provider_request_id);
  if (check.state === "pending") return view;

  const update =
    check.state === "done"
      ? { status: "succeeded" as const, video_url: check.videoUrl, error: null }
      : { status: "failed" as const, video_url: null, error: check.error };
  await createSupabaseAdminClient()
    .from("generations")
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq("id", row.id)
    .eq("status", "processing");
  return { ...view, status: update.status, videoUrl: update.video_url, error: update.error };
}
