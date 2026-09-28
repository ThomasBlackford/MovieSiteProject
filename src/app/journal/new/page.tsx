import { createPost } from "@/app/actions";

export default function NewPostPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="eyebrow mb-1">Journal</div>
      <h1 className="mb-6 text-3xl font-medium">Write a post</h1>
      <form action={createPost} className="panel space-y-4 p-6">
        <input name="title" required maxLength={200} className="field text-lg" placeholder="Why the third act of Low tide works" />
        <textarea name="body" required className="field min-h-72 resize-y leading-relaxed" placeholder="Leave a blank line between paragraphs." />
        <button className="btn">Publish</button>
      </form>
    </div>
  );
}
