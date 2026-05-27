import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, UtensilsCrossed } from "lucide-react";
import { useLocation } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { geocodeAddress } from "@/utils/geocode";

import DonationCard from "./DonationCard";
import DonateHotelModal from "./DonateHotelModal";
import OrderFoodModal from "./OrderfoodModal";
import ReviewModal, { Review } from "./ReviewModal";
import AddListingModal from "./AddListingModal";
import ViewOrdersModal from "./ViewOrderModal";

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
  latitude?: number | null;
  longitude?: number | null;
  image_url: string | null;
  status: string | null;
  created_at: string | null;
  is_donation?: boolean | null;
}

const DEFAULT_LISTINGS: FoodListing[] = [
  {
    id: "home-1", hotel_id: "dummy", title: "Biryani & Curry",
    hotel_name: "Spice Garden Hotel", description: "Freshly prepared",
    food_type: "Biryani, Naan & Curry", cuisine: "Indian", quantity_servings: 120,
    quantity_kg: null, pickup_address: "MG Road", pickup_city: "Bangalore",
    latitude: 12.9716, longitude: 77.5946,
    image_url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=400&fit=crop",
    status: "available", created_at: new Date().toISOString(), is_donation: false,
  },
  {
    id: "home-2", hotel_id: "dummy", title: "Continental Buffet",
    hotel_name: "The Grand Continental", description: "Mixed continental spread",
    food_type: "Mixed Continental Buffet", cuisine: "Continental", quantity_servings: 85,
    quantity_kg: null, pickup_address: "Connaught Place", pickup_city: "Delhi",
    latitude: 28.6315, longitude: 77.2167,
    image_url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop",
    status: "available", created_at: new Date().toISOString(), is_donation: false,
  },
  {
    id: "home-3", hotel_id: "dummy", title: "Pasta & Salads",
    hotel_name: "Bella Italia Bistro", description: "Italian spread",
    food_type: "Pasta, Salads & Desserts", cuisine: "Italian", quantity_servings: 60,
    quantity_kg: null, pickup_address: "Andheri West", pickup_city: "Mumbai",
    latitude: 19.1136, longitude: 72.8697,
    image_url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop",
    status: "available", created_at: new Date().toISOString(), is_donation: false,
  },
];

interface ModalState { open: boolean; listing: FoodListing | null; }
type ReviewsMap = Record<string, Review[]>;

const FoodGrid = () => {
  const [listings, setListings] = useState<FoodListing[]>(DEFAULT_LISTINGS);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const [donateModal, setDonateModal] = useState<ModalState>({ open: false, listing: null });
  const [orderModal, setOrderModal] = useState<ModalState>({ open: false, listing: null });
  const [reviewModal, setReviewModal] = useState<ModalState>({ open: false, listing: null });
  const [reviewsMap, setReviewsMap] = useState<ReviewsMap>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showMapView, setShowMapView] = useState(false);

  const location = useLocation();
  const highlightId = new URLSearchParams(location.search).get("highlight");
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const fetchListings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("food_listings")
      .select("*")
      .eq("status", "available")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      setListings(DEFAULT_LISTINGS);
    } else {
      const enriched = await Promise.all(
        data.map(async (listing) => {
          if (listing.latitude && listing.longitude) return listing;
          const coords = await geocodeAddress(listing.pickup_address, listing.pickup_city);
          return coords ? { ...listing, ...coords } : listing;
        })
      );
      setListings(enriched);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchListings();

    const channel = supabase
      .channel("food-listings-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "food_listings" },
        () => { fetchListings(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchListings]);

  useEffect(() => {
    if (!highlightId || loading) return;
    const el = cardRefs.current[highlightId];
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-emerald-500", "ring-offset-2");
        setTimeout(() => {
          el.classList.remove("ring-2", "ring-emerald-500", "ring-offset-2");
        }, 2500);
      }, 300);
    }
  }, [highlightId, loading]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return listings;
    return listings.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.food_type.toLowerCase().includes(q) ||
        l.pickup_city.toLowerCase().includes(q) ||
        l.pickup_address.toLowerCase().includes(q) ||
        (l.hotel_name ?? "").toLowerCase().includes(q)
    );
  }, [query, listings]);

  const handleClaimDonate = (id: string) => {
    const listing = listings.find((l) => l.id === id) ?? null;
    setDonateModal({ open: true, listing });
  };

  const handleClaimOrder = (id: string) => {
    const listing = listings.find((l) => l.id === id) ?? null;
    setOrderModal({ open: true, listing });
  };

  const handleOpenReview = useCallback((id: string) => {
    const listing = listings.find((l) => l.id === id) ?? null;
    setReviewModal({ open: true, listing });
  }, [listings]);

  const handleSubmitReview = useCallback(
    (listingId: string, review: Omit<Review, "id" | "createdAt">) => {
      const newReview: Review = {
        ...review, id: `${listingId}-${Date.now()}`, createdAt: new Date().toISOString(),
      };
      setReviewsMap((prev) => ({
        ...prev, [listingId]: [newReview, ...(prev[listingId] ?? [])],
      }));
    }, []
  );

  const closeDonateModal = () => setDonateModal({ open: false, listing: null });
  const closeOrderModal = () => setOrderModal({ open: false, listing: null });
  const closeReviewModal = () => setReviewModal({ open: false, listing: null });

  const getAvgRating = (id: string) => {
    const reviews = reviewsMap[id] ?? [];
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  };

  const handleAddListing = (newListing: Record<string, unknown>) => {
    const listing: FoodListing = {
      id: (newListing.id as string) ?? `local-${Date.now()}`,
      hotel_id: (newListing.hotel_id as string) ?? "local",
      title: newListing.title as string,
      hotel_name: (newListing.hotel_name as string) ?? null,
      description: (newListing.description as string) ?? null,
      food_type: newListing.food_type as string,
      cuisine: (newListing.cuisine as string) ?? null,
      quantity_servings: (newListing.quantity_servings as number) ?? 0,
      quantity_kg: null,
      pickup_address: newListing.pickup_address as string,
      pickup_city: (newListing.pickup_city as string) ?? "",
      latitude: (newListing.latitude as number) ?? null,
      longitude: (newListing.longitude as number) ?? null,
      image_url: (newListing.image_url as string) ?? null,
      status: "available",
      created_at: (newListing.created_at as string) ?? new Date().toISOString(),
      is_donation: (newListing.is_donation as boolean) ?? false,
    };
    setListings((prev) => [listing, ...prev]);
  };

  if (loading) {
    return (
      <section className="bg-background py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-lg">Loading available food...</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="bg-background py-16 md:py-24 pb-28 md:pb-24 relative z-10">
        <div className="container mx-auto px-4">

          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-10"
          >
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mb-3">
              Available <span className="text-primary">Right Now</span>
            </h2>
            <p className="text-muted-foreground font-body text-lg max-w-xl mx-auto">
              Fresh food from top-rated hotels and restaurants near you — claim before it's gone.
            </p>
          </motion.div>

          <div className="flex justify-end gap-3 mb-6">
            <button
              onClick={() => window.location.href = "/donation-orders"}
              className="px-4 py-2 rounded-lg border border-emerald-500 text-emerald-600 text-sm font-semibold hover:bg-emerald-50 transition-colors flex items-center gap-2"
            >
              📋 View Donation Orders
            </button>
            <button
              onClick={() => setShowOrdersModal(true)}
              className="px-4 py-2 rounded-lg border border-emerald-500 text-emerald-600 text-sm font-semibold hover:bg-emerald-50 transition-colors flex items-center gap-2"
            >
              🛍️ View Your Orders
            </button>
            <Button onClick={() => setShowAddModal(true)}>+ Add Listing</Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="max-w-xl mx-auto mb-10"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by food name, type, hotel or city…"
                className="w-full bg-background border border-border rounded-xl pl-11 pr-10 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow shadow-sm"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {query && (
              <p className="text-xs font-body text-muted-foreground mt-2 pl-1">
                {filtered.length === 0 ? "No results found"
                  : `${filtered.length} result${filtered.length > 1 ? "s" : ""} for "${query}"`}
              </p>
            )}
          </motion.div>

          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-4">
                <UtensilsCrossed className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-display font-bold text-foreground text-lg mb-1">No food found</p>
              <p className="font-body text-sm text-muted-foreground">Try a different name, type, or city.</p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((listing) => {
                  const reviews = reviewsMap[listing.id] ?? [];
                  return (
                    <motion.div
                      key={listing.id} layout
                      ref={(el) => { cardRefs.current[listing.id] = el; }}
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.2 }}
                    >
                      <DonationCard
                        id={listing.id}
                        hotelName={listing.hotel_name || listing.title}
                        foodType={listing.food_type}
                        servings={listing.quantity_servings}
                        location={listing.pickup_address}
                        city={listing.pickup_city}
                        latitude={listing.latitude ?? undefined}
                        longitude={listing.longitude ?? undefined}
                        image={listing.image_url ?? "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop"}
                        averageRating={getAvgRating(listing.id)}
                        reviewCount={reviews.length}
                        isDonation={listing.is_donation ?? false}
                        onClaimDonate={handleClaimDonate}
                        onClaimOrder={handleClaimOrder}
                        onOpenReview={handleOpenReview}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )}
        </div>
      </section>

      <DonateHotelModal listing={donateModal.listing} open={donateModal.open} onClose={closeDonateModal} />
      <OrderFoodModal listing={orderModal.listing} open={orderModal.open} onClose={closeOrderModal} />
      <ReviewModal
        open={reviewModal.open}
        listing={reviewModal.listing}
        reviews={reviewModal.listing ? reviewsMap[reviewModal.listing.id] ?? [] : []}
        onClose={closeReviewModal}
        onSubmitReview={handleSubmitReview}
      />
      <AddListingModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={handleAddListing} />
      <ViewOrdersModal open={showOrdersModal} onClose={() => setShowOrdersModal(false)} />
    </>
  );
};

export default FoodGrid;