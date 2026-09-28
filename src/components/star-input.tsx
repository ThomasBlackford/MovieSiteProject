"use client";

import { useState, useTransition } from "react";
import { rateMovie } from "@/app/actions";

// Half-star picker: each star is split into a left (half) and right (full) hit area.
export function StarInput({ movieId, initialScore, initialReview }: { movieId: string; initialScore?: number; initialReview?: string | null }) {
  const [score, setScore] = useState(initialScore ?? 0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState(initialReview ?? "");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const shown = hover || score;

  function save(nextScore = score) {
    if (!nextScore) return;
    startTransition(async () => {
      await rateMovie(movieId, nextScore, review);
      setSaved(true);
    });
  }

  return (
    <div className="panel p-4">
      <div className="eyebrow mb-2">{initialScore ? "Your rating" : "Rate this movie"}</div>
      <div className="flex items-center gap-3">
        <div className="flex text-2xl select-none" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((star) => {
            const full = star * 2;
            const pct = shown >= full ? 100 : shown === full - 1 ? 50 : 0;
            return (
              <span key={star} className="relative w-7 cursor-pointer text-center">
                <span className="text-line">★</span>
                <span className="pointer-events-none absolute inset-y-0 left-0 overflow-hidden text-ink transition-[width]" style={{ width: `${pct}%` }}>
                  <span className="block w-7 text-center">★</span>
                </span>
                <button
                  type="button"
                  aria-label={`${star - 0.5} stars`}
                  className="absolute inset-y-0 left-0 w-1/2"
                  onMouseEnter={() => setHover(full - 1)}
                  onClick={() => {
                    setScore(full - 1);
                    setSaved(false);
                    save(full - 1);
                  }}
                />
                <button
                  type="button"
                  aria-label={`${star} stars`}
                  className="absolute inset-y-0 right-0 w-1/2"
                  onMouseEnter={() => setHover(full)}
                  onClick={() => {
                    setScore(full);
                    setSaved(false);
                    save(full);
                  }}
                />
              </span>
            );
          })}
        </div>
        <span className="text-sm text-muted">{shown ? `${(shown / 2).toFixed(1)} / 5` : "—"}</span>
      </div>
      <textarea
        className="field mt-3 min-h-20 resize-y"
        placeholder="Add a short review (optional)"
        value={review}
        onChange={(e) => {
          setReview(e.target.value);
          setSaved(false);
        }}
      />
      <div className="mt-2 flex items-center gap-3">
        <button type="button" className="btn" disabled={!score || pending} onClick={() => save()}>
          {pending ? "Saving…" : "Save review"}
        </button>
        {saved && !pending && <span className="text-xs text-muted">Saved</span>}
        {!score && <span className="text-xs text-muted">Pick a star rating first</span>}
      </div>
    </div>
  );
}
