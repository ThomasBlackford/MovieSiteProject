import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { average, runtime, timeAgo } from "@/lib/format";
import { toggleLike, toggleWatchlist } from "@/app/actions";
import { Avatar, Poster, Stars } from "@/components/ui";
import { StarInput } from "@/components/star-input";
import { Comments, buildThread } from "@/components/comments";

export const dynamic = "force-dynamic";

export default async function MoviePage({ params }: PageProps<"/movies/[id]">) {
  const { id } = await params;
  const me = await getCurrentUser();
  const movie = await db.movie.findUnique({
    where: { id },
    include: {
      ratings: {
        include: { user: true, likes: { select: { userId: true } } },
        orderBy: { createdAt: "desc" },
      },
      comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
      listItems: { where: { list: { ownerId: me.id, isWatchlist: true } } },
    },
  });
  if (!movie) notFound();

  const avg = average(movie.ratings.map((r) => r.score));
  const mine = movie.ratings.find((r) => r.userId === me.id);
  const reviews = movie.ratings.filter((r) => r.review);
  const onWatchlist = movie.listItems.length > 0;
  const path = `/movies/${movie.id}`;

  // Histogram of half-star buckets, 0.5 → 5.
  const buckets = Array.from({ length: 10 }, (_, i) => movie.ratings.filter((r) => r.score === i + 1).length);
  const maxBucket = Math.max(1, ...buckets);

  return (
    <div className="space-y-10">
      <section className="grid gap-6 md:grid-cols-[220px_1fr]">
        <div className="panel self-start">
          <Poster movie={movie} className="border-b-0" />
        </div>
        <div>
          <div className="eyebrow mb-2">{movie.genres}</div>
          <h1 className="text-3xl leading-tight font-medium">{movie.title}</h1>
          <div className="mt-1.5 text-[13px] text-muted">
            {movie.year} · {runtime(movie.runtime)}
          </div>
          <p className="mt-4 max-w-xl text-sm leading-relaxed">{movie.overview}</p>

          <div className="mt-5 flex flex-wrap items-end gap-6">
            <div>
              <div className="text-2xl font-medium">{avg ? avg.toFixed(1) : "—"}</div>
              <div className="text-xs text-muted">{movie.ratings.length} ratings</div>
            </div>
            <div className="flex h-10 items-end gap-0.5" aria-label="Rating distribution">
              {buckets.map((n, i) => (
                <div key={i} className="w-3 bg-ink/80" style={{ height: `${Math.max(2, (n / maxBucket) * 40)}px` }} title={`${(i + 1) / 2}★: ${n}`} />
              ))}
            </div>
            <form action={toggleWatchlist.bind(null, movie.id)}>
              <button className={onWatchlist ? "btn" : "btn-outline"}>{onWatchlist ? "✓ On watchlist" : "+ Watchlist"}</button>
            </form>
          </div>

          <div className="mt-6 max-w-md">
            <StarInput key={mine?.updatedAt.toISOString() ?? "new"} movieId={movie.id} initialScore={mine?.score} initialReview={mine?.review} />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-[15px] font-medium">
          Reviews <span className="text-muted">({reviews.length})</span>
        </h2>
        <ul className="panel divide-y divide-line">
          {reviews.map((r) => {
            const liked = r.likes.some((l) => l.userId === me.id);
            return (
              <li key={r.id} className="flex gap-3 px-4 py-3.5">
                <Avatar name={r.user.displayName} />
                <div className="min-w-0 flex-1 text-[13px]">
                  <div>
                    <Link href={`/u/${r.user.username}`} className="font-medium hover:underline">
                      {r.user.username}
                    </Link>{" "}
                    <Stars score={r.score} /> <span className="text-muted">· {timeAgo(r.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm">{r.review}</p>
                </div>
                <form action={toggleLike.bind(null, { ratingId: r.id }, path)}>
                  <button className={`text-xs transition-colors ${liked ? "text-ink" : "text-muted hover:text-ink"}`} aria-pressed={liked}>
                    {liked ? "♥" : "♡"} {r.likes.length}
                  </button>
                </form>
              </li>
            );
          })}
          {reviews.length === 0 && <li className="px-4 py-3 text-sm text-muted">No written reviews yet.</li>}
        </ul>
      </section>

      <Comments thread={buildThread(movie.comments)} target={{ movieId: movie.id }} count={movie.comments.length} />
    </div>
  );
}
