import type { ModelKey } from "./video/models";

// Each trend is a record, so adding a trend page needs no new code.
export interface Template {
  slug: string;
  title: string;
  /** Search-page copy. */
  seoTitle: string;
  seoDescription: string;
  intro: string;
  steps: string[];
  photosRequired: 1;
  /** Hidden prompt sent to the model; users never write prompts. */
  prompt: string;
  negativePrompt?: string;
  /** Model per plan tier. Weeks 1–2 only use `free`. */
  models: { free: ModelKey; paid: ModelKey };
}

export const TEMPLATES: Template[] = [
  {
    slug: "retro-80s-video",
    title: "Retro 80s Video",
    seoTitle: "Retro 80s AI Video from Your Photo – Free to Try",
    seoDescription:
      "Upload one photo and get a 5-second retro 80s video of yourself: neon lights, film grain and a slow camera push. No editing or prompts.",
    intro: "Turn one photo into a 5-second 80s music-video moment, with neon, grain and a slow camera push.",
    steps: ["Upload one clear photo of a face", "We add the 80s look and motion", "Download and share your video"],
    photosRequired: 1,
    prompt:
      "The person from the photo in a 1980s music video scene, neon pink and cyan lights, VHS film grain, " +
      "soft haze, subtle head turn and smile, slow cinematic camera push-in, faithful to their face",
    negativePrompt: "blur, distortion, extra limbs, deformed face, text, watermark, low quality",
    models: { free: "wan-2.5-480p", paid: "kling-2.5-turbo-pro" },
  },
];

export function getTemplate(slug: string): Template | undefined {
  return TEMPLATES.find((t) => t.slug === slug);
}
