import Link from "next/link";
import { db } from "@/lib/db";
import { Avatar } from "@/components/ui";
import { timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const posts = await db.post.findMany({
    include: { author: true, _count: { select: { comments: true, likes: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <div className="eyebrow mb-1">Journal</div>
          <h1 className="text-3xl font-medium">Writing from the community</h1>
        </div>
        <Link href="/journal/new" className="btn">
          Write a post
        </Link>
      </div>
      <ul className="panel divide-y divide-line">
        {posts.map((p) => (
          <li key={p.id}>
            <Link href={`/journal/${p.id}`} className="block px-5 py-4 transition-colors hover:bg-[var(--g3)]">
              <h2 className="text-lg font-medium">{p.title}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{p.body}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                <Avatar name={p.author.displayName} size={20} />
                <span className="text-ink">{p.author.username}</span>· {timeAgo(p.createdAt)} · ♡ {p._count.likes} · {p._count.comments} comments
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
