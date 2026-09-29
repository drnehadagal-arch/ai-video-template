"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { GenerationView } from "@/lib/generations";

const POLL_MS = 4000;

export function VideoStatus({ initial }: { initial: GenerationView }) {
  const [generation, setGeneration] = useState(initial);
  const running = generation.status === "queued" || generation.status === "processing";

  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/generations/${generation.id}`, { cache: "no-store" });
        if (res.ok) setGeneration(await res.json());
        else setGeneration((g) => ({ ...g })); // schedule another try
      } catch {
        setGeneration((g) => ({ ...g }));
      }
    }, POLL_MS);
    return () => clearTimeout(timer);
  }, [generation, running]);

  if (generation.status === "succeeded" && generation.videoUrl) {
    return (
      <div className="card">
        <video src={generation.videoUrl} controls autoPlay loop playsInline />
        <p>
          <a className="button" href={generation.videoUrl} target="_blank" rel="noopener noreferrer">
            Open video to download
          </a>
        </p>
      </div>
    );
  }

  if (generation.status === "failed") {
    return (
      <div className="card">
        <p className="error">Sorry, this video didn&apos;t work. It doesn&apos;t count against your free video.</p>
        <Link className="button" href={`/t/${generation.templateSlug}`}>Try again</Link>
      </div>
    );
  }

  return (
    <div className="card">
      <p>Making your video… This can take a few minutes. Keep this page open.</p>
    </div>
  );
}
