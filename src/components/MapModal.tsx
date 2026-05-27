import { useEffect, useRef } from "react";
import { X, MapPin } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const greenPin = new L.DivIcon({
  className: "",
  html: `<div style="background:#16a34a;width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -35],
});

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodName: string;
  address: string;
  latitude: number;
  longitude: number;
}

export const MapModal = ({
  isOpen,
  onClose,
  foodName,
  address,
  latitude,
  longitude,
}: MapModalProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (!containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        scrollWheelZoom: false,
        zoomControl: true,
      }).setView([latitude, longitude], 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "\u00a9 OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      const popupContent = document.createElement("div");
      popupContent.style.minWidth = "160px";
      popupContent.style.fontFamily = "sans-serif";

      const nameEl = document.createElement("p");
      nameEl.style.fontWeight = "600";
      nameEl.style.fontSize = "14px";
      nameEl.style.margin = "0 0 4px";
      nameEl.textContent = foodName;

      const addrEl = document.createElement("p");
      addrEl.style.fontSize = "12px";
      addrEl.style.color = "#555";
      addrEl.style.margin = "0";
      addrEl.textContent = address;

      popupContent.appendChild(nameEl);
      popupContent.appendChild(addrEl);

      const marker = L.marker([latitude, longitude], { icon: greenPin }).addTo(map);
      marker.bindPopup(popupContent, { maxWidth: 220 }).openPopup();

      mapRef.current = map;
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isOpen, latitude, longitude, foodName, address]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-foreground leading-tight">
                {foodName}
              </p>
              <p className="text-xs text-muted-foreground">{address}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            aria-label="Close map"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Map container */}
        <div ref={containerRef} style={{ height: "380px", width: "100%" }} />

      {/* Footer */}
        <div className="px-4 py-2.5 bg-muted/50 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3 text-green-600" />
            {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </span>
          
           <a href={"https://www.google.com/maps?q=" + latitude + "," + longitude}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-green-600 hover:text-green-700 hover:underline"
          >
            Open in Google Maps ↗
          </a>
        </div>

      </div>
    </div>
  );
};