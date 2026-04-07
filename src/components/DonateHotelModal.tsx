import { useState } from "react";
import { X, Building2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
}

const DonateHotelModal = ({ open, onClose }: Props) => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    hotelName: "",
    foodType: "",
    servings: "",
    pickupTime: "",
    location: "",
    contact: "",
  });

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!form.hotelName || !form.foodType || !form.servings || !form.location) return;
    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    setForm({ hotelName: "", foodType: "", servings: "", pickupTime: "", location: "", contact: "" });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-md p-8 z-10">
        {/* Close */}
        <button onClick={handleClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-foreground">Donate Surplus Food</h2>
                <p className="text-xs text-muted-foreground">List your leftover food for NGOs nearby</p>
              </div>
            </div>

            {/* Form */}
            <div className="flex flex-col gap-4">
              {[
                { label: "Hotel / Venue Name", name: "hotelName", placeholder: "e.g. The Grand Hyatt" },
                { label: "Food Type", name: "foodType", placeholder: "e.g. Biryani, Salads, Desserts" },
                { label: "Number of Servings", name: "servings", placeholder: "e.g. 80" },
                { label: "Pickup Time", name: "pickupTime", placeholder: "e.g. 9:00 PM tonight" },
                { label: "Location / Address", name: "location", placeholder: "e.g. Jubilee Hills, Hyderabad" },
                { label: "Contact Number", name: "contact", placeholder: "e.g. 98765 43210" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                    {field.label}
                  </label>
                  <input
                    name={field.name}
                    value={form[field.name as keyof typeof form]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                  />
                </div>
              ))}
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold rounded-xl py-5"
            >
              Submit Donation Listing
            </Button>
          </>
        ) : (
          /* Success state */
          <div className="flex flex-col items-center text-center py-6 gap-4">
            <CheckCircle2 className="w-16 h-16 text-primary" />
            <h2 className="font-display font-bold text-xl text-foreground">Thank You!</h2>
            <p className="text-muted-foreground text-sm max-w-xs">
              Your food listing has been submitted. Nearby NGOs will be notified instantly.
            </p>
            <Button onClick={handleClose} className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold rounded-xl px-8">
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonateHotelModal;