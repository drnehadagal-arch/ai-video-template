import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { hasFreeVideoLeft } from "@/lib/limits";
import { getTemplate } from "@/lib/templates";
import { isOwnUploadPath, UPLOAD_BUCKET } from "@/lib/uploads";
import { MODELS } from "@/lib/video/models";
import { submitVideoJob } from "@/lib/video/provider";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

// The model provider fetches the photo from this link, so it only needs to outlive the queue wait.
const SIGNED_URL_SECONDS = 60 * 60;

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as
    | { templateSlug?: unknown; inputPath?: unknown; consent?: unknown }
    | null;
  const template = typeof body?.templateSlug === "string" ? getTemplate(body.templateSlug) : undefined;
  const inputPath = typeof body?.inputPath === "string" ? body.inputPath : "";
  if (!template) return NextResponse.json({ error: "Unknown template." }, { status: 400 });
  if (!isOwnUploadPath(inputPath, user.id)) return NextResponse.json({ error: "Invalid photo." }, { status: 400 });
  if (body?.consent !== true) {
    return NextResponse.json({ error: "Please confirm you have permission to use this photo." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { count, error: countError } = await admin
    .from("generations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .neq("status", "failed");
  if (countError) {
    console.error("count generations failed", countError);
    return NextResponse.json({ error: "Please try again." }, { status: 500 });
  }
  if (!hasFreeVideoLeft(count ?? 0)) {
    return NextResponse.json({ error: "You've used your free video. Paid packs are coming soon." }, { status: 403 });
  }

  const { data: signed, error: signError } = await admin.storage
    .from(UPLOAD_BUCKET)
    .createSignedUrl(inputPath, SIGNED_URL_SECONDS);
  if (signError || !signed) {
    console.error("createSignedUrl failed", inputPath, signError);
    return NextResponse.json({ error: "We couldn't find your photo." }, { status: 400 });
  }

  const model = MODELS[template.models.free];
  const { data: row, error: insertError } = await admin
    .from("generations")
    .insert({ user_id: user.id, template_slug: template.slug, model_key: model.key, tier: "free", input_path: inputPath })
    .select("id")
    .single();
  if (insertError || !row) {
    console.error("insert generation failed", insertError);
    return NextResponse.json({ error: "Please try again." }, { status: 500 });
  }

  try {
    const requestId = await submitVideoJob(model, {
      prompt: template.prompt,
      negativePrompt: template.negativePrompt,
      imageUrl: signed.signedUrl,
    });
    await admin
      .from("generations")
      .update({ provider_request_id: requestId, status: "processing", updated_at: new Date().toISOString() })
      .eq("id", row.id);
  } catch (err) {
    console.error("submitVideoJob failed", err);
    await admin
      .from("generations")
      .update({ status: "failed", error: "Could not start the video.", updated_at: new Date().toISOString() })
      .eq("id", row.id);
    return NextResponse.json({ error: "We couldn't start your video. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ id: row.id });
}
