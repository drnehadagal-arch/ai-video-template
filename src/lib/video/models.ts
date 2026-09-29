// Video models we can generate with. Templates refer to models by key, so
// switching a template to a cheaper model (or another provider) is a one-line
// change here or in templates.ts, with no route changes.

export type ProviderName = "fal";

export type ModelKey = "wan-2.5-480p" | "kling-2.5-turbo-pro";

export interface ModelInputArgs {
  prompt: string;
  imageUrl: string;
  negativePrompt?: string;
}

export interface VideoModel {
  key: ModelKey;
  provider: ProviderName;
  /** The provider's model id, e.g. a fal.ai endpoint id. */
  endpoint: string;
  /** Approximate cost of one 5-second video in USD, for margin tracking. */
  costUsd: number;
  buildInput(args: ModelInputArgs): Record<string, unknown>;
}

export const MODELS: Record<ModelKey, VideoModel> = {
  "wan-2.5-480p": {
    key: "wan-2.5-480p",
    provider: "fal",
    endpoint: "fal-ai/wan-25-preview/image-to-video",
    costUsd: 0.25,
    buildInput: ({ prompt, imageUrl, negativePrompt }) => ({
      prompt,
      image_url: imageUrl,
      resolution: "480p",
      duration: "5",
      enable_safety_checker: true,
      ...(negativePrompt ? { negative_prompt: negativePrompt } : {}),
    }),
  },
  "kling-2.5-turbo-pro": {
    key: "kling-2.5-turbo-pro",
    provider: "fal",
    endpoint: "fal-ai/kling-video/v2.5-turbo/pro/image-to-video",
    costUsd: 0.35,
    buildInput: ({ prompt, imageUrl, negativePrompt }) => ({
      prompt,
      image_url: imageUrl,
      duration: "5",
      ...(negativePrompt ? { negative_prompt: negativePrompt } : {}),
    }),
  },
};

export function getModel(key: string): VideoModel | undefined {
  return Object.hasOwn(MODELS, key) ? MODELS[key as ModelKey] : undefined;
}
