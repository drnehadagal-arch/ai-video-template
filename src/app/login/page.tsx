import { safeNextPath } from "@/lib/redirect";
import { GoogleSignInButton } from "./GoogleSignInButton";

type Props = { searchParams: Promise<{ next?: string; error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next, error } = await searchParams;
  return (
    <div className="card">
      <h1>Sign in</h1>
      <p className="muted">Sign in with Google to make your free video.</p>
      {error && <p className="error">Sign-in didn&apos;t work. Please try again.</p>}
      <GoogleSignInButton next={safeNextPath(next)} />
    </div>
  );
}
