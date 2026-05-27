import { useState } from "react";
import { MapPin, Star, HandHeart, Gift } from "lucide-react";
import { MapModal } from "./MapModal";
import { createPortal } from "react-dom";

interface DonationCardProps {
  id: string;
  hotelName: string;
  foodType: string;
  location: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  servings: number;
  image: string;
  averageRating?: number;
  reviewCount?: number;
  isDonation?: boolean;
  onClaimDonate: (id: string) => void;
  onClaimOrder: (id: string) => void;
  onOpenReview: (id: string) => void;
}

const InlineStars = ({
  onRate,
  avgRating,
  reviewCount,
}: {
  onRate: () => void;
  avgRating: number;
  reviewCount: number;
}) => {
  const [hovered, setHovered] = useState(0);
  const hasRatings = reviewCount > 0;
  const displayRating = hovered || (hasRatings ? Math.round(avgRating) : 0);

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRate();
            }}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110 focus:outline-none"
          >
            <Star
              className={`w-4 h-4 transition-colors duration-150 ${
                star <= displayRating
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-gray-300 dark:text-gray-600"
              }`}
            />
          </button>
        ))}
      </div>
      {hasRatings ? (
        <span className="text-xs font-semibold text-foreground">
          {avgRating.toFixed(1)}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">Rate this</span>
      )}
    </div>
  );
};

const DonationCard = ({
  id,
  hotelName,
  foodType,
  location,
  city = "",
  latitude,
  longitude,
  servings,
  image,
  averageRating = 0,
  reviewCount = 0,
  isDonation = false,
  onClaimDonate,
  onClaimOrder,
  onOpenReview,
}: DonationCardProps) => {
  const hasRatings = reviewCount > 0;
  const [showMap, setShowMap] = useState(false);

  const hasCoordinates =
    typeof latitude === "number" && typeof longitude === "number";

  return (
    <>
      {/* ✅ Card wrapped in fragment so MapModal renders as sibling, outside overflow-hidden */}
      <div className="relative rounded-2xl border border-border bg-background shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
        {hasRatings && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-amber-400 text-black text-xs font-bold px-2 py-1 rounded-full shadow">
            <Star className="w-3 h-3 fill-black" />
            {averageRating.toFixed(1)}
          </div>
        )}

        {/* Image */}
        <div className="relative overflow-hidden" style={{ height: "160px" }}>
          <img
            src={image}
            alt={hotelName}
            className="w-full h-full object-cover"
          />
          {isDonation && (
            <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-emerald-700/90 to-transparent flex items-center gap-1.5">
              <span className="flex items-center gap-1.5 text-white text-xs font-bold">
                <HandHeart className="w-3.5 h-3.5" />
                🌱 Listed for Donation — Help Feed Someone Today
              </span>
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="p-4 flex flex-col gap-2.5">
          {isDonation && (
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5">
              <HandHeart className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-xs font-semibold text-emerald-700">
                Generously donated by this hotel
              </span>
            </div>
          )}

          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-foreground text-sm leading-snug">
                {hotelName}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">{foodType}</p>
            </div>
          </div>

          {/* Location + View on Map button */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 shrink-0 text-green-600" />
              <span>
                {location}
                {city ? `, ${city}` : ""}
              </span>
            </div>

            {hasCoordinates && (
              <button
                onClick={() => setShowMap(true)}
                className="flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-700 hover:underline transition-colors whitespace-nowrap"
              >
                🗺 View on Map
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="text-base leading-none">🍽</span>
            <span>
              <strong className="text-foreground">{servings}</strong> servings
              available
            </span>
          </div>

          <InlineStars
            onRate={() => onOpenReview(id)}
            avgRating={averageRating}
            reviewCount={reviewCount}
          />

          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => onClaimDonate(id)}
                className="w-full flex items-center justify-center gap-1.5 text-sm font-semibold py-2.5 px-3 rounded-xl border border-primary text-primary hover:bg-primary/5 transition-colors"
              >
                <HandHeart className="w-4 h-4" /> Donate
              </button>
              <span className="text-xs text-muted-foreground">
                Claim to Donate
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => onClaimOrder(id)}
                className="w-full flex items-center justify-center gap-1.5 text-sm font-semibold py-2.5 px-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <Gift className="w-4 h-4" /> Order
              </button>
              <span className="text-xs text-muted-foreground">
                Claim to Order
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ MapModal is now OUTSIDE the overflow-hidden card div */}
      {hasCoordinates && showMap && createPortal(
  <MapModal
    isOpen={showMap}
    onClose={() => setShowMap(false)}
    foodName={hotelName}
    address={`${location}${city ? `, ${city}` : ""}`}
    latitude={latitude!}
    longitude={longitude!}
  />,
  document.body
)}
    </>
  );
};

export default DonationCard;