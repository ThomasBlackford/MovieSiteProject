import Link from "next/link";
import { initials, starString } from "@/lib/format";

export function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center border border-ink bg-surface text-[10px]"
      style={{ width: size, height: size, fontSize: size > 40 ? 16 : 10 }}
    >
      {initials(name)}
    </span>
  );
}

export function Stars({ score }: { score: number }) {
  return (
    <span className="tracking-[2px]" aria-label={`${score / 2} out of 5 stars`}>
      {starString(score)}
    </span>
  );
}

type PosterMovie = { id: string; title: string; year: number };

// Placeholder until TMDB poster art is wired in.
export function Poster({ movie, className = "" }: { movie: PosterMovie; className?: string }) {
  return (
    <div className={`bg-poster flex aspect-[2/3] flex-col justify-end border-b border-line p-3 ${className}`}>
      <span className="text-sm leading-tight font-medium text-ink/70">{movie.title}</span>
      <span className="text-[11px] text-muted">{movie.year}</span>
    </div>
  );
}

export function MovieCard({ movie, avg }: { movie: PosterMovie; avg: number | null }) {
  return (
    <Link href={`/movies/${movie.id}`} className="panel group block transition hover:-translate-y-0.5 hover:border-ink">
      <Poster movie={movie} />
      <div className="p-2.5">
        <div className="truncate text-xs font-medium">{movie.title}</div>
        <div className="text-[11px] text-muted">{avg ? `★ ${avg.toFixed(1)}` : "Not rated yet"}</div>
      </div>
    </Link>
  );
}

export function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <h2 className="text-[15px] font-medium">{title}</h2>
      {href && (
        <Link href={href} className="link text-xs">
          View all →
        </Link>
      )}
    </div>
  );
}
