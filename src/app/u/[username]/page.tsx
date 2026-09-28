import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { toggleFollow } from "@/app/actions";
import { Avatar, Poster, SectionHeader, Stars } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: PageProps<"/u/[username]">) {
  const { username } = await params;
  const me = await getCurrentUser();
  const user = await db.user.findUnique({
    where: { username },
    include: {
      ratings: { include: { movie: true }, orderBy: { updatedAt: "desc" } },
      posts: { orderBy: { createdAt: "desc" } },
      lists: {
        include: { items: { include: { movie: true }, orderBy: { addedAt: "desc" } } },
        orderBy: [{ isWatchlist: "desc" }, { name: "asc" }],
      },
      followers: { select: { followerId: true } },
      _count: { select: { following: true } },
    },
  });
  if (!user) notFound();

  const isMe = user.id === me.id;
  const iFollow = user.followers.some((f) => f.followerId === me.id);
  const stats = [
    ["Ratings", user.ratings.length],
    ["Posts", user.posts.length],
    ["Followers", user.followers.length],
    ["Following", user._count.following],
  ] as const;

  return (
    <div className="space-y-10">
      <section className="panel flex flex-wrap items-center gap-5 p-6">
        <Avatar name={user.displayName} size={64} />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-medium">{user.displayName}</h1>
          <div className="text-[13px] text-muted">@{user.username}</div>
          {user.bio && <p className="mt-2 text-sm">{user.bio}</p>}
        </div>
        <div className="flex gap-6">
          {stats.map(([label, n]) => (
            <div key={label} className="text-center">
              <div className="text-lg font-medium">{n}</div>
              <div className="eyebrow">{label}</div>
            </div>
          ))}
        </div>
        {!isMe && (
          <form action={toggleFollow.bind(null, user.id, `/u/${user.username}`)}>
            <button className={iFollow ? "btn-outline" : "btn"}>{iFollow ? "Following" : "Follow"}</button>
          </form>
        )}
      </section>

      {user.lists.map((list) => (
        <section key={list.id}>
          <SectionHeader title={`${list.name} (${list.items.length})`} />
          {list.items.length ? (
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 lg:grid-cols-7">
              {list.items.map(({ movie }) => (
                <Link key={movie.id} href={`/movies/${movie.id}`} className="panel block transition hover:-translate-y-0.5 hover:border-ink">
                  <Poster movie={movie} className="border-b-0" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="panel px-4 py-3 text-sm text-muted">Nothing here yet.</p>
          )}
        </section>
      ))}

      <section>
        <SectionHeader title="Recent ratings" />
        <ul className="panel divide-y divide-line">
          {user.ratings.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-3 text-[13px]">
              <Link href={`/movies/${r.movie.id}`} className="font-medium hover:underline">
                {r.movie.title} <span className="font-normal text-muted">({r.movie.year})</span>
              </Link>
              <Stars score={r.score} />
            </li>
          ))}
          {user.ratings.length === 0 && <li className="px-4 py-3 text-sm text-muted">No ratings yet.</li>}
        </ul>
      </section>

      {user.posts.length > 0 && (
        <section>
          <SectionHeader title="Journal" />
          <ul className="panel divide-y divide-line">
            {user.posts.map((p) => (
              <li key={p.id}>
                <Link href={`/journal/${p.id}`} className="block px-4 py-3 text-sm transition-colors hover:bg-[var(--g3)]">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
