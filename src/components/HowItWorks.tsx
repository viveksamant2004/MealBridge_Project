import { motion } from "framer-motion";
import { Building2, Bell, Truck, Heart } from "lucide-react";

const steps = [
  {
    icon: Building2,
    title: "Hotels List Surplus",
    desc: "Hotels, restaurants & party venues post their leftover food with details and photos.",
  },
  {
    icon: Bell,
    title: "NGOs Get Notified",
    desc: "Nearby NGOs receive instant alerts with food type, quantity, and freshness timer.",
  },
  {
    icon: Truck,
    title: "Quick Pickup",
    desc: "Claim the food, pick it up, and distribute it to communities in need.",
  },
  {
    icon: Heart,
    title: "Rate & Review",
    desc: "NGOs rate the quality and freshness, building trust for future donations.",
  },
];

const HowItWorks = () => (
  // ✅ id="how-it-works" enables navbar smooth scroll
  <section id="how-it-works" className="bg-card py-16 md:py-24">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mb-3">
          How It <span className="text-primary">Works</span>
        </h2>
        <p className="text-muted-foreground font-body text-lg max-w-lg mx-auto">
          From kitchen to community in four simple steps.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12 }}
            className="text-center"
          >
            <div className="mx-auto w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-5">
              <step.icon className="w-8 h-8 text-primary" />
            </div>
            <div className="font-display text-xs font-bold text-muted-foreground mb-2 tracking-widest uppercase">
              Step {i + 1}
            </div>
            <h3 className="font-display text-lg font-bold text-foreground mb-2">{step.title}</h3>
            <p className="text-muted-foreground font-body text-sm leading-relaxed">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;