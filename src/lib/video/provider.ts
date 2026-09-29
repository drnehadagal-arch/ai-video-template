import "server-only";
import { createFalClient, type FalClient } from "@fal-ai/client";
import type { ModelInputArgs, VideoModel } from "./models";

export type JobCheck =
  | { state: "pending" }
  | { state: "done"; videoUrl: string }
  | { state: "failed"; error: string };

let falClient: FalClient | undefined;

function fal(): FalClient {
  if (!falClient) {
    const key = process.env.FAL_KEY;
    if (!key) throw new Error("FAL_KEY is not set");
    falClient = createFalClient({ credentials: key });
  }
  return falClient;
}

/** Queues a video job and returns the provider's request id. */
export async function submitVideoJob(model: VideoModel, args: ModelInputArgs): Promise<string> {
  switch (model.provider) {
    case "fal": {
      const queued = await fal().queue.submit(model.endpoint, { input: model.buildInput(args) });
      return queued.request_id;
    }
  }
}

/** Checks a queued job once. Safe to call repeatedly while polling. */
export async function checkVideoJob(model: VideoModel, requestId: string): Promise<JobCheck> {
  switch (model.provider) {
    case "fal": {
      const status = await fal().queue.status(model.endpoint, { requestId });
      if (status.status !== "COMPLETED") return { state: "pending" };
      try {
        const result = await fal().queue.result(model.endpoint, { requestId });
        const url = (result.data as { video?: { url?: string } })?.video?.url;
        return url ? { state: "done", videoUrl: url } : { state: "failed", error: "No video in result" };
      } catch (err) {
        return { state: "failed", error: err instanceof Error ? err.message : "Generation failed" };
      }
    }
  }
}
