import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MapPin, Phone, Mail, Truck, ArrowLeft, Clock, Package, Star, Plus } from "lucide-react";
import AddListingModal from "@/components/AddListingModal";
import { motion } from "framer-motion";

type Hotel = {
  id: string;
  hotel_name: string;
  owner_name: string;
  email: string;
  phone: string;
  hotel_address: string;
  city: string;
  state: string;
  pincode: string;
  pickup_available: boolean;
  description: string;
  created_at: string;
};

// Adjust this type to match your actual food/donations table columns
type FoodListing = {
  id: string;
  food_name: string;
  food_type?: string;
  quantity?: number;
  servings?: number;
  expiry_time?: string;
  status?: string;
  created_at: string;
  rating?: number;
};

const HotelDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [foods, setFoods] = useState<FoodListing[]>([]);
  const [loadingHotel, setLoadingHotel] = useState(true);
  const [loadingFoods, setLoadingFoods] = useState(true);
  const [showAddListing, setShowAddListing] = useState(false);

  useEffect(() => {
    const fetchHotel = async () => {
      const { data, error } = await supabase
        .from("hotel_registrations")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) setHotel(data);
      setLoadingHotel(false);
    };

    const fetchFoods = async () => {
      // ⚠️ Replace "food_listings" with your actual table name
      // and "hotel_id" with the actual foreign key column name
      const { data, error } = await supabase
        .from("food_listings")
        .select("*")
        .eq("hotel_id", id)
        .order("created_at", { ascending: false });

      if (!error && data) setFoods(data);
      setLoadingFoods(false);
    };

    if (id) {
      fetchHotel();
      fetchFoods();
    }
  }, [id]);

  if (loadingHotel) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-32 px-4 max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 animate-pulse space-y-4">
            <div className="h-6 bg-gray-100 rounded w-1/2" />
            <div className="h-4 bg-gray-100 rounded w-1/3" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-4/5" />
          </div>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-32 px-4 text-center">
          <p className="text-gray-400">Hotel not found.</p>
          <button onClick={() => navigate("/hotels/list")} className="mt-4 text-emerald-600 text-sm font-semibold">
            ← Back to list
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Back */}
          <button
            onClick={() => navigate("/hotels/list")}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-emerald-600 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all hotels
          </button>

          {/* Hotel Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            {/* Green header band */}
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 px-7 py-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">{hotel.hotel_name}</h1>
                  <p className="text-emerald-100 text-sm">Managed by {hotel.owner_name}</p>
                </div>
                {hotel.pickup_available && (
                  <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full shrink-0">
                    <Truck className="w-3.5 h-3.5" />
                    Pickup Available
                  </span>
                )}
              </div>
            </div>

            {/* Details grid */}
            <div className="px-7 py-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {(hotel.city || hotel.state || hotel.hotel_address) && (
                <InfoItem
                  icon={<MapPin className="w-4 h-4" />}
                  label="Address"
                  value={[hotel.hotel_address, hotel.city, hotel.state, hotel.pincode].filter(Boolean).join(", ")}
                />
              )}
              {hotel.email && (
                <InfoItem icon={<Mail className="w-4 h-4" />} label="Email" value={hotel.email} />
              )}
              {hotel.phone && (
                <InfoItem icon={<Phone className="w-4 h-4" />} label="Phone" value={hotel.phone} />
              )}
              {hotel.created_at && (
                <InfoItem
                  icon={<Clock className="w-4 h-4" />}
                  label="Registered"
                  value={new Date(hotel.created_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                />
              )}
            </div>

            {hotel.description && (
              <div className="px-7 pb-6 border-t border-gray-50 pt-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">About surplus food</p>
                <p className="text-sm text-gray-600 leading-relaxed">{hotel.description}</p>
              </div>
            )}
          </motion.div>

          {/* Food Listings */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-4">
  <Package className="w-4 h-4 text-emerald-500" />
  <h2 className="font-bold text-gray-900 text-base">Food Listings</h2>
  {!loadingFoods && (
    <span className="text-xs text-gray-400">{foods.length} item{foods.length !== 1 ? "s" : ""}</span>
  )}
  <button
    onClick={() => setShowAddListing(true)}
    className="ml-auto flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
  >
    <Plus className="w-3.5 h-3.5" />
    Add Listing
  </button>
</div>

            {loadingFoods ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                    <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : foods.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="w-5 h-5 text-gray-300" />
                </div>
                <p className="text-gray-400 text-sm">No food listings yet for this hotel.</p>
                 <button
      onClick={() => setShowAddListing(true)}
      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
    >
      <Plus className="w-4 h-4" />
      Add Listing
    </button>
              </div>
            ) : (
              <div className="space-y-3">
                {foods.map((food, i) => (
                  <motion.div
                    key={food.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 flex items-start justify-between gap-4 cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all"
                    onClick={() => navigate(`/?highlight=${food.id}`)}                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{food.food_name}</h3>
                        {food.food_type && (
                          <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                            {food.food_type}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                        {food.servings != null && (
                          <span className="text-xs text-gray-400">{food.servings} servings</span>
                        )}
                        {food.quantity != null && (
                          <span className="text-xs text-gray-400">{food.quantity} units</span>
                        )}
                        {food.expiry_time && (
                          <span className="flex items-center gap-1 text-xs text-amber-500">
                            <Clock className="w-3 h-3" />
                            Expires: {new Date(food.expiry_time).toLocaleString("en-IN", {
                              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                            })}
                          </span>
                        )}
                        {food.created_at && (
                          <span className="text-xs text-gray-300">
                            Listed {new Date(food.created_at).toLocaleDateString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {food.status && (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          food.status === "available"
                            ? "bg-emerald-50 text-emerald-700"
                            : food.status === "claimed"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          {food.status.charAt(0).toUpperCase() + food.status.slice(1)}
                        </span>
                      )}
                      {food.rating != null && (
                        <span className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                          <Star className="w-3 h-3 fill-amber-400 stroke-none" />
                          {food.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

        </div>
      </div>

     <AddListingModal
  isOpen={showAddListing}
  onClose={() => setShowAddListing(false)}
  hotelId={id}  
  onSuccess={(newListing) => {
    setFoods(prev => [newListing as any, ...prev]);
    setShowAddListing(false);
  }}
  prefillHotel={{
    hotel_name: hotel?.hotel_name ?? "",
    contact_name: hotel?.owner_name ?? "",
    contact_phone: hotel?.phone ?? "",
    pickup_address: hotel?.hotel_address ?? "",
    pickup_city: hotel?.city ?? "",
  }}
/>

      <Footer />
    </div>
  );
};

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-start gap-3">
    <span className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500 shrink-0">
      {icon}
    </span>
    <div>
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-gray-700">{value}</p>
    </div>
  </div>
);

export default HotelDetail;