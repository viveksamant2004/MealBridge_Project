// src/components/ClaimDonationModal.tsx
import { useState } from "react";
import { X, Heart, User, Phone, Mail, Building2, MessageSquare, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Donation } from "@/integrations/supabase/donationTypes";

interface ClaimDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  donation: Donation | null;
}

export default function ClaimDonationModal({ isOpen, onClose, donation }: ClaimDonationModalProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    ngo_name: "",
    contact_person: "",
    phone: "",
    email: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const validate = (): string | null => {
    if (!form.ngo_name.trim()) return "Please enter your NGO/Organization name.";
    if (!form.contact_person.trim()) return "Please enter the contact person's name.";
    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ""))) return "Please enter a valid 10-digit phone number.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Please enter a valid email address.";
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    if (!donation) return;

    setLoading(true);
    setError(null);

    try {
      const { error: dbError } = await supabase.from("donation_claims").insert({
        donation_id: donation.id,
        ngo_name: form.ngo_name.trim(),
        contact_person: form.contact_person.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        message: form.message.trim() || null,
        status: "pending",
      });

      if (dbError) throw dbError;
      setStep("success");
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("form");
    setError(null);
    setForm({ ngo_name: "", contact_person: "", phone: "", email: "", message: "" });
    onClose();
  };

  if (!isOpen || !donation) return null;

  // Format pickup time nicely
  const pickupLabel = new Date(donation.pickup_time).toLocaleString("en-IN", {
    dateStyle: "medium", timeStyle: "short",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-green-50 to-teal-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Apply for Donation</h2>
              <p className="text-sm text-gray-500">{donation.food_name}</p>
            </div>
          </div>
          <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Donation summary strip */}
        {step === "form" && (
          <div className="px-6 pt-4">
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm flex flex-wrap gap-3 text-gray-700">
              <span>🍽️ <strong>{donation.food_type}</strong></span>
              <span>👥 {donation.quantity_servings} servings</span>
              <span>📅 Pickup: {pickupLabel}</span>
              {donation.notes && <span className="w-full text-gray-500 italic">"{donation.notes}"</span>}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {step === "success" ? (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Application Sent!</h3>
                <p className="text-gray-500 text-sm">
                  Your request has been submitted. The hotel will contact you at the details you provided.
                </p>
              </div>
              <button onClick={handleClose} className="px-6 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors">
                Done
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <Field label="NGO / Organization Name" required icon={<Building2 className="w-4 h-4" />}>
                <input name="ngo_name" value={form.ngo_name} onChange={handleChange} placeholder="e.g. Hunger Relief Foundation" className={inputCls} />
              </Field>

              <Field label="Contact Person" required icon={<User className="w-4 h-4" />}>
                <input name="contact_person" value={form.contact_person} onChange={handleChange} placeholder="Your full name" className={inputCls} />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Phone" required icon={<Phone className="w-4 h-4" />}>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" type="tel" className={inputCls} />
                </Field>
                <Field label="Email" required icon={<Mail className="w-4 h-4" />}>
                  <input name="email" value={form.email} onChange={handleChange} placeholder="ngo@example.com" type="email" className={inputCls} />
                </Field>
              </div>

              <Field label="Message (Optional)" icon={<MessageSquare className="w-4 h-4" />}>
                <textarea
                  name="message" value={form.message} onChange={handleChange}
                  placeholder="Tell the donor about your organization and how the food will be used..."
                  rows={3} className={`${inputCls} resize-none`}
                />
              </Field>

              {error && (
                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {step === "form" && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3 justify-end">
            <button onClick={handleClose} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSubmit} disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</> : "Apply for This Donation"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, required, icon, children }: { label: string; required?: boolean; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
        {icon && <span className="text-green-500">{icon}</span>}
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition bg-white";