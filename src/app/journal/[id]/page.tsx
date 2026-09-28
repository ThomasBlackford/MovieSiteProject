import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { toggleLike } from "@/app/actions";
import { Avatar } from "@/components/ui";
import { Comments, buildThread } from "@/components/comments";
import { timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: PageProps<"/journal/[id]">) {
  const { id } = await params;
  const me = await getCurrentUser();
  const post = await db.post.findUnique({
    where: { id },
    include: {
      author: true,
      likes: { select: { userId: true } },
      comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!post) notFound();

  const liked = post.likes.some((l) => l.userId === me.id);

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <article className="panel p-8">
        <Link href="/journal" className="link text-xs">
          ← Journal
        </Link>
        <h1 className="mt-4 text-3xl leading-tight font-medium">{post.title}</h1>
        <div className="mt-3 flex items-center gap-2 text-[13px] text-muted">
          <Avatar name={post.author.displayName} size={24} />
          <Link href={`/u/${post.author.username}`} className="text-ink hover:underline">
            {post.author.displayName}
          </Link>
          · {timeAgo(post.createdAt)}
        </div>
        <div className="mt-6 space-y-4 text-[15px] leading-relaxed">
          {post.body.split(/\n{2,}/).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        <form action={toggleLike.bind(null, { postId: post.id }, `/journal/${post.id}`)} className="mt-8 border-t border-line pt-4">
          <button className={liked ? "btn" : "btn-outline"} aria-pressed={liked}>
            {liked ? "♥" : "♡"} {post.likes.length}
          </button>
        </form>
      </article>

      <Comments thread={buildThread(post.comments)} target={{ postId: post.id }} count={post.comments.length} />
    </div>
  );
}
