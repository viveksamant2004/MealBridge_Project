import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsBar from "@/components/StatsBar";
import FoodGrid from "@/components/FoodGrid";
import HowItWorks from "@/components/HowItWorks";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen bg-background  w-full overflow-x-hidden">
    <Navbar />
     <main className="pt-16 pb-48">
    <HeroSection />
    <StatsBar />
    <FoodGrid />
    <HowItWorks />
    <TestimonialsSection />
    <Footer />
    </main>
  </div>
);

export default Index;