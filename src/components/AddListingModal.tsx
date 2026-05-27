import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Utensils, MapPin, Building2, Hash, AlignLeft,
  ChefHat, ImagePlus, Trash2, Phone, User, FileText,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { geocodeAddress } from "@/utils/geocode";

interface PrefillHotel {
  hotel_name: string;
  contact_name: string;
  contact_phone: string;
  pickup_address: string;
  pickup_city: string;
}

interface AddListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newListing: Record<string, unknown>) => void;
  prefillHotel?: PrefillHotel;
  hotelId?: string;
}

interface FormState {
  title: string;
  description: string;
  food_type: string;
  cuisine: string;
  quantity_servings: string;
  pickup_address: string;
  pickup_city: string;
  hotel_name: string;
  contact_name: string;
  contact_phone: string;
  additional_notes: string;
  image_url: string;
}

const S: Record<string, React.CSSProperties> = {
  backdrop: {
    position: "fixed", inset: 0,
    background: "rgba(10,8,5,0.72)", backdropFilter: "blur(6px)",
    zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
    padding: "16px", fontFamily: "'DM Sans', sans-serif",
  },
  card: {
    background: "#faf8f4", borderRadius: "20px",
    width: "100%", maxWidth: "500px", maxHeight: "92vh",
    overflowY: "auto", position: "relative",
    boxShadow: "0 32px 80px rgba(0,0,0,0.28)", scrollbarWidth: "none" as const,
  },
  header: {
    padding: "24px 24px 0", position: "sticky", top: 0,
    background: "#faf8f4", zIndex: 2, paddingBottom: "4px",
  },
  pill: {
    display: "inline-block", background: "#2d5a27", color: "#fff",
    fontSize: "10px", fontWeight: 600, letterSpacing: "1.5px",
    textTransform: "uppercase", padding: "3px 10px",
    borderRadius: "20px", marginBottom: "8px",
  },
  title: {
    fontFamily: "'Playfair Display', serif", fontSize: "22px",
    fontWeight: 700, color: "#1a1a0f", lineHeight: 1.2, margin: "0 0 3px",
  },
  subtitle: { fontSize: "13px", color: "#8a8070", margin: "0 0 16px", fontWeight: 400 },
  divider: {
    height: "1px",
    background: "linear-gradient(90deg,#e8e0d0 0%,transparent 100%)",
    margin: "0 -24px",
  },
  closeBtn: {
    position: "absolute", top: "16px", right: "16px",
    width: "30px", height: "30px", background: "#eee8dc",
    border: "none", borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", color: "#6b6050",
  },
  body: { padding: "16px 24px 24px", display: "flex", flexDirection: "column", gap: "13px" },
  sectionTag: {
    fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px",
    textTransform: "uppercase", color: "#b09878", marginBottom: "-4px",
  },
  group: { display: "flex", flexDirection: "column", gap: "5px" },
  label: { fontSize: "12.5px", fontWeight: 600, color: "#3d3020" },
  req: { color: "#c84b2f" },
  wrap: {
    display: "flex", alignItems: "center", background: "#fff",
    border: "1.5px solid #e0d8c8", borderRadius: "11px", overflow: "hidden",
  },
  icon: { color: "#b09878", marginLeft: "12px", flexShrink: 0 },
  input: {
    flex: 1, border: "none", outline: "none", background: "transparent",
    fontFamily: "'DM Sans', sans-serif", fontSize: "14px",
    color: "#1a1a0f", padding: "11px 12px", width: "100%",
  },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "11px" },
  chipRow: { display: "flex", flexWrap: "wrap" as const, gap: "7px" },
  box: {
    background: "linear-gradient(135deg,#f0ede6,#e8e2d8)",
    borderRadius: "13px", padding: "14px",
    display: "flex", flexDirection: "column", gap: "11px",
    border: "1px solid #ddd5c5",
  },
  boxHeader: { display: "flex", alignItems: "center", gap: "8px" },
  boxIcon: {
    width: "26px", height: "26px", background: "#2d5a27",
    borderRadius: "7px", display: "flex", alignItems: "center",
    justifyContent: "center", flexShrink: 0,
  },
  boxLabel: {
    fontSize: "11px", fontWeight: 700, letterSpacing: "1.2px",
    textTransform: "uppercase", color: "#5a4a30",
  },
  error: {
    fontSize: "12.5px", color: "#c84b2f",
    background: "#fff0ed", border: "1px solid #f5c5bb",
    borderRadius: "9px", padding: "9px 13px",
  },
  submitBtn: {
    width: "100%", padding: "14px",
    background: "linear-gradient(135deg,#2d5a27 0%,#3d7a35 100%)",
    color: "#fff", border: "none", borderRadius: "13px",
    fontFamily: "'DM Sans', sans-serif", fontSize: "15px", fontWeight: 600,
    cursor: "pointer", display: "flex", alignItems: "center",
    justifyContent: "center", gap: "8px",
    boxShadow: "0 4px 20px rgba(45,90,39,0.35)",
    marginTop: "4px",
  },
};

const FOOD_TYPES = ["Vegetarian", "Non-Vegetarian", "Vegan", "Jain", "Mixed"];

const Field = ({
  label, icon: Icon, required, textarea, rows = 2, ...props
}: {
  label: string; icon: React.ElementType; required?: boolean;
  textarea?: boolean; rows?: number;
  [k: string]: unknown;
}) => (
  <div style={S.group}>
    <label style={S.label}>{label} {required && <span style={S.req}>*</span>}</label>
    <div style={{ ...S.wrap, alignItems: textarea ? "flex-start" : "center" }}>
      <Icon size={14} style={{ ...S.icon, ...(textarea ? { marginTop: "13px" } : {}) }} />
      {textarea
        ? <textarea style={{ ...S.input, minHeight: `${rows * 36}px`, resize: "none", lineHeight: "1.5" }} {...(props as object)} />
        : <input style={S.input} {...(props as object)} />}
    </div>
  </div>
);

const BLANK: FormState = {
  title: "", description: "", food_type: "Vegetarian", cuisine: "",
  quantity_servings: "", pickup_address: "", pickup_city: "", hotel_name: "",
  contact_name: "", contact_phone: "", additional_notes: "", image_url: "",
};

export default function AddListingModal({ isOpen, onClose, onSuccess, prefillHotel, hotelId }: AddListingModalProps) {
  const [form, setForm] = useState<FormState>(BLANK);

  useEffect(() => {
    if (isOpen && prefillHotel) {
      setForm(prev => ({
        ...prev,
        hotel_name: prefillHotel.hotel_name,
        contact_name: prefillHotel.contact_name || prev.contact_name,
        contact_phone: prefillHotel.contact_phone || prev.contact_phone,
        pickup_address: prefillHotel.pickup_address || prev.pickup_address,
        pickup_city: prefillHotel.pickup_city || prev.pickup_city,
      }));
    }
    if (!isOpen) {
      setForm(BLANK);
    }
  }, [isOpen]);

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }));

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setImageFile(file);
    const r = new FileReader();
    r.onload = e => setForm(p => ({ ...p, image_url: e.target?.result as string }));
    r.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setForm(p => ({ ...p, image_url: "" }));
    setImageFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const isRequired =
    !form.title.trim() ||
    !form.quantity_servings.trim() ||
    !form.food_type ||
    !form.pickup_address.trim() ||
    !form.pickup_city.trim();

  const handleSubmit = async () => {
    if (isRequired) return;
    setSubmitting(true);
    setError(null);

    console.log("hotelId being inserted:", hotelId);

    const coords = await geocodeAddress(form.pickup_address.trim(), form.pickup_city.trim());

    let publicImageUrl: string | null = null;

    if (imageFile) {
      const ext = imageFile.name.split(".").pop() ?? "jpg";
      const fileName = `listing-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("food-images")
        .upload(fileName, imageFile, { upsert: false });

      if (uploadError) {
        setError("Image upload failed: " + uploadError.message);
        setSubmitting(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("food-images")
        .getPublicUrl(fileName);

      publicImageUrl = urlData.publicUrl;
    }

    const servings = parseInt(form.quantity_servings, 10);
    const safeServings = isNaN(servings) ? null : servings;

    const { data, error: sbError } = await supabase
      .from("food_listings")
      .insert([{
        hotel_id:          hotelId ?? null,
        title:             form.title.trim(),
        description:       form.description.trim() || null,
        food_type:         form.food_type,
        cuisine:           form.cuisine.trim() || null,
        quantity_servings: safeServings,
        pickup_address:    form.pickup_address.trim(),
        pickup_city:       form.pickup_city.trim(),
        latitude:          coords?.latitude ?? null,
        longitude:         coords?.longitude ?? null,
        image_url:         publicImageUrl,
        status:            "available",
        hotel_name:        form.hotel_name.trim() || null,
        contact_name:      form.contact_name.trim() || null,
        contact_phone:     form.contact_phone.trim() || null,
        additional_notes:  form.additional_notes.trim() || null,
      }])
      .select()
      .single();

    setSubmitting(false);

    if (sbError) {
      console.error("Supabase insert error:", sbError);
      setError(`Error ${sbError.code}: ${sbError.message}`);
      return;
    }

    setDone(true);
    setTimeout(() => {
      setDone(false);
      onSuccess(data);
      setForm(BLANK);
      setImageFile(null);
    }, 1500);
  };

  const locked = (key: keyof PrefillHotel) => !!prefillHotel?.[key];
  const lockedStyle = (key: keyof PrefillHotel): React.CSSProperties =>
    locked(key) ? { background: "#f4f4f0", color: "#888" } : {};

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        .chip{padding:6px 12px;border-radius:20px;border:1.5px solid #e0d8c8;background:#fff;font-size:12.5px;font-weight:500;color:#6b6050;cursor:pointer;transition:all .15s;font-family:'DM Sans',sans-serif}
        .chip:hover{border-color:#2d5a27;color:#2d5a27}
        .chip.on{background:#2d5a27;color:#fff;border-color:#2d5a27;font-weight:600}
        .sbtn:hover:not(:disabled){opacity:.9;transform:translateY(-1px)}
        .sbtn:disabled{opacity:.5;cursor:not-allowed}
        .spin{width:15px;height:15px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:sp .7s linear infinite}
        @keyframes sp{to{transform:rotate(360deg)}}
        .upzone{border:2px dashed #d0c8b8;border-radius:13px;background:#fff;cursor:pointer;transition:border-color .2s,background .2s}
        .upzone:hover,.upzone.drag{border-color:#2d5a27;background:#f4faf3}
        .rmbtn:hover{background:#c84b2f!important;color:#fff!important}
      `}</style>

      <AnimatePresence>
        {isOpen && (
          <motion.div style={S.backdrop}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && onClose()}
          >
            <motion.div style={S.card}
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            >
              <div style={S.header}>
                <button style={S.closeBtn} onClick={onClose}><X size={13} /></button>
                <div style={S.pill}>New Listing</div>
                <h2 style={S.title}>Share Surplus Food</h2>
                <p style={S.subtitle}>Help reduce food waste — every meal matters.</p>
                <div style={S.divider} />
              </div>

              <div style={S.body}>

                {/* Photo */}
                <p style={S.sectionTag}>Food Photo</p>
                {form.image_url ? (
                  <div style={{ position: "relative", borderRadius: "13px", overflow: "hidden", height: "175px" }}>
                    <img src={form.image_url} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.5) 0%,transparent 50%)" }} />
                    <button className="rmbtn" onClick={handleRemoveImage}
                      style={{ position: "absolute", bottom: "10px", right: "10px", display: "flex", alignItems: "center", gap: "5px", background: "rgba(255,255,255,.18)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,.3)", borderRadius: "8px", color: "#fff", fontSize: "12px", fontWeight: 600, padding: "6px 11px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "background .2s" }}>
                      <Trash2 size={12} /> Remove
                    </button>
                    <div style={{ position: "absolute", top: "10px", left: "10px", background: "rgba(45,90,39,.85)", borderRadius: "6px", color: "#fff", fontSize: "11px", fontWeight: 600, padding: "3px 9px" }}>✓ Photo added</div>
                  </div>
                ) : (
                  <div className={`upzone${dragOver ? " drag" : ""}`}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
                    onClick={() => fileRef.current?.click()}
                    style={{ padding: "26px 16px", textAlign: "center" }}
                  >
                    <div style={{ width: "42px", height: "42px", background: "linear-gradient(135deg,#e8f5e4,#d4edce)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                      <ImagePlus size={19} color="#2d5a27" />
                    </div>
                    <p style={{ margin: 0, fontSize: "13.5px", fontWeight: 600, color: "#3d3020" }}>Upload a food photo</p>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#a09080" }}>Drag & drop or <span style={{ color: "#2d5a27", fontWeight: 600 }}>browse</span> · JPG, PNG, WEBP</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

                {/* Food Details */}
                <p style={S.sectionTag}>Food Details</p>
                <Field label="Listing Title" icon={Utensils} required placeholder="e.g. Biryani & Dal Makhani" value={form.title} onChange={set("title")} />
                <div style={S.row2}>
                  <Field label="Servings" icon={Hash} required type="number" min="1" placeholder="e.g. 40" value={form.quantity_servings} onChange={set("quantity_servings")} />
                </div>
                <Field label="Cuisine" icon={ChefHat} placeholder="e.g. North Indian" value={form.cuisine} onChange={set("cuisine")} />

                <div style={S.group}>
                  <label style={S.label}>Food Type <span style={S.req}>*</span></label>
                  <div style={S.chipRow}>
                    {FOOD_TYPES.map(t => (
                      <button key={t} className={`chip${form.food_type === t ? " on" : ""}`}
                        onClick={() => setForm(p => ({ ...p, food_type: t }))}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <Field label="Description" icon={AlignLeft} textarea rows={2}
                  placeholder="Brief description of the food items..."
                  value={form.description} onChange={set("description")} />

                {/* Pickup */}
                <div style={S.box}>
                  <div style={S.boxHeader}>
                    <div style={S.boxIcon}><MapPin size={13} color="#fff" /></div>
                    <span style={S.boxLabel}>Pickup Location</span>
                  </div>
                  <Field
                    label="Pickup Address" icon={MapPin} required
                    placeholder="Street / Area"
                    value={form.pickup_address}
                    onChange={set("pickup_address")}
                    readOnly={locked("pickup_address")}
                    style={lockedStyle("pickup_address")}
                  />
                  <Field
                    label="City" icon={MapPin} required
                    placeholder="e.g. Mumbai"
                    value={form.pickup_city}
                    onChange={set("pickup_city")}
                    readOnly={locked("pickup_city")}
                    style={lockedStyle("pickup_city")}
                  />
                </div>

                {/* Hotel / Contact */}
                <div style={S.box}>
                  <div style={S.boxHeader}>
                    <div style={S.boxIcon}><Building2 size={13} color="#fff" /></div>
                    <span style={S.boxLabel}>Hotel / Contact</span>
                  </div>
                  <Field
                    label="Hotel / Restaurant Name" icon={ChefHat}
                    placeholder="e.g. Spice Garden Hotel"
                    value={form.hotel_name}
                    onChange={set("hotel_name")}
                    readOnly={locked("hotel_name")}
                    style={lockedStyle("hotel_name")}
                  />
                  <div style={S.row2}>
                    <Field
                      label="Contact Name" icon={User}
                      placeholder="e.g. Rahul"
                      value={form.contact_name}
                      onChange={set("contact_name")}
                      readOnly={locked("contact_name")}
                      style={lockedStyle("contact_name")}
                    />
                    <Field
                      label="Contact Phone" icon={Phone} type="tel"
                      placeholder="e.g. 9876543210"
                      value={form.contact_phone}
                      onChange={set("contact_phone")}
                      readOnly={locked("contact_phone")}
                      style={lockedStyle("contact_phone")}
                    />
                  </div>
                  <Field label="Additional Notes" icon={FileText} textarea rows={2}
                    placeholder="Any instructions for pickup…"
                    value={form.additional_notes} onChange={set("additional_notes")} />
                </div>

                {error && <div style={S.error}>⚠ {error}</div>}

                <motion.button className="sbtn"
                  style={{ ...S.submitBtn, ...(done ? { background: "linear-gradient(135deg,#3d7a35,#57a34a)" } : {}) }}
                  onClick={handleSubmit}
                  disabled={submitting || done || isRequired}
                  whileTap={{ scale: 0.98 }}
                >
                  {submitting
                    ? <><div className="spin" /> Saving…</>
                    : done
                      ? <><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg> Listed successfully!</>
                      : <><Utensils size={15} /> Add Food Listing</>}
                </motion.button>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}