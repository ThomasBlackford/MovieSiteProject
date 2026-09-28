import Link from "next/link";
import { addComment } from "@/app/actions";
import { Avatar } from "./ui";
import { timeAgo } from "@/lib/format";

export type CommentNode = {
  id: string;
  body: string;
  createdAt: Date;
  author: { username: string; displayName: string };
  replies: CommentNode[];
};

type Target = { movieId?: string; postId?: string };

// Build a tree from a flat list so replies can nest to any depth.
export function buildThread<T extends Omit<CommentNode, "replies"> & { parentId: string | null }>(flat: T[]): CommentNode[] {
  const byId = new Map<string, CommentNode>(flat.map((c) => [c.id, { ...c, replies: [] }]));
  const roots: CommentNode[] = [];
  for (const c of flat) {
    const node = byId.get(c.id)!;
    const parent = c.parentId ? byId.get(c.parentId) : undefined;
    (parent ? parent.replies : roots).push(node);
  }
  return roots;
}

function CommentForm({ target, parentId, placeholder }: { target: Target; parentId?: string; placeholder: string }) {
  return (
    <form action={addComment} className="flex gap-2">
      {target.movieId && <input type="hidden" name="movieId" value={target.movieId} />}
      {target.postId && <input type="hidden" name="postId" value={target.postId} />}
      {parentId && <input type="hidden" name="parentId" value={parentId} />}
      <input name="body" required className="field" placeholder={placeholder} />
      <button className="btn-outline shrink-0">Post</button>
    </form>
  );
}

function Comment({ c, target, depth }: { c: CommentNode; target: Target; depth: number }) {
  return (
    <li className={depth ? "border-l border-line pl-4" : ""}>
      <div className="flex gap-3 py-3">
        <Avatar name={c.author.displayName} />
        <div className="min-w-0 flex-1">
          <div className="text-[13px]">
            <Link href={`/u/${c.author.username}`} className="font-medium hover:underline">
              {c.author.username}
            </Link>{" "}
            <span className="text-muted">· {timeAgo(c.createdAt)}</span>
          </div>
          <p className="mt-0.5 text-sm">{c.body}</p>
          <details className="mt-1.5 group">
            <summary className="link cursor-pointer list-none text-xs inline">Reply</summary>
            <div className="mt-2">
              <CommentForm target={target} parentId={c.id} placeholder={`Reply to ${c.author.username}`} />
            </div>
          </details>
        </div>
      </div>
      {c.replies.length > 0 && (
        <ul className="ml-3.5">
          {c.replies.map((r) => (
            <Comment key={r.id} c={r} target={target} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function Comments({ thread, target, count }: { thread: CommentNode[]; target: Target; count: number }) {
  return (
    <section>
      <h2 className="mb-3 text-[15px] font-medium">
        Comments <span className="text-muted">({count})</span>
      </h2>
      <div className="panel p-4">
        <CommentForm target={target} placeholder="Add a comment" />
        {thread.length > 0 ? (
          <ul className="mt-2 divide-y divide-line">
            {thread.map((c) => (
              <Comment key={c.id} c={c} target={target} depth={0} />
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">Start the conversation.</p>
        )}
      </div>
    </section>
  );
}
