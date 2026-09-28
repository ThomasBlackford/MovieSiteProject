import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { average, runtime, timeAgo } from "@/lib/format";
import { Avatar, MovieCard, SectionHeader, Stars } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Home() {
  const me = await getCurrentUser();
  const [movies, following] = await Promise.all([
    db.movie.findMany({ include: { ratings: { select: { score: true } } } }),
    db.follow.findMany({ where: { followerId: me.id }, select: { followingId: true } }),
  ]);
  const followingIds = following.map((f) => f.followingId);

  const [ratings, posts] = await Promise.all([
    db.rating.findMany({
      where: { userId: { in: followingIds } },
      include: { user: true, movie: true, _count: { select: { likes: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.post.findMany({
      where: { authorId: { in: followingIds } },
      include: { author: true, _count: { select: { comments: true } } },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  const feed = [
    ...ratings.map((r) => ({ kind: "rating" as const, at: r.createdAt, r })),
    ...posts.map((p) => ({ kind: "post" as const, at: p.createdAt, p })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 8);

  const featured = movies.find((m) => m.featured) ?? movies[0];
  const featuredAvg = average(featured.ratings.map((r) => r.score));
  const trending = [...movies]
    .filter((m) => m.id !== featured.id)
    .sort((a, b) => b.ratings.length - a.ratings.length || (average(b.ratings.map((r) => r.score)) ?? 0) - (average(a.ratings.map((r) => r.score)) ?? 0));

  return (
    <div className="space-y-10">
      <section className="panel grid md:grid-cols-[1.4fr_1fr]">
        <div className="p-7">
          <div className="eyebrow mb-2.5">Featured this week</div>
          <h1 className="mb-2 text-3xl leading-tight font-medium">{featured.title}</h1>
          <div className="mb-1.5 text-[13px] text-muted">
            {featured.year} · {featured.genres} · {runtime(featured.runtime)}
          </div>
          <p className="mb-4 max-w-md text-sm text-muted">{featured.overview}</p>
          {featuredAvg && (
            <div className="mb-5 flex items-center gap-2 text-[13px]">
              <Stars score={Math.round(featuredAvg * 2)} />
              <span className="text-muted">
                {featuredAvg.toFixed(1)} avg · {featured.ratings.length} ratings
              </span>
            </div>
          )}
          <Link href={`/movies/${featured.id}`} className="btn">
            Rate it
          </Link>
        </div>
        <div className="bg-brand-gradient hidden items-end border-l border-line p-4 md:flex">
          <span className="eyebrow">Backdrop · TMDB</span>
        </div>
      </section>

      <section>
        <SectionHeader title="Trending now" />
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
          {trending.map((m) => (
            <MovieCard key={m.id} movie={m} avg={average(m.ratings.map((r) => r.score))} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="From people you follow" href="/journal" />
        <ul className="panel divide-y divide-line">
          {feed.map((item) =>
            item.kind === "rating" ? (
              <li key={item.r.id} className="flex items-center gap-3 px-4 py-3 text-[13px]">
                <Avatar name={item.r.user.displayName} />
                <div className="min-w-0 flex-1">
                  <Link href={`/u/${item.r.user.username}`} className="font-medium hover:underline">
                    {item.r.user.username}
                  </Link>{" "}
                  <span className="text-muted">rated</span>{" "}
                  <Link href={`/movies/${item.r.movie.id}`} className="hover:underline">
                    {item.r.movie.title}
                  </Link>{" "}
                  <Stars score={item.r.score} />
                  {item.r.review && <p className="mt-0.5 truncate text-muted">“{item.r.review}”</p>}
                </div>
                <span className="text-xs text-muted">♡ {item.r._count.likes}</span>
              </li>
            ) : (
              <li key={item.p.id} className="flex items-center gap-3 px-4 py-3 text-[13px]">
                <Avatar name={item.p.author.displayName} />
                <div className="min-w-0 flex-1">
                  <Link href={`/u/${item.p.author.username}`} className="font-medium hover:underline">
                    {item.p.author.username}
                  </Link>{" "}
                  <span className="text-muted">published</span>{" "}
                  <Link href={`/journal/${item.p.id}`} className="hover:underline">
                    “{item.p.title}”
                  </Link>
                </div>
                <span className="text-xs text-muted">{timeAgo(item.at)}</span>
              </li>
            ),
          )}
          {feed.length === 0 && <li className="px-4 py-3 text-sm text-muted">Follow people to see their activity here.</li>}
        </ul>
      </section>
    </div>
  );
}
