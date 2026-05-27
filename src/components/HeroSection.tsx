import { useState } from "react";
import { Heart, Building2, ArrowRight } from "lucide-react";
import ListDonationModal from "./ListDonationModal";
import heroFood from "@/assets/hero-food.jpg";

export default function HeroSection() {
  const [showDonateModal, setShowDonateModal] = useState(false);

  return (
    <>
      <section
        className="relative min-h-[85vh] flex items-center"
        style={{
          backgroundImage: `url(${heroFood})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm px-4 py-2 rounded-full mb-6">
            <Heart className="w-4 h-4 text-green-400" />
            Rescue Food. Feed Communities.
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 max-w-2xl">
            Turn Surplus Into Meals
            <br />
            <span className="text-green-400">With Meal Bridge</span>
          </h1>

          <p className="text-white/80 text-lg max-w-xl mb-10">
            Connecting hotels, restaurants & party venues with NGOs to rescue fresh leftover food — before it goes to waste.
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="/donations"
              className="flex items-center gap-2 px-7 py-3.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors text-base"
            >
              <Heart className="w-5 h-5" />
              Find Food Near You
              <ArrowRight className="w-4 h-4" />
            </a>

            <button
              onClick={() => setShowDonateModal(true)}
              className="flex items-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl transition-colors text-base"
            >
              <Building2 className="w-5 h-5" />
              Donate as a Hotel
            </button>
          </div>
        </div>
      </section>

      <ListDonationModal
        open={showDonateModal}
        onClose={() => setShowDonateModal(false)}
      />
    </>
  );
}