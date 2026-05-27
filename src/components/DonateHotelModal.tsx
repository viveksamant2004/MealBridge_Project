import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, HandHeart, MapPin,Mail, Users, Phone, User, MessageSquare, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FoodListing {
  id: string;
  donation_id?: string;
  title: string;
  hotel_name?: string | null;
  hotel_id?: string | null;
  food_type: string;
  quantity_servings: number;
  pickup_address: string;
  pickup_city: string;
  image_url?: string | null;
}

interface DonateHotelModalProps {
  listing: FoodListing | null;
  open: boolean;
  onClose: () => void;
}

const DonateHotelModal = ({ listing, open, onClose }: DonateHotelModalProps) => {
  const [form, setForm] = useState({
    donorName: "",
    donorPhone: "",
    donorEmail: "", 
    donorOrg: "",
    servings: "",
    pickupAddress: "", 
    specialNotes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

    const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!listing) return;

    if (!listing.hotel_id) {
    setError("This listing is missing a hotel ID. Please contact support.");
    return;
  }
  
  if (!form.pickupAddress.trim()) {
    setError("Please provide a pickup address.");
    return;
  }

  setSubmitting(true);
  setError(null);

  try {
    const { data: donationData, error: donationError } = await supabase
      .from("donations")
      .insert({
        food_type: listing.food_type,
        food_name: listing.title,
        quantity_servings: listing.quantity_servings,
        status: "available",
        hotel_id: listing.hotel_id,
      })
      .select("id")
      .single();

    if (donationError) throw donationError;

    const { error: claimError } = await supabase
      .from("donation_claims")
      .insert({
        donation_id: donationData.id,
        donor_name: form.donorName,
        phone: form.donorPhone,
        email: form.donorEmail,
        ngo_name: form.donorOrg || null,
        servings_claimed: parseInt(form.servings),
        pickup_address: form.pickupAddress,
        message: form.specialNotes || null,
        claim_type: "donate",
        claimed_at: new Date().toISOString(),
        status: "pending",
      });

    if (claimError) throw claimError;

    setSuccess(true);

    setTimeout(() => {
      window.location.href = "/donation-orders";
    }, 1500);

  } catch (err: any) {
    setError(err.message || "Something went wrong. Please try again.");
  } finally {
    setSubmitting(false);
  }
};

  const handleClose = () => {
    setSuccess(false);
    setError(null);
    setForm({ donorName: "", donorPhone: "", donorEmail: "",  donorOrg: "", servings: "", pickupAddress: "", specialNotes: "" });
    onClose();
  };

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
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pb-24"
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">

              {success ? (
                <div className="p-10 flex flex-col items-center text-center gap-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-2xl text-gray-900 mb-2">Donation Claimed!</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Thank you, <span className="font-semibold text-gray-700">{form.donorName}</span>. 
                      Your donation claim has been confirmed.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 w-full mt-2">
                    <button
                      onClick={() => window.location.href = "/donation-orders"}
                      className="w-full px-8 py-3 bg-emerald-600 text-white rounded-2xl 
                                 font-semibold text-sm hover:bg-emerald-700 transition-colors"
                    >
                      📋 View Donation Orders →
                    </button>
                    <button
                      onClick={handleClose}
                      className="w-full px-8 py-3 border border-gray-200 text-gray-500 
                                 rounded-2xl font-semibold text-sm hover:bg-gray-50 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Header */}
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
                        <span className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <HandHeart className="w-3 h-3" /> Donate
                        </span>
                      </div>
                      <h2 className="text-white font-bold text-lg leading-tight">{listing.title}</h2>
                    </div>
                  </div>

                  {/* Listing meta */}
                  <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-100 flex flex-wrap gap-4">
                    <div className="flex items-center gap-1.5 text-emerald-700 text-xs">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{listing.pickup_address}, {listing.pickup_city}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-700 text-xs">
                      <Users className="w-3.5 h-3.5" />
                      <span>{listing.quantity_servings} servings available</span>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="p-5 pb-12 flex flex-col gap-4">
                    <h3 className="font-bold text-gray-900 text-base">Your Donation Details</h3>

                    {/* Donor Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Full Name *
                      </label>
                      <input
                        name="donorName"
                        value={form.donorName}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Priya Sharma"
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                      />
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" /> Phone Number *
                      </label>
                      <input
                        name="donorPhone"
                        value={form.donorPhone}
                        onChange={handleChange}
                        required
                        type="tel"
                        placeholder=""
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                      />
                    </div>

                    {/* No. of Servings */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" /> No. of Servings to Claim *
                      </label>
                      <input
                        name="servings"
                        value={form.servings}
                        onChange={handleChange}
                        required
                        type="number"
                        min={1}
                        max={listing.quantity_servings > 0 ? listing.quantity_servings : undefined}
                        placeholder={`Max ${listing.quantity_servings}`}
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" /> Email Address *
                      </label>
                      <input
                        name="donorEmail"
                        value={form.donorEmail}
                        onChange={handleChange}
                        required
                        type="email"
                        placeholder="e.g. priya@example.com"
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                      />
                    </div>

                    {/* Pickup Address */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> Pickup Address *
                      </label>
                      <textarea
                        name="pickupAddress"
                        value={form.pickupAddress}
                        onChange={handleChange}
                        required
                        rows={2}
                        placeholder="Address where food should be picked up from"
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition resize-none"
                      />
                      <p className="text-[10px] text-gray-400 pl-0.5">We'll send someone to collect from this address.</p>
                    </div>

                    {/* Org (optional) */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600">
                        Organisation / NGO <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <input
                        name="donorOrg"
                        value={form.donorOrg}
                        onChange={handleChange}
                        placeholder="e.g. Robin Hood Army, Goonj"
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                      />
                    </div>

                    {/* Notes */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" /> Special Notes <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <textarea
                        name="specialNotes"
                        value={form.specialNotes}
                        onChange={handleChange}
                        rows={2}
                        placeholder="Any specific instructions for pickup..."
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition resize-none"
                      />
                    </div>

                    {error && (
                      <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{error}</p>
                    )}

                    {/* Submit */}
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-60 transition-colors shadow-lg shadow-emerald-200 mt-1"
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Submitting...
                        </span>
                      ) : (
                        <>
                          <HandHeart className="w-4 h-4" />
                          Confirm Donation Claim
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

export default DonateHotelModal;