import { describe, expect, it } from "vitest";
import { hasFreeVideoLeft } from "@/lib/limits";
import { safeNextPath } from "@/lib/redirect";
import { getTemplate, TEMPLATES } from "@/lib/templates";
import { isOwnUploadPath, validateImageFile } from "@/lib/uploads";
import { getModel, MODELS } from "@/lib/video/models";

const USER = "11111111-2222-3333-4444-555555555555";
const FILE = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

describe("templates", () => {
  it("every template points at real models and has a unique slug", () => {
    const slugs = new Set(TEMPLATES.map((t) => t.slug));
    expect(slugs.size).toBe(TEMPLATES.length);
    for (const t of TEMPLATES) {
      expect(getModel(t.models.free)).toBeDefined();
      expect(getModel(t.models.paid)).toBeDefined();
    }
    expect(getTemplate("nope")).toBeUndefined();
  });
});

describe("models", () => {
  it("builds fal inputs for a 5-second clip", () => {
    const args = { prompt: "p", imageUrl: "https://x/y.jpg", negativePrompt: "n" };
    expect(MODELS["wan-2.5-480p"].buildInput(args)).toMatchObject({
      prompt: "p",
      image_url: "https://x/y.jpg",
      resolution: "480p",
      duration: "5",
      negative_prompt: "n",
    });
    expect(MODELS["kling-2.5-turbo-pro"].buildInput(args)).toEqual({
      prompt: "p",
      image_url: "https://x/y.jpg",
      duration: "5",
      negative_prompt: "n",
    });
  });

  it("does not resolve prototype keys as models", () => {
    expect(getModel("toString")).toBeUndefined();
  });
});

describe("uploads", () => {
  it("accepts only a photo in the user's own folder", () => {
    expect(isOwnUploadPath(`${USER}/${FILE}.jpg`, USER)).toBe(true);
    expect(isOwnUploadPath(`${FILE}/${FILE}.jpg`, USER)).toBe(false);
    expect(isOwnUploadPath(`${USER}/../${FILE}.jpg`, USER)).toBe(false);
    expect(isOwnUploadPath(`${USER}/${FILE}.gif`, USER)).toBe(false);
  });

  it("rejects wrong types and big files", () => {
    expect(validateImageFile({ type: "image/png", size: 1000 })).toBeNull();
    expect(validateImageFile({ type: "image/gif", size: 1000 })).not.toBeNull();
    expect(validateImageFile({ type: "image/jpeg", size: 11 * 1024 * 1024 })).not.toBeNull();
  });
});

describe("free allowance", () => {
  it("allows videos until the allowance is used", () => {
    expect(hasFreeVideoLeft(0, 1)).toBe(true);
    expect(hasFreeVideoLeft(1, 1)).toBe(false);
  });
});

describe("safeNextPath", () => {
  it("keeps same-site paths and drops everything else", () => {
    expect(safeNextPath("/t/retro-80s-video")).toBe("/t/retro-80s-video");
    expect(safeNextPath("//evil.com")).toBe("/");
    expect(safeNextPath("/\\evil.com")).toBe("/");
    expect(safeNextPath("https://evil.com")).toBe("/");
    expect(safeNextPath(null)).toBe("/");
  });
});
