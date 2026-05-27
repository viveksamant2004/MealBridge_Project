import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, MapPin, Utensils, Building2, Send, Trash2 } from "lucide-react";

interface FoodListing {
  id: string;
  hotel_id: string;
  title: string;
  hotel_name?: string | null;
  description: string | null;
  food_type: string;
  cuisine: string | null;
  quantity_servings: number;
  quantity_kg: number | null;
  pickup_address: string;
  pickup_city: string;
  image_url: string | null;
  status: string | null;
  created_at: string | null;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewModalProps {
  open: boolean;
  listing: FoodListing | null;
  reviews: Review[];
  onClose: () => void;
  onSubmitReview: (listingId: string, review: Omit<Review, "id" | "createdAt">) => void;
  onDeleteReview?: (reviewId: string) => void;
}

// ─── Interactive star rating (for writing a new review) ──────────────────────
const StarRating = ({
  value,
  onChange,
  readOnly = false,
  size = 20,
}: {
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
  size?: number;
}) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = readOnly ? star <= value : star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onChange?.(star)}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onMouseLeave={() => !readOnly && setHovered(0)}
            className={`transition-transform ${!readOnly ? "hover:scale-110 cursor-pointer" : "cursor-default"}`}
          >
            <Star
              style={{ width: size, height: size }}
              className={`transition-colors duration-150 ${
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-gray-300 dark:text-gray-600"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};


const AverageStars = ({
  average,
  size = 14,
}: {
  average: number;
  size?: number;
}) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {

        const fill = Math.min(1, Math.max(0, average - (star - 1)));
        const isPartial = fill > 0 && fill < 1;
        const isFull = fill === 1;

        return (
          <span
            key={star}
            className="relative inline-block"
            style={{ width: size, height: size }}
          >
            {/* Empty base star */}
            <Star
              style={{ width: size, height: size }}
              className="absolute inset-0 fill-transparent text-gray-300 dark:text-gray-600"
            />
            {/* Filled overlay, clipped to `fill` fraction */}
            {(isFull || isPartial) && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star
                  style={{ width: size, height: size }}
                  className="fill-amber-400 text-amber-400"
                />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop";

const ReviewModal = ({
  open,
  listing,
  reviews,
  onClose,
  onSubmitReview,
  onDeleteReview,
}: ReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [author, setAuthor] = useState("");
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!listing || rating === 0) return;
    onSubmitReview(listing.id, {
      author: author.trim() || "Anonymous",
      rating,
      comment: comment.trim(),
    });
    setRating(0);
    setAuthor("");
    setComment("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  };

  const handleDelete = (reviewId: string) => {
    if (confirmDeleteId === reviewId) {
      // Second click → confirmed
      onDeleteReview?.(reviewId);
      setConfirmDeleteId(null);
    } else {
      // First click → ask for confirmation
      setConfirmDeleteId(reviewId);
      // Auto-cancel confirmation after 3 s if user doesn't confirm
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  const avgRatingNum =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : null;
  const avgRating = avgRatingNum !== null ? avgRatingNum.toFixed(1) : null;

  if (!listing) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-background border border-border shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Hero image */}
              <div className="relative h-48 rounded-t-2xl overflow-hidden">
                <img
                  src={listing.image_url ?? PLACEHOLDER_IMAGE}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                {avgRating && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-amber-400 text-black text-xs font-bold px-2 py-1 rounded-full">
                    <Star className="w-3 h-3 fill-black" />
                    {avgRating}
                  </div>
                )}
                <div className="absolute bottom-3 left-3">
                  <p className="text-white font-bold text-lg leading-tight">
                    {listing.hotel_name ?? listing.title}
                  </p>
                  {listing.cuisine && (
                    <span className="text-white/70 text-xs">{listing.cuisine} cuisine</span>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-5">
                {/* Info chips */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 bg-accent/50 rounded-xl px-3 py-2">
                    <Utensils className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-xs font-medium text-foreground truncate">
                      {listing.food_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-accent/50 rounded-xl px-3 py-2">
                    <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-xs font-medium text-foreground">
                 Servings available
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-accent/50 rounded-xl px-3 py-2">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-xs font-medium text-foreground truncate">
                      {listing.pickup_address}, {listing.pickup_city}
                    </span>
                  </div>
                </div>

                {listing.description && (
                  <p className="text-sm text-muted-foreground">{listing.description}</p>
                )}

                {/* Divider */}
                <div className="border-t border-border" />

                {/* Write a review */}
                <div>
                  <h3 className="font-semibold text-sm text-foreground mb-3">Rate & Review</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">Your rating</p>
                      <StarRating value={rating} onChange={setRating} size={24} />
                    </div>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Your name (optional)"
                      className="w-full bg-accent/40 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                    />
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience with this food listing…"
                      rows={3}
                      className="w-full bg-accent/40 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow resize-none"
                    />
                    <AnimatePresence mode="wait">
                      {submitted ? (
                        <motion.div
                          key="thanks"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-center py-2 text-sm font-medium text-primary"
                        >
                          ✓ Review submitted — thank you!
                        </motion.div>
                      ) : (
                        <motion.button
                          key="submit"
                          onClick={handleSubmit}
                          disabled={rating === 0}
                          whileTap={{ scale: 0.97 }}
                          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Submit Review
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Existing reviews */}
                {reviews.length > 0 && (
                  <>
                    <div className="border-t border-border" />
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-sm text-foreground">
                          Reviews ({reviews.length})
                        </h3>
                        {avgRatingNum !== null && (
                          <div className="flex items-center gap-1.5">
                            {/* Average-based partial star display */}
                            <AverageStars average={avgRatingNum} size={14} />
                            <span className="text-sm font-bold text-foreground">{avgRating}</span>
                            <span className="text-xs text-muted-foreground">/ 5</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        <AnimatePresence>
                          {reviews.map((review) => (
                            <motion.div
                              key={review.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: -20, height: 0, marginTop: 0, padding: 0 }}
                              transition={{ duration: 0.2 }}
                              className="bg-accent/40 rounded-xl p-3 space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-foreground">
                                  {review.author}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    {timeAgo(review.createdAt)}
                                  </span>
                                  {/* Delete button */}
                                  {onDeleteReview && (
                                    <button
                                      onClick={() => handleDelete(review.id)}
                                      title={
                                        confirmDeleteId === review.id
                                          ? "Click again to confirm delete"
                                          : "Delete review"
                                      }
                                      className={`flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-xs transition-all duration-200 ${
                                        confirmDeleteId === review.id
                                          ? "bg-red-500 text-white font-semibold"
                                          : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                                      }`}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      {confirmDeleteId === review.id && (
                                        <span>Confirm?</span>
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>
                              {/* Per-review stars — coloured based on average */}
                              <AverageStars average={review.rating} size={14} />
                              {review.comment && (
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {review.comment}
                                </p>
                              )}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReviewModal;