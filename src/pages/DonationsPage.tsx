import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, Building2, MapPin, Star, UtensilsCrossed,
  ChevronRight, ArrowLeft, Clock, Users, ShoppingBag
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import OrderFoodModal from "@/components/OrderfoodModal";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";


interface Hotel {
  id: string;
  name: string;
  address: string;
  city: string;
  cuisine_type?: string | null;
  image_url?: string | null;
  rating?: number | null;
}

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

// ─── Fallback data ─────────────────────────────────────────────────────────────

const FALLBACK_HOTELS: Hotel[] = [
  { id: "h1", name: "Marriott", address: "Rajpur Road", city: "Dehradun", cuisine_type: "Continental", image_url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop", rating: 4.8 },
  { id: "h2", name: "Spice Garden Hotel", address: "MG Road", city: "Bangalore", cuisine_type: "Indian", image_url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=400&fit=crop", rating: 4.5 },
  { id: "h3", name: "Bella Italia Bistro", address: "Andheri West", city: "Mumbai", cuisine_type: "Italian", image_url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop", rating: 4.3 },
  { id: "h4", name: "ITC Royal Bengal", address: "Park Street", city: "Kolkata", cuisine_type: "Bengali", image_url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop", rating: 4.7 },
];

const FALLBACK_FOOD: Record<string, FoodListing[]> = {
  h1: [
    { id: "f1", hotel_id: "h1", title: "Continental Buffet", hotel_name: "Marriott", description: "Mixed continental spread", food_type: "Continental Buffet", cuisine: "Continental", quantity_servings: 85, quantity_kg: null, pickup_address: "Rajpur Road", pickup_city: "Dehradun", image_url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop", status: "available", created_at: new Date().toISOString() },
  ],
  h2: [
    { id: "f2", hotel_id: "h2", title: "Biryani & Curry", hotel_name: "Spice Garden", description: "Freshly prepared", food_type: "Biryani, Naan & Curry", cuisine: "Indian", quantity_servings: 120, quantity_kg: null, pickup_address: "MG Road", pickup_city: "Bangalore", image_url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=400&fit=crop", status: "available", created_at: new Date().toISOString() },
  ],
  h3: [
    { id: "f3", hotel_id: "h3", title: "Pasta & Salads", hotel_name: "Bella Italia", description: "Italian spread", food_type: "Pasta, Salads & Desserts", cuisine: "Italian", quantity_servings: 60, quantity_kg: null, pickup_address: "Andheri West", pickup_city: "Mumbai", image_url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop", status: "available", created_at: new Date().toISOString() },
  ],
  h4: [
    { id: "f4", hotel_id: "h4", title: "Bengali Fish Curry", hotel_name: "ITC Royal Bengal", description: "Traditional fish curry", food_type: "Fish Curry & Steamed Rice", cuisine: "Bengali", quantity_servings: 75, quantity_kg: null, pickup_address: "Park Street", pickup_city: "Kolkata", image_url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop", status: "available", created_at: new Date().toISOString() },
  ],
};

const getTimeAgo = (dateStr: string | null) => {
  if (!dateStr) return "Recently";
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  return `${Math.floor(hrs / 24)} day(s) ago`;
};

// ✅ FIX 2: Added `cfg` constant that was missing entirely
const cfg = {
  badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  dot: "bg-emerald-400",
  label: "Available",
};

// ─── Food Card ────────────────────────────────────────────────────────────────

const FoodCard = ({ listing, onOrder }: { listing: FoodListing; onOrder: (l: FoodListing) => void }) => {
  return (
    <motion.article
      whileHover={{ y: -3, boxShadow: "0 16px 40px rgba(0,0,0,0.09)" }}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col"
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={listing.image_url ?? "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop"}
          alt={listing.title}
          className="w-full h-full object-cover"
        />
        <span className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${cfg.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
        </span>
        <span className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 text-white text-xs backdrop-blur-sm">
          <Clock className="w-3 h-3" />{getTimeAgo(listing.created_at)}
        </span>
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h4 className="font-bold text-gray-900 text-sm leading-tight">{listing.title}</h4>
          <p className="text-xs text-gray-500 mt-0.5">{listing.food_type}</p>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500">
          <Users className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="text-xs"><span className="font-semibold text-gray-800">{listing.quantity_servings}</span> servings available</span>
        </div>
        <div className="border-t border-gray-100 mt-auto pt-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onOrder(listing)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20 transition-all duration-150"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Order
          </motion.button>
          <p className="text-center text-[10px] text-primary font-medium mt-1">Claim to Order</p>
        </div>
      </div>
    </motion.article>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const DonationsPage = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [foodListings, setFoodListings] = useState<FoodListing[]>([]);
  const [foodLoading, setFoodLoading] = useState(false);

  const [orderModal, setOrderModal] = useState<{ open: boolean; listing: FoodListing | null }>({ open: false, listing: null });

  useEffect(() => {
    const fetchHotels = async () => {
      const { data, error } = await supabase
        .from("food_listings")
        .select("hotel_id, hotel_name, pickup_address, pickup_city, image_url")
        .eq("status", "available")
        .gt("expires_at", new Date().toISOString());

      if (error || !data || data.length === 0) {
        setHotels(FALLBACK_HOTELS);
      } else {
        const seen = new Set<string>();
        const unique: Hotel[] = [];
        for (const row of data) {
          if (!seen.has(row.hotel_id)) {
            seen.add(row.hotel_id);
            unique.push({
              id: row.hotel_id,
              name: row.hotel_name ?? "Unknown Hotel",
              address: row.pickup_address,
              city: row.pickup_city,
              image_url: row.image_url,
              rating: 4.5,
            });
          }
        }
        setHotels(unique.length > 0 ? unique : FALLBACK_HOTELS);
      }
      setLoading(false);
    };
    fetchHotels();
  }, []);

  const openHotel = async (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setFoodLoading(true);
    setFoodListings([]);

    const { data, error } = await supabase
      .from("food_listings")
      .select("*")
      .eq("hotel_id", hotel.id)
      .eq("status", "available")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      setFoodListings(FALLBACK_FOOD[hotel.id] ?? []);
    } else {
      setFoodListings(data);
    }
    setFoodLoading(false);
  };

  const filtered = query.trim()
    ? hotels.filter(h =>
        h.name.toLowerCase().includes(query.toLowerCase()) ||
        h.city.toLowerCase().includes(query.toLowerCase()) ||
        (h.cuisine_type ?? "").toLowerCase().includes(query.toLowerCase())
      )
    : hotels;

  const HotelListView = () => (
    <>
      <section className="bg-background pt-14 pb-6 border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-display font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest">
            🍱 Donation Listings
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="font-display text-3xl md:text-4xl font-extrabold text-foreground mb-3 leading-tight">
            Hotels Donating <span className="text-primary">Food Today</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="font-body text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Click on any hotel to see what food they have available right now.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search by hotel name or city…"
                className="w-full bg-background border border-border rounded-xl pl-11 pr-10 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow shadow-sm" />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-background py-10">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">Loading hotels…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-display font-bold text-foreground text-lg mb-1">No hotels found</p>
              <p className="font-body text-sm text-muted-foreground">Try a different name or city.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((hotel, i) => (
                  <motion.div key={hotel.id} layout
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }} transition={{ delay: i * 0.05 }}>
                    <motion.article
                      whileHover={{ y: -4, boxShadow: "0 20px 48px rgba(0,0,0,0.10)" }}
                      onClick={() => openHotel(hotel)}
                      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm cursor-pointer flex flex-col h-full"
                    >
                      <div className="relative h-44 overflow-hidden">
                        <img src={hotel.image_url ?? "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop"}
                          alt={hotel.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                        <span className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 backdrop-blur-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Donating
                        </span>
                      </div>
                      <div className="p-4 flex flex-col gap-2 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-gray-900 text-base leading-tight">{hotel.name}</h3>
                          {hotel.rating && (
                            <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1 shrink-0">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span className="text-xs font-bold text-amber-700">{hotel.rating}</span>
                            </div>
                          )}
                        </div>
                        {hotel.cuisine_type && <p className="text-xs text-gray-500 font-medium">{hotel.cuisine_type}</p>}
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="text-xs truncate">{hotel.address}, {hotel.city}</span>
                        </div>
                        <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-xs text-primary font-semibold">View available food</span>
                          <ChevronRight className="w-4 h-4 text-primary" />
                        </div>
                      </div>
                    </motion.article>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </section>
    </>
  );

  const HotelFoodView = () => (
    <>
      <section className="bg-background pt-14 pb-6 border-b border-border">
        <div className="container mx-auto px-4">
          <button onClick={() => setSelectedHotel(null)}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to hotels
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-extrabold text-foreground leading-tight">
                {selectedHotel?.name}
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
                {selectedHotel?.address}, {selectedHotel?.city}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-10">
        <div className="container mx-auto px-4">
          {foodLoading ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Loading food listings…</p>
            </div>
          ) : foodListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-4">
                <UtensilsCrossed className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-display font-bold text-foreground text-lg mb-1">No food available right now</p>
              <p className="font-body text-sm text-muted-foreground">Check back later.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {foodListings.map(listing => (
                  <motion.div key={listing.id} layout
                    initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.2 }}>
                    <FoodCard listing={listing} onOrder={l => setOrderModal({ open: true, listing: l })} />
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </section>
    </>
  );

  return (
    <>
      <div className="min-h-screen bg-background w-full overflow-x-hidden">
        <Navbar />
        <main className="pt-16">
          <AnimatePresence mode="wait">
            {selectedHotel ? (
              <motion.div key="food" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
                <HotelFoodView />
              </motion.div>
            ) : (
              <motion.div key="hotels" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.2 }}>
                <HotelListView />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        <Footer />
      </div>

      <OrderFoodModal
        listing={orderModal.listing}
        open={orderModal.open}
        onClose={() => setOrderModal({ open: false, listing: null })}
      />
    </>
  );
};

export default DonationsPage;