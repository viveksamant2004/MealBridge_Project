import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Hotels = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    hotel_name: "",
    owner_name: "",
    email: "",
    phone: "",
    hotel_address: "",
    city: "",
    state: "",
    pincode: "",
    pickup_available: false,
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("hotel_registrations")
      .insert([{ ...formData, user_id: user?.id }]);

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">You're registered!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Welcome to MealBridge. We'll connect you with verified NGOs near you shortly.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-colors duration-150"
          >
            Register another restaurant
          </button>
          <button
  onClick={() => navigate("/")}
  className="w-full border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold py-3 rounded-xl transition-colors duration-150"
>
  Return to Home
</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 px-8 py-8">
            <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full mb-4">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              For Hotels &amp; Restaurants
            </span>
            <h1 className="text-3xl font-bold text-white mb-1">Register Your Hotel</h1>
            <p className="text-emerald-100 text-sm">
              Join 340+ hotels already rescuing food with MealBridge
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-7">

            {/* Hotel Info */}
            <section>
              <SectionLabel icon={<BuildingIcon />} text="Hotel information" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                <Field label="Hotel name">
                  <input
                    name="hotel_name"
                    placeholder="e.g. The Grand Palace"
                    value={formData.hotel_name}
                    onChange={handleChange}
                    required
                  />
                </Field>
                <Field label="Owner name">
                  <input
                    name="owner_name"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.owner_name}
                    onChange={handleChange}
                    required
                  />
                </Field>
              </div>
            </section>

            <Divider />

            {/* Contact */}
            <section>
              <SectionLabel icon={<ContactIcon />} text="Contact details" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                <Field label="Email address">
                  <input
                    type="email"
                    name="email"
                    placeholder="hello@hotel.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Field>
                <Field label="Phone number">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </Field>
              </div>
            </section>

            <Divider />

            {/* Location */}
            <section>
              <SectionLabel icon={<LocationIcon />} text="Location" />
              <div className="mt-3 space-y-4">
                <Field label="Hotel address">
                  <textarea
                    name="hotel_address"
                    placeholder="Street address, building name..."
                    value={formData.hotel_address}
                    onChange={handleChange}
                    rows={2}
                  />
                </Field>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <Field label="City">
                    <input
                      name="city"
                      placeholder="Enter city"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </Field>
                  <Field label="State">
                    <input
                      name="state"
                      placeholder="Enter state"
                      value={formData.state}
                      onChange={handleChange}
                    />
                  </Field>
                  <Field label="Pincode">
                    <input
                      name="pincode"
                      placeholder="Enter pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                    />
                  </Field>
                </div>
              </div>
            </section>

            <Divider />

            {/* Donation */}
            <section>
              <SectionLabel icon={<FoodIcon />} text="Donation details" />
              <div className="mt-3 space-y-4">
                <Field label="Food description">
                  <textarea
                    name="description"
                    placeholder="Tell us about your typical surplus food — type, quantity, frequency..."
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                  />
                </Field>

                {/* Pickup checkbox */}
                <label className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 cursor-pointer group hover:bg-emerald-100 transition-colors duration-150">
                  <div className="mt-0.5">
                    <input
                      type="checkbox"
                      name="pickup_available"
                      checked={formData.pickup_available}
                      onChange={handleChange}
                      className="w-4 h-4 accent-emerald-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">Pickup available</p>
                    <p className="text-xs text-emerald-600 mt-0.5">
                      NGOs can come collect food directly from your location
                    </p>
                  </div>
                </label>
              </div>
            </section>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors duration-150 text-base mt-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Registering...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                  </svg>
                  Register Hotel
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>

            {/* Trust strip */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-4 border-t border-gray-100">
              <TrustItem text="Verified NGOs only" />
              <TrustItem text="CSR certificate" />
              <TrustItem text="60-second listing" />
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

// ─── Small helper components ───────────────────────────────────────────────

const inputClass =
  "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:bg-white transition-colors duration-150 resize-none";

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactElement;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
      {label}
    </label>
    {/* Inject className into the child input/textarea */}
    {React.cloneElement(children, {
      className: `${inputClass} ${children.props.className ?? ""}`.trim(),
    })}
  </div>
);

const SectionLabel = ({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) => (
  <div className="flex items-center gap-2 text-emerald-600">
    <span className="w-4 h-4">{icon}</span>
    <span className="text-xs font-bold uppercase tracking-widest">{text}</span>
  </div>
);

const Divider = () => <hr className="border-gray-100" />;

const TrustItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-1.5 text-xs text-gray-400">
    <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
    {text}
  </div>
);

// Inline SVG icons (no external dep needed)
const BuildingIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const ContactIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LocationIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const FoodIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

export default Hotels;