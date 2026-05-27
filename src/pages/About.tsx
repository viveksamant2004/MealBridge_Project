import { motion } from "framer-motion";
import { Heart, Users, Leaf, ShieldCheck, Globe, Mail, ArrowRight, Utensils, Building2, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// ── data ──────────────────────────────────────────────────────────────────────
const stats = [
  { value: "12,000+", label: "Meals Rescued", icon: Utensils },
  { value: "340+", label: "Partner Hotels", icon: Building2 },
  { value: "80+", label: "NGO Partners", icon: Users },
  { value: "4.9★", label: "Average Rating", icon: Star },
];

const values = [
  {
    icon: Heart,
    title: "Compassion First",
    desc: "Every meal rescued is a person fed. We keep human dignity at the center of every decision we make.",
  },
  {
    icon: Leaf,
    title: "Zero Waste Vision",
    desc: "We believe food waste is a design flaw. Our platform is engineered to eliminate it at the source.",
  },
  {
    icon: ShieldCheck,
    title: "Trust & Transparency",
    desc: "Hotels, NGOs, and communities deserve honesty. Every donation is tracked, rated, and verified.",
  },
  {
    icon: Globe,
    title: "Scalable Impact",
    desc: "Built to grow — from one city to every city. Our infrastructure scales with the mission.",
  },
];

const team = [
  { initials: "VS", name: "Vivek S."},
  { initials: "V", name: "Vaibhav S."},
  { initials: "MK", name: "Mayank K."},
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

// ── component ────────────────────────────────────────────────────────────────
const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* decorative blob */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-16 w-72 h-72 rounded-full bg-primary/5 blur-2xl pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-display font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest"
          >
            <Heart className="w-3.5 h-3.5" /> Our Story
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="show"
            custom={1}
            variants={fadeUp}
            className="font-display text-4xl md:text-6xl font-extrabold text-foreground leading-tight mb-6"
          >
            We Built a Bridge Between{" "}
            <span className="text-primary">Surplus</span> and{" "}
            <span className="text-primary">Need</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="show"
            custom={2}
            variants={fadeUp}
            className="font-body text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto"
          >
            MealBridge was born from a simple question: why does food go to waste at banquet halls
            while families go hungry just a few kilometres away? We decided to fix that.
          </motion.p>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-14 px-4 bg-card border-y border-border">
        <div className="max-w-screen-xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={i}
              variants={fadeUp}
              className="text-center"
            >
              <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <s.icon className="w-6 h-6 text-primary" />
              </div>
              <p className="font-display text-3xl font-extrabold text-foreground">{s.value}</p>
              <p className="font-body text-sm text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="py-20 px-4">
        <div className="max-w-screen-xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <span className="text-xs font-display font-bold text-primary uppercase tracking-widest">
              Mission
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mt-2 mb-4 leading-snug">
              Rescue Fresh Food.<br />Feed Real Communities.
            </h2>
            <p className="font-body text-muted-foreground leading-relaxed mb-4">
              Our mission is to create a frictionless channel between food-surplus establishments —
              hotels, restaurants, catering services, and party venues — and the NGOs and shelters
              that serve those most in need.
            </p>
            <p className="font-body text-muted-foreground leading-relaxed">
              We focus on <strong className="text-foreground">freshness</strong>, 
              {" "}<strong className="text-foreground">speed</strong>, and
              {" "}<strong className="text-foreground">accountability</strong>. Every donation
              is timestamped, rated, and verified so both donors and receivers can build lasting trust.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            custom={1}
            variants={fadeUp}
            className="bg-card border border-border rounded-2xl p-8"
          >
            <span className="text-xs font-display font-bold text-primary uppercase tracking-widest">
              Vision
            </span>
            <h3 className="font-display text-2xl font-extrabold text-foreground mt-2 mb-4">
              A World Where No Meal Goes to Waste
            </h3>
            <p className="font-body text-muted-foreground leading-relaxed mb-6">
              We envision a future where surplus food is considered a community resource, not
              a liability. Where every city has an active MealBridge network that redistributes
              thousands of meals every single day — automatically, efficiently, and with dignity.
            </p>
            <div className="flex items-center gap-3 text-sm font-body text-muted-foreground border-t border-border pt-5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4 text-primary" />
              </div>
              Expanding to 10+ cities by end of 2025
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-20 px-4 bg-card border-y border-border">
        <div className="max-w-screen-xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <span className="text-xs font-display font-bold text-primary uppercase tracking-widest">
              What We Stand For
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mt-2">
              Our Core <span className="text-primary">Values</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="bg-background border border-border rounded-2xl p-6 hover:border-primary/40 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <v.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-base font-bold text-foreground mb-2">{v.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="py-20 px-4">
        <div className="max-w-screen-xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <span className="text-xs font-display font-bold text-primary uppercase tracking-widest">
              The People Behind It
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mt-2">
              Meet the <span className="text-primary">Team</span>
            </h2>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-8">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="text-center w-44"
              >
                <div className="mx-auto w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-display font-extrabold text-2xl mb-4 shadow-lg">
                  {member.initials}
                </div>
                <p className="font-display font-bold text-foreground">{member.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact / CTA ── */}
      <section className="py-20 px-4 bg-card border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <Mail className="w-7 h-7 text-primary" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mb-4">
              Let's Build This <span className="text-primary">Together</span>
            </h2>
            <p className="font-body text-muted-foreground mb-8 leading-relaxed">
              Whether you're a hotel looking to donate, an NGO wanting to partner, or a
              developer who wants to contribute — we'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold rounded-lg px-8 gap-2"
                onClick={() => navigate("/auth", { state: { isSignup: true } })}
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
              <a
                href="mailto:contact@mealbridge.app"
                className="inline-flex items-center justify-center gap-2 border border-border rounded-lg px-8 py-2.5 text-sm font-display font-bold text-foreground hover:bg-accent transition-colors"
              >
                <Mail className="w-4 h-4" /> Email Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;