import { motion } from "framer-motion";
import { Clock, MapPin, Star, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DonationCardProps {
  hotelName: string;
  foodType: string;
  servings: number;
  rating: number;
  reviewCount: number;
  timeProcessed: string;
  urgency: "fresh" | "moderate" | "urgent";
  location: string;
  image: string;
}

const urgencyConfig = {
  fresh: { label: "Just Prepared", className: "bg-primary text-primary-foreground" },
  moderate: { label: "2-4 hrs ago", className: "bg-secondary text-secondary-foreground" },
  urgent: { label: "Claim Soon!", className: "bg-destructive text-destructive-foreground animate-pulse-gentle" },
};

const DonationCard = ({
  hotelName,
  foodType,
  servings,
  rating,
  reviewCount,
  timeProcessed,
  urgency,
  location,
  image,
}: DonationCardProps) => {
  const urg = urgencyConfig[urgency];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group bg-background rounded-xl border border-border shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={foodType}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <Badge className={`absolute top-3 left-3 ${urg.className} font-body font-semibold text-xs px-3 py-1`}>
          <Clock className="w-3 h-3 mr-1" />
          {urg.label}
        </Badge>
        <Badge className="absolute top-3 right-3 bg-foreground/70 text-primary-foreground backdrop-blur-sm font-body text-xs px-2 py-1">
          <ChefHat className="w-3 h-3 mr-1" />
          {servings} servings
        </Badge>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-display font-bold text-foreground text-lg">{hotelName}</h3>
            <p className="text-muted-foreground text-sm font-body">{foodType}</p>
          </div>
          <div className="flex items-center gap-1 bg-accent px-2 py-1 rounded-lg">
            <Star className="w-4 h-4 fill-secondary text-secondary" />
            <span className="font-display font-bold text-sm text-foreground">{rating}</span>
            <span className="text-muted-foreground text-xs">({reviewCount})</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-1">
          <MapPin className="w-3.5 h-3.5" />
          <span className="font-body">{location}</span>
        </div>

        <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-4">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-body">Prepared {timeProcessed}</span>
        </div>

        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold rounded-lg">
          Claim Now
        </Button>
      </div>
    </motion.div>
  );
};

export default DonationCard;