// Ratings are stored as 1..10 so half-stars stay integers.
export function toStars(score: number) {
  return score / 2;
}

export function starString(score: number) {
  const full = Math.floor(score / 2);
  return "★".repeat(full) + (score % 2 ? "½" : "");
}

export function average(scores: number[]) {
  if (!scores.length) return null;
  return scores.reduce((a, b) => a + b, 0) / scores.length / 2;
}

export function runtime(minutes: number) {
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function timeAgo(date: Date) {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return "just now";
  const units: [number, string][] = [[86400, "d"], [3600, "h"], [60, "m"]];
  for (const [secs, label] of units) if (s >= secs) return `${Math.floor(s / secs)}${label} ago`;
  return "just now";
}
