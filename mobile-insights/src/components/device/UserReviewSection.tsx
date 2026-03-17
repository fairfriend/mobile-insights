"use client";
import { useState } from "react";
import { Star, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Review {
  id: number;
  rating: number | null;
  review_text: string | null;
  created_at: string;
  user?: { full_name: string | null; avatar_url: string | null } | null;
}

interface Props {
  reviews: Review[];
  deviceId: number;
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={i <= rating ? "text-yellow-400 fill-yellow-400" : "text-slate-600"}
        />
      ))}
    </div>
  );
}

export function UserReviewSection({ reviews, deviceId }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length
    : 0;

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">User Reviews</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          Write a Review
        </button>
      </div>

      {reviews.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-[#0f172a] rounded-xl">
          <div className="text-4xl font-bold text-white">{avgRating.toFixed(1)}</div>
          <div>
            <StarDisplay rating={Math.round(avgRating)} />
            <p className="text-sm text-slate-500 mt-1">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
      )}

      {/* Write review form */}
      {showForm && (
        <div className="bg-[#0f172a] rounded-xl p-4 space-y-4 border border-[#334155]">
          <h3 className="font-semibold text-white">Your Review</h3>
          <div>
            <p className="text-sm text-slate-400 mb-2">Rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  onMouseEnter={() => setHoverRating(i)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(i)}
                >
                  <Star
                    size={24}
                    className={
                      i <= (hoverRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-slate-600"
                    }
                  />
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your experience with this phone..."
            rows={4}
            className="w-full bg-[#1e293b] border border-[#334155] rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-brand-500 resize-none"
          />
          <div className="flex gap-2">
            <button className="btn-primary text-sm">Submit Review</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4">
            No reviews yet. Be the first to review this phone!
          </p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-[#334155] last:border-0 pb-4 last:pb-0">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#334155] flex items-center justify-center shrink-0">
                  <User size={16} className="text-slate-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">
                      {review.user?.full_name ?? "Anonymous"}
                    </span>
                    <span className="text-xs text-slate-500">{formatDate(review.created_at)}</span>
                  </div>
                  {review.rating && <StarDisplay rating={review.rating} />}
                  {review.review_text && (
                    <p className="text-sm text-slate-400 mt-2 leading-relaxed">{review.review_text}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
