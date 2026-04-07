import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsBar from "@/components/StatsBar";
import FoodGrid from "@/components/FoodGrid";
import HowItWorks from "@/components/HowItWorks";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <HeroSection />
    <StatsBar />
    <FoodGrid />
    <HowItWorks />
      <TestimonialsSection />
    <Footer />
  </div>
);

export default Index;
