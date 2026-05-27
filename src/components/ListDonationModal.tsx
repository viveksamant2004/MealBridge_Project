import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, HandHeart, Hotel, Phone, User, MapPin,
  MessageSquare, CheckCircle2, ChevronDown, UtensilsCrossed, ImagePlus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const FOOD_TYPES = [
  "Biryani & Rice Dishes", "Bread & Roti", "Curry & Gravies",
  "Continental Buffet", "Pasta & Salads", "Snacks & Starters",
  "Sweets & Desserts", "South Indian", "Chinese", "Mixed Veg",
  "Non-Veg Platter", "Beverages", "Other",
];

interface ListDonationModalProps {
  open: boolean;
  onClose: () => void;
}

const ListDonationModal = ({ open, onClose }: ListDonationModalProps) => {
  const [form, setForm] = useState({
    hotelName: "", contactName: "", contactPhone: "",
    foodType: "", foodDescription: "", pickupAddress: "",
    pickupCity: "", additionalNotes: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.foodType) { setError("Please select a food type."); return; }
    setSubmitting(true);
    setError(null);

    try {
      let image_url: string | null = null;

      // Upload image if provided
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const fileName = `listing-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("food-images")
          .upload(fileName, imageFile, { upsert: true });

        if (uploadError) throw new Error("Image upload failed: " + uploadError.message);

        const { data: urlData } = supabase.storage
          .from("food-images")
          .getPublicUrl(fileName);
        image_url = urlData.publicUrl;
      }

      const { error: insertError } = await supabase.from("food_listings").insert({
        title: form.foodDescription || form.foodType,
        cuisine: null,
        hotel_name: form.hotelName,
        contact_name: form.contactName,
        contact_phone: form.contactPhone,
        food_type: form.foodType,
        description: form.foodDescription || null,
        additional_notes: form.additionalNotes || null,
        quantity_servings: 0,
        pickup_address: form.pickupAddress,
        pickup_city: form.pickupCity,
        status: "available",
        image_url,
        is_donation: true,
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
    setImageFile(null);
    setImagePreview(null);
    setForm({
      hotelName: "", contactName: "", contactPhone: "",
      foodType: "", foodDescription: "", pickupAddress: "",
      pickupCity: "", additionalNotes: "",
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="list-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            key="list-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pb-24"
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto pb-6">

              {success ? (
                <div className="p-10 flex flex-col items-center text-center gap-4">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-2xl text-gray-900 mb-2">Listing Submitted!</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Thank you, <span className="font-semibold text-gray-700">{form.contactName}</span>! Your donation listing from{" "}
                      <span className="font-semibold text-gray-700">{form.hotelName}</span>{" "}
                      has been submitted. NGOs nearby will be notified. Listing auto-expires in 24 hours.
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="mt-2 px-8 py-3 bg-emerald-600 text-white rounded-2xl font-semibold text-sm hover:bg-emerald-700 transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-100 bg-gradient-to-br from-emerald-50 to-white">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                          <HandHeart className="w-4 h-4 text-emerald-600" />
                        </div>
                        <h2 className="font-bold text-xl text-gray-900">List a Food Donation</h2>
                      </div>
                      <p className="text-xs text-gray-500 ml-10">Auto-expires in 24 hours</p>
                    </div>
                    <button
                      onClick={handleClose}
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">

                    {/* Food Type */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                        <UtensilsCrossed className="w-3.5 h-3.5" /> Type of Food *
                      </label>
                      <div className="relative">
                        <select
                          name="foodType" value={form.foodType} onChange={handleChange} required
                          className="w-full appearance-none border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition pr-10"
                        >
                          <option value="" disabled>Select food type…</option>
                          {FOOD_TYPES.map((ft) => <option key={ft} value={ft}>{ft}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Food Description */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" /> Food Name / Description *
                      </label>
                      <input
                        name="foodDescription" value={form.foodDescription} onChange={handleChange} required
                        placeholder="e.g. Chicken Biryani, Assorted Breads, Dal & Rice"
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                      />
                    </div>

                    {/* Image Upload — NEW */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                        <ImagePlus className="w-3.5 h-3.5" /> Food Image{" "}
                        <span className="text-gray-400 font-normal">(optional, max 5MB)</span>
                      </label>
                      <label className="cursor-pointer">
                        <div className={`border-2 border-dashed rounded-xl transition-colors flex flex-col items-center justify-center gap-2 overflow-hidden
                          ${imagePreview ? "border-emerald-300 p-0" : "border-gray-200 hover:border-emerald-400 p-6"}`}>
                          {imagePreview ? (
                            <div className="relative w-full">
                              <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-xl" />
                              <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); setImageFile(null); setImagePreview(null); }}
                                className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <ImagePlus className="w-8 h-8 text-gray-300" />
                              <p className="text-xs text-gray-400 text-center">
                                Click to upload a photo of the food<br />
                                <span className="text-emerald-500 font-medium">JPG, PNG, WEBP</span>
                              </p>
                            </>
                          )}
                        </div>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                    </div>

                    {/* Hotel Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                        <Hotel className="w-3.5 h-3.5" /> Hotel / Restaurant Name *
                      </label>
                      <input
                        name="hotelName" value={form.hotelName} onChange={handleChange} required
                        placeholder="e.g. Spice Garden Hotel, Bella Italia"
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                      />
                    </div>

                    {/* Contact Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Contact Person Name *
                      </label>
                      <input
                        name="contactName" value={form.contactName} onChange={handleChange} required
                        placeholder="e.g. Rahul Sharma"
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                      />
                    </div>

                    {/* Contact Phone */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" /> Contact Phone *
                      </label>
                      <input
                        name="contactPhone" value={form.contactPhone} onChange={handleChange} required type="tel"
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                      />
                    </div>

                    {/* Pickup Address */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> Pickup Address *
                      </label>
                      <input
                        name="pickupAddress" value={form.pickupAddress} onChange={handleChange} required
                        placeholder="Street / area / landmark"
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                      />
                    </div>

                    {/* City */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> City *
                      </label>
                      <input
                        name="pickupCity" value={form.pickupCity} onChange={handleChange} required
                        placeholder="e.g. Bangalore, Delhi, Mumbai"
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                      />
                    </div>

                    {/* Additional Notes */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" /> Additional Notes{" "}
                        <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <textarea
                        name="additionalNotes" value={form.additionalNotes} onChange={handleChange} rows={2}
                        placeholder="e.g. Freshly prepared. Packed in containers. Ask for reception on arrival."
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition resize-none"
                      />
                    </div>

                    {/* Auto-expire notice */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2">
                      <span className="text-amber-500 text-sm mt-0.5">⏰</span>
                      <p className="text-xs text-amber-700 leading-relaxed">
                        <span className="font-bold">Auto-expires in 24 hours.</span> Listing is removed automatically to ensure only fresh food is shown.
                      </p>
                    </div>

                    {error && (
                      <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{error}</p>
                    )}

                    <div className="flex gap-3 mt-1">
                      <button
                        type="button" onClick={handleClose}
                        className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <motion.button
                        whileTap={{ scale: 0.98 }} type="submit" disabled={submitting}
                        className="flex-[2] py-3 rounded-2xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-60 transition-colors shadow-lg shadow-emerald-200"
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
                          <><HandHeart className="w-4 h-4" /> Submit Donation Listing</>
                        )}
                      </motion.button>
                    </div>
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

export default ListDonationModal;