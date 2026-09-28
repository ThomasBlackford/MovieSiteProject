"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

function text(formData: FormData, key: string, max = 5000) {
  const value = String(formData.get(key) ?? "").trim();
  return value.slice(0, max);
}

export async function rateMovie(movieId: string, score: number, review?: string) {
  const user = await getCurrentUser();
  if (!Number.isInteger(score) || score < 1 || score > 10) throw new Error("Invalid score");
  const data = { score, review: review?.trim() || null };
  await db.rating.upsert({
    where: { userId_movieId: { userId: user.id, movieId } },
    create: { userId: user.id, movieId, ...data },
    update: data,
  });
  revalidatePath(`/movies/${movieId}`);
  revalidatePath("/");
}

export async function addComment(formData: FormData) {
  const user = await getCurrentUser();
  const body = text(formData, "body", 2000);
  if (!body) return;
  const movieId = text(formData, "movieId") || null;
  const postId = text(formData, "postId") || null;
  const parentId = text(formData, "parentId") || null;
  if (!movieId === !postId) throw new Error("Comment needs exactly one target");
  await db.comment.create({ data: { body, authorId: user.id, movieId, postId, parentId } });
  revalidatePath(movieId ? `/movies/${movieId}` : `/journal/${postId}`);
}

export async function toggleLike(target: { ratingId?: string; postId?: string }, path: string) {
  const user = await getCurrentUser();
  const where = target.ratingId
    ? { userId_ratingId: { userId: user.id, ratingId: target.ratingId } }
    : { userId_postId: { userId: user.id, postId: target.postId! } };
  const existing = await db.like.findUnique({ where });
  if (existing) await db.like.delete({ where: { id: existing.id } });
  else await db.like.create({ data: { userId: user.id, ...target } });
  revalidatePath(path);
}

export async function toggleFollow(userId: string, path: string) {
  const user = await getCurrentUser();
  if (userId === user.id) return;
  const key = { followerId_followingId: { followerId: user.id, followingId: userId } };
  const existing = await db.follow.findUnique({ where: key });
  if (existing) await db.follow.delete({ where: key });
  else await db.follow.create({ data: { followerId: user.id, followingId: userId } });
  revalidatePath(path);
}

export async function toggleWatchlist(movieId: string) {
  const user = await getCurrentUser();
  const list =
    (await db.list.findFirst({ where: { ownerId: user.id, isWatchlist: true } })) ??
    (await db.list.create({ data: { ownerId: user.id, name: "Watchlist", isWatchlist: true } }));
  const key = { listId_movieId: { listId: list.id, movieId } };
  const existing = await db.listItem.findUnique({ where: key });
  if (existing) await db.listItem.delete({ where: key });
  else await db.listItem.create({ data: { listId: list.id, movieId } });
  revalidatePath(`/movies/${movieId}`);
  revalidatePath(`/u/${user.username}`);
}

export async function createPost(formData: FormData) {
  const user = await getCurrentUser();
  const title = text(formData, "title", 200);
  const body = text(formData, "body", 20000);
  if (!title || !body) return;
  const post = await db.post.create({ data: { title, body, authorId: user.id } });
  revalidatePath("/journal");
  redirect(`/journal/${post.id}`);
}
