import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MapPin, Phone, Mail, Truck, ChevronRight, Search, Building2 } from "lucide-react";
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

const HotelList = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filtered, setFiltered] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHotels = async () => {
      const { data, error } = await supabase
        .from("hotel_registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setHotels(data);
        setFiltered(data);
      }
      setLoading(false);
    };

    fetchHotels();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      hotels.filter(
        (h) =>
          h.hotel_name?.toLowerCase().includes(q) ||
          h.city?.toLowerCase().includes(q) ||
          h.state?.toLowerCase().includes(q) ||
          h.description?.toLowerCase().includes(q)
      )
    );
  }, [search, hotels]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <section className="pt-28 pb-10 px-4 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-widest mb-3"
          >
            <Building2 className="w-4 h-4" />
            Registered Partners
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2"
          >
            Hotels &amp; Restaurants
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 text-sm mb-6"
          >
            {hotels.length} partners rescuing food with MealBridge
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="relative max-w-md"
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, city or food type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:bg-white transition-colors"
            />
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-10 px-4">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-2/3 mb-3" />
                  <div className="h-3 bg-gray-100 rounded w-1/3 mb-6" />
                  <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-4/5" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-gray-400 text-sm">
                {search ? "No hotels match your search." : "No hotels registered yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {filtered.map((hotel, i) => (
                <motion.div
                  key={hotel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/hotels/${hotel.id}`)}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all duration-200 group"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h2 className="font-bold text-gray-900 text-base group-hover:text-emerald-600 transition-colors">
                        {hotel.hotel_name}
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">{hotel.owner_name}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {hotel.pickup_available && (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                          <Truck className="w-3 h-3" />
                          Pickup
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </div>

                  {/* Location */}
                  {(hotel.city || hotel.state) && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      {[hotel.city, hotel.state, hotel.pincode].filter(Boolean).join(", ")}
                    </div>
                  )}

                  {/* Description */}
                  {hotel.description && (
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-4">
                      {hotel.description}
                    </p>
                  )}

                  {/* Contact row */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-4 border-t border-gray-50">
                    {hotel.email && (
                      <span className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Mail className="w-3 h-3" />
                        {hotel.email}
                      </span>
                    )}
                    {hotel.phone && (
                      <span className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Phone className="w-3 h-3" />
                        {hotel.phone}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HotelList;