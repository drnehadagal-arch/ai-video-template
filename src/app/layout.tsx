import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Video Templates",
  description: "Turn a photo into a trending AI video in one click.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="header">
            <Link href="/" className="brand">AI Video Templates</Link>
            {user ? (
              <form action="/auth/signout" method="post">
                <span className="muted">{user.email} · </span>
                <button className="link-button" type="submit">Sign out</button>
              </form>
            ) : (
              <Link href="/login">Sign in</Link>
            )}
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
