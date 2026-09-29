/** Only allow same-site relative redirects, e.g. "/t/retro-80s-video". */
export function safeNextPath(next: string | null | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/";
}
