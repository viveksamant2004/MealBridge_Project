import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Building2, ArrowRight, CheckCircle2, Hotel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const perks = [
  "Post surplus food in under 60 seconds",
  "Get matched with verified NGOs nearby",
  "Earn a CSR certificate for every donation",
  "Track all your donations in a live dashboard",
  "Build community trust with ratings & reviews",
];

const HotelsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-display font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest"
          >
            <Building2 className="w-3.5 h-3.5" />
            For Hotels & Restaurants
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl font-extrabold text-foreground mb-6 leading-tight"
          >
            Turn Leftovers Into{" "}
            <span className="text-primary">
              Community Impact
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-body text-lg text-muted-foreground mb-10 leading-relaxed"
          >
            Join 340+ hotels and restaurants already rescuing food with MealBridge.
            It takes less than a minute to list surplus food and connect with NGOs
            ready to pick it up.
          </motion.p>

          <motion.ul
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-left max-w-md mx-auto space-y-3 mb-10"
          >
            {perks.map((perk) => (
              <li
                key={perk}
                className="flex items-start gap-3 font-body text-sm text-foreground"
              >
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                {perk}
              </li>
            ))}
          </motion.ul>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold rounded-lg px-8 gap-2 w-full sm:w-auto"
              onClick={() => navigate("/hotels/register")}
            >
              Register Your Hotel
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              className="font-display font-bold rounded-lg px-8 gap-2 w-full sm:w-auto"
              onClick={() => navigate("/hotels/list")}
            >
              <Hotel className="w-4 h-4" />
              View Registered Hotels
            </Button>
          </motion.div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HotelsPage;