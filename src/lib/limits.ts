/** Free videos per signed-in user until credits arrive in weeks 3–4. */
export function freeVideosPerUser(): number {
  const n = Number.parseInt(process.env.FREE_VIDEOS_PER_USER ?? "1", 10);
  return Number.isFinite(n) && n >= 0 ? n : 1;
}

/** Failed videos don't count against the free allowance. */
export function hasFreeVideoLeft(usedNonFailed: number, allowance = freeVideosPerUser()): boolean {
  return usedNonFailed < allowance;
}
