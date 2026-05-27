import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";


import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin } from "lucide-react";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function InvalidateSize() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 300);
  }, [map]);
  return null;
}

interface Listing {
  id: string;
  hotelName: string;
  foodType: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface AllListingsMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  listings: Listing[];
}

export function AllListingsMapModal({ isOpen, onClose, listings }: AllListingsMapModalProps) {
  const validListings = listings.filter(l => l.latitude && l.longitude);
  const center = validListings.length > 0
    ? [validListings[0].latitude, validListings[0].longitude] as [number, number]
    : [20.5937, 78.9629] as [number, number]; // India center fallback

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-3">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <MapPin className="w-4 h-4 text-green-600" />
            All Available Listings ({validListings.length})
          </DialogTitle>
        </DialogHeader>

        <div className="h-[500px] w-full">
          {isOpen && validListings.length > 0 && (
            <MapContainer
              center={center}
              zoom={5}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {validListings.map((l) => (
                <Marker key={l.id} position={[l.latitude, l.longitude]}>
                  <Popup>
                    <strong>{l.hotelName}</strong><br />
                    {l.foodType}<br />
                    <span className="text-xs text-gray-500">{l.address}</span>
                  </Popup>
                </Marker>
              ))}
              <InvalidateSize />
            </MapContainer>
          )}
          {validListings.length === 0 && (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              No listings with location data available.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}