import { Heart } from "lucide-react";

const Footer = () => (
  <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 py-4">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-extrabold text-lg text-gray-900">
            MealBridge
          </span>
        </div>
        <p className="text-sm font-body text-center text-gray-500">
          © 2026 MealBridge. Turning surplus into smiles, one meal at a time.
        </p>
        <div className="flex gap-6 text-sm font-body text-gray-500">
          <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;