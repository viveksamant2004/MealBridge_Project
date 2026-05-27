import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Star,
  Quote,
  Send,
  Loader2,
  UserCircle2,
  Pencil,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Testimonial {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  full_name: string | null;
  role: string | null;
  organization: string | null;
}

function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={readonly ? 16 : 22}
          className={`transition-all duration-150 ${
            star <= (hovered || value)
              ? "fill-emerald-400 text-emerald-400"
              : "text-gray-300"
          } ${!readonly ? "cursor-pointer hover:scale-110" : ""}`}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          onClick={() => !readonly && onChange?.(star)}
        />
      ))}
    </div>
  );
}

function TestimonialCard({
  t,
  onEdit,
  onDelete,
}: {
  t: Testimonial;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const initials = (t.full_name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const colors = [
    "bg-emerald-100 text-emerald-700",
    "bg-teal-100 text-teal-700",
    "bg-cyan-100 text-cyan-700",
    "bg-green-100 text-green-700",
  ];

  const colorIdx = (t.full_name || "U").charCodeAt(0) % colors.length;

  return (
    <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200 group">
      {(onEdit || onDelete) && (
        <div className="absolute bottom-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          {onEdit && (
            <button
              onClick={onEdit}
              title="Edit review"
              className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-500 hover:text-emerald-600 transition"
            >
              <Pencil size={14} />
            </button>
          )}

          {onDelete && (
            <button
              onClick={onDelete}
              title="Delete review"
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}

      <div className="flex items-start justify-between">
        <Quote size={28} className="text-emerald-200" strokeWidth={2.5} />
        <StarRating value={t.rating} readonly />
      </div>

      <p className="text-gray-700 text-sm leading-relaxed flex-1">
        "{t.comment}"
      </p>

      <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${colors[colorIdx]}`}
        >
          {initials}
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-800">
            {t.full_name || "Anonymous User"}
          </p>

          {(t.role || t.organization) && (
            <p className="text-xs text-gray-500">
              {[t.role, t.organization].filter(Boolean).join(" — ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [userReview, setUserReview] = useState<Testimonial | null>(null);

  // stars empty initially
  const [rating, setRating] = useState(0);

  const [comment, setComment] = useState("");
  const [editMode, setEditMode] = useState(false);

  const fetchTestimonials = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching testimonials:", error);
    } else {
      const allTestimonials = (data as Testimonial[]) || [];

      setTestimonials(allTestimonials);

      if (user) {
        const mine = allTestimonials.find((t) => t.user_id === user.id);

        setUserReview(mine || null);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchTestimonials();

    const channel = supabase
      .channel("testimonials_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "testimonials",
        },
        () => fetchTestimonials()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSubmit = async () => {
    if (!user) return;

    if (!comment.trim()) {
      toast({
        title: "Please write a comment.",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Please select a star rating.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role, organization")
      .eq("id", user.id)
      .single();

    const payload = {
      user_id: user.id,
      rating,
      comment: comment.trim(),
      full_name: profile?.full_name || user.email?.split("@")[0] || null,
      role: profile?.role || null,
      organization: profile?.organization || null,
    };

    let error;

    if (userReview) {
      ({ error } = await supabase
        .from("testimonials")
        .update(payload)
        .eq("id", userReview.id));
    } else {
      ({ error } = await supabase
        .from("testimonials")
        .insert([payload]));
    }

    if (error) {
      toast({
        title: "Failed to submit review.",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: userReview ? "Review updated!" : "Review submitted!",
        description: "Thank you for your feedback.",
      });

      // reset form
      setRating(0);
      setComment("");
      setEditMode(false);

      fetchTestimonials();
    }

    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!userReview) return;

    const { error } = await supabase
      .from("testimonials")
      .delete()
      .eq("id", userReview.id);

    if (!error) {
      setUserReview(null);
      setComment("");
      setRating(0);
      setEditMode(false);

      toast({
        title: "Review deleted.",
      });

      fetchTestimonials();
    }
  };

  const FALLBACK_REVIEWS: Testimonial[] = [
    {
      id: "fallback-1",
      user_id: "",
      rating: 5,
      comment:
        "MealBridge changed everything for us. We now receive fresh hotel food every evening that feeds over 200 families.",
      created_at: "",
      full_name: "Priya Sharma",
      role: "Director",
      organization: "Asha NGO — Mumbai",
    },
    {
      id: "fallback-2",
      user_id: "",
      rating: 5,
      comment:
        "As a hotel, we hated watching good food go to waste after banquets. MealBridge gave us a responsible way to donate.",
      created_at: "",
      full_name: "Rajan Mehta",
      role: "Manager",
      organization: "The Grand Residency — Delhi",
    },
    {
      id: "fallback-3",
      user_id: "",
      rating: 5,
      comment:
        "The notifications are instant and pickup is always on time. We've rescued over 4,000 meals this year alone.",
      created_at: "",
      full_name: "Sunita Devi",
      role: "Coordinator",
      organization: "Seva Foundation — Bangalore",
    },
  ];

  const isShowingFallback = !loading && testimonials.length === 0;

  const displayedTestimonials = isShowingFallback
    ? FALLBACK_REVIEWS
    : testimonials.slice(0, 6);

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            Voices From the{" "}
            <span className="text-emerald-500">Community</span>
          </h2>

          <p className="text-gray-500 text-lg">
            Real stories from hotels and NGOs making a difference together.
          </p>
        </div>

        {/* Review Form */}
        {user ? (
  <div className="mb-12 bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 max-w-2xl mx-auto">
    {!userReview || editMode ? (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <UserCircle2 size={18} className="text-emerald-500" />

          <p className="font-semibold text-gray-700 text-sm">
            {editMode ? "Edit Your Review" : "Share Your Experience"}
          </p>
        </div>

        {/* Empty stars initially */}
        <StarRating value={rating} onChange={setRating} />

        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us how MealBridge has made a difference…"
          className="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300 transition"
        />

        <div className="flex gap-2 justify-end">
          {editMode && (
            <button
              onClick={() => {
                setEditMode(false);
                setRating(0);
                setComment("");
              }}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}

            {editMode ? "Update" : "Submit"} Review
          </button>
        </div>
      </div>
    ) : (
      <div className="text-center py-4">
        <p className="text-sm text-emerald-600 font-medium">
          Your review has been submitted successfully.
        </p>
      </div>
    )}
  </div>
) : (
  <div className="mb-12 text-center">
    <p className="text-gray-500 text-sm">
      <a
        href="/auth"
        className="text-emerald-600 font-medium hover:underline"
      >
        Sign in
      </a>{" "}
      to share your experience with the community.
    </p>
  </div>
)}

        {/* Testimonials Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={32} className="animate-spin text-emerald-400" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedTestimonials.map((t) => (
                <TestimonialCard
                  key={t.id}
                  t={t}
                  onEdit={
                    user && t.user_id === user.id
                      ? () => {
                          setEditMode(true);
                          setRating(t.rating);
                          setComment(t.comment);
                        }
                      : undefined
                  }
                  onDelete={
                    user && t.user_id === user.id
                      ? handleDelete
                      : undefined
                  }
                />
              ))}
            </div>
          </>
        )}

        {testimonials.length > 6 && (
          <p className="text-center mt-8 text-sm text-gray-400">
            Showing 6 of {testimonials.length} reviews
          </p>
        )}
      </div>
    </section>
  );
}