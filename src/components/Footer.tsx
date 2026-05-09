import { Heart } from "lucide-react";

const Footer = () => (
  <footer className="bg-foreground text-primary-foreground/70 py-12">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Heart className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-extrabold text-lg text-primary-foreground">
            MealBridge
          </span>
        </div>
        <p className="text-sm font-body text-center">
          © 2026 MealBridge. Turning surplus into smiles, one meal at a time.
        </p>
        <div className="flex gap-6 text-sm font-body">
          <a href="#" className="hover:text-primary-foreground transition-colors">Privacy</a>
          <a href="#" className="hover:text-primary-foreground transition-colors">Terms</a>
          <a href="#" className="hover:text-primary-foreground transition-colors">Contact</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;