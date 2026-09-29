import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getTemplate } from "@/lib/templates";
import { CreateVideoForm } from "./CreateVideoForm";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const template = getTemplate((await params).slug);
  if (!template) return {};
  return { title: template.seoTitle, description: template.seoDescription };
}

export default async function TemplatePage({ params }: Props) {
  const { slug } = await params;
  const template = getTemplate(slug);
  if (!template) notFound();
  const user = await getCurrentUser();

  return (
    <>
      <h1>{template.title}</h1>
      <p>{template.intro}</p>
      <ol>
        {template.steps.map((step) => <li key={step}>{step}</li>)}
      </ol>
      <div className="card">
        {user ? (
          <CreateVideoForm templateSlug={template.slug} userId={user.id} />
        ) : (
          <>
            <p>Sign in to make your free video.</p>
            <Link className="button" href={`/login?next=/t/${template.slug}`}>Sign in with Google</Link>
          </>
        )}
      </div>
    </>
  );
}
