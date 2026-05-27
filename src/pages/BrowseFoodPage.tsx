import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FoodGrid from "@/components/FoodGrid";

const BrowseFoodPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-16">
      <FoodGrid />
    </div>
    <Footer />
  </div>
);

export default BrowseFoodPage;