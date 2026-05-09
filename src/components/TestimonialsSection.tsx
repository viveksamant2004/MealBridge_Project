import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Director, Asha NGO — Mumbai",
    quote:
      "MealBridge changed everything for us. We now receive fresh hotel food every evening that feeds over 200 families. The platform is seamless and the quality is always excellent.",
    rating: 5,
    initials: "PS",
  },
  {
    name: "Rajan Mehta",
    role: "Manager, The Grand Residency — Delhi",
    quote:
      "As a hotel, we hated watching good food go to waste after banquets. MealBridge gave us a responsible, dignified way to donate. Our staff feels proud every single day.",
    rating: 5,
    initials: "RM",
  },
  {
    name: "Sunita Devi",
    role: "Coordinator, Seva Foundation — Bangalore",
    quote:
      "The notifications are instant and pickup is always on time. We've rescued over 4,000 meals this year alone. This platform is a blessing for communities like ours.",
    rating: 5,
    initials: "SD",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Voices From the{" "}
            <span className="text-primary">Community</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto font-body">
            Real stories from hotels and NGOs making a difference together.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="bg-background rounded-2xl p-8 shadow-sm border border-border flex flex-col gap-5 hover:shadow-md transition-shadow duration-300"
            >
              {/* Quote icon */}
              <Quote className="w-8 h-8 text-primary/40" />

              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, s) => (
                  <Star key={s} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>

              {/* Text */}
              <p className="text-foreground/80 font-body text-sm leading-relaxed flex-1">
                "{t.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0">
                  {t.initials}
                </div>
                <div>
                  <p className="font-display font-semibold text-sm text-foreground">
                    {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;