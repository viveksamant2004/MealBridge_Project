import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ShoppingBag, MapPin, Users, Hotel, Phone, User,
  MessageSquare, CheckCircle2, Navigation, Home, CreditCard
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FoodListing {
  id: string;
  title: string;
  hotel_name?: string | null;
  food_type: string;
  quantity_servings: number;
  pickup_address: string;
  pickup_city: string;
  image_url?: string | null;
  cuisine?: string | null;
}

interface OrderFoodModalProps {
  listing: FoodListing | null;
  open: boolean;
  onClose: () => void;
}

type PickupType = "pickup" | "delivery";

const OrderFoodModal = ({ listing, open, onClose }: OrderFoodModalProps) => {
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    servings: "",
    hotelName: "",
    deliveryAddress: "",
    pickupType: "pickup" as PickupType,
    paymentMethod: "cod",
    specialInstructions: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing) return;

    if (form.pickupType === "delivery" && !form.deliveryAddress.trim()) {
      setError("Please provide a delivery address.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from("food_orders").insert({
        listing_id: listing.id,
        hotel_name: form.hotelName || listing.hotel_name || listing.title,
        food_type: listing.food_type,
        quantity_servings: parseInt(form.servings),
        customer_name: form.customerName,
        customer_phone: form.customerPhone,
        customer_address: form.pickupType === "pickup"
          ? `${listing.pickup_address}, ${listing.pickup_city}`
          : form.deliveryAddress,
        pickup_or_delivery: form.pickupType,
        special_instructions: form.specialInstructions || null,
        ordered_at: new Date().toISOString(),
        status: "pending",
      });

      if (insertError) throw insertError;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError(null);
    setForm({
      customerName: "", customerPhone: "", servings: "",
      hotelName: "", deliveryAddress: "", pickupType: "pickup",
      paymentMethod: "cod", specialInstructions: "",
    });
    onClose();
  };

  if (!listing) return null;

  const hotelDisplay = form.hotelName || listing.hotel_name || listing.title;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="order-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            key="order-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">

              {/* Success */}
              {success ? (
                <div className="p-10 flex flex-col items-center text-center gap-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-10 h-10 text-primary" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-2xl text-gray-900 mb-2">Order Placed!</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Your order of <span className="font-semibold text-gray-700">{form.servings} servings</span> from{" "}
                      <span className="font-semibold text-gray-700">{hotelDisplay}</span> has been confirmed.{" "}
                      {form.pickupType === "pickup"
                        ? `Head to ${listing.pickup_address}, ${listing.pickup_city} to collect.`
                        : `Delivery will be sent to your address.`}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 w-full text-left border border-gray-100">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Order Summary</p>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Hotel</span>
                        <span className="font-semibold text-gray-800">{hotelDisplay}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Food</span>
                        <span className="font-semibold text-gray-800">{listing.food_type}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Servings</span>
                        <span className="font-semibold text-gray-800">{form.servings}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Type</span>
                        <span className="font-semibold text-gray-800 capitalize">{form.pickupType}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="mt-1 px-8 py-3 bg-primary text-white rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  {/* Header image */}
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src={listing.image_url ?? "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=300&fit=crop"}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <button
                      onClick={handleClose}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-4 left-5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-primary text-white text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3" /> Order
                        </span>
                        {listing.cuisine && (
                          <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
                            {listing.cuisine}
                          </span>
                        )}
                      </div>
                      <h2 className="text-white font-bold text-lg leading-tight">{listing.title}</h2>
                    </div>
                  </div>

                  {/* Listing meta strip */}
                  <div className="px-5 py-3 bg-primary/5 border-b border-primary/10 flex flex-wrap gap-4">
                    <div className="flex items-center gap-1.5 text-primary text-xs">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{listing.pickup_address}, {listing.pickup_city}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-primary text-xs">
                      <Users className="w-3.5 h-3.5" />
                      <span> Servings available</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-primary text-xs">
                      <Hotel className="w-3.5 h-3.5" />
                      <span>{listing.hotel_name || listing.title}</span>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="p-5 pb-12 flex flex-col gap-4 ">
                    <h3 className="font-bold text-gray-900 text-base">Your Order Details</h3>

                    {/* Pickup / Delivery toggle */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600">Fulfillment Type *</label>
                      <div className="grid grid-cols-2 gap-2">
                        {(["pickup", "delivery"] as PickupType[]).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setForm((p) => ({ ...p, pickupType: type }))}
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all
                              ${form.pickupType === type
                                ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                                : "bg-white text-gray-600 border-gray-200 hover:border-primary/40"
                              }`}
                          >
                            {type === "pickup" ? <Navigation className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                            {type === "pickup" ? "Self Pickup" : "Delivery"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Full Name *
                      </label>
                      <input
                        name="customerName"
                        value={form.customerName}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Rahul Verma"
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                      />
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" /> Phone Number *
                      </label>
                      <input
                        name="customerPhone"
                        value={form.customerPhone}
                        onChange={handleChange}
                        required
                        type="tel"
                        placeholder="+91 98765 43210"
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                      />
                    </div>

                    {/* Servings */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" /> No. of Servings *
                      </label>
                      <input
                        name="servings"
                        value={form.servings}
                        onChange={handleChange}
                        required
                        type="number"
                        min={1}
                        max={listing.quantity_servings}
                        placeholder={`1 – ${listing.quantity_servings}`}
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                      />
                    </div>

                    {/* Delivery address — only if delivery */}
                    {form.pickupType === "delivery" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-col gap-1.5"
                      >
                        <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                          <Home className="w-3.5 h-3.5" /> Delivery Address *
                        </label>
                        <textarea
                          name="deliveryAddress"
                          value={form.deliveryAddress}
                          onChange={handleChange}
                          rows={2}
                          placeholder="Flat no., street, area, city, pincode"
                          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition resize-none"
                        />
                      </motion.div>
                    )}

                    {/* Payment method */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5" /> Payment Method
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: "cod", label: "Cash on Pickup" },
                          { value: "upi", label: "UPI" },
                          { value: "card", label: "Card" },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setForm((p) => ({ ...p, paymentMethod: opt.value }))}
                            className={`py-2 rounded-xl text-xs font-semibold border transition-all
                              ${form.paymentMethod === opt.value
                                ? "bg-primary/10 text-primary border-primary/30"
                                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                              }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" /> Special Instructions{" "}
                        <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <textarea
                        name="specialInstructions"
                        value={form.specialInstructions}
                        onChange={handleChange}
                        rows={2}
                        placeholder="Allergies, preferences, timing notes..."
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition resize-none"
                      />
                    </div>

                    {error && (
                      <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{error}</p>
                    )}

                    {/* Order summary chip */}
                    {form.servings && (
                      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">{hotelDisplay}</p>
                          <p className="text-sm font-bold text-gray-800">
                            {form.servings} × {listing.food_type}
                          </p>
                        </div>
                        <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full capitalize">
                          {form.pickupType}
                        </span>
                      </div>
                    )}

                    {/* Submit */}
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 rounded-2xl bg-primary text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-60 transition-colors shadow-lg shadow-primary/20 mt-1"
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Placing Order...
                        </span>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          Confirm Order
                        </>
                      )}
                    </motion.button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OrderFoodModal;