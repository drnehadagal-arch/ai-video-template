import Link from "next/link";
import { TEMPLATES } from "@/lib/templates";

export default function HomePage() {
  return (
    <>
      <h1>Turn your photo into a trending video</h1>
      <p className="muted">Pick a template, upload a photo, and get a 5-second video. Your first one is free.</p>
      {TEMPLATES.map((t) => (
        <Link key={t.slug} href={`/t/${t.slug}`} className="card" style={{ display: "block", textDecoration: "none" }}>
          <strong>{t.title}</strong>
          <p className="muted" style={{ margin: "4px 0 0" }}>{t.intro}</p>
        </Link>
      ))}
    </>
  );
}
