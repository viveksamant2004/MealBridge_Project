import { useState } from "react";
import { Heart, Menu, X, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-extrabold text-xl text-foreground">
            Meal<span className="text-primary">Bridge</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors font-body">Browse Food</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors font-body">For Hotels</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors font-body">How It Works</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors font-body">About</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="max-w-[120px] truncate">{user.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="font-display font-bold text-sm text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Log Out
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                className="font-display font-bold text-sm"
                onClick={() => navigate("/auth")}
              >
                Log In
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold text-sm rounded-lg"
                onClick={() => navigate("/auth", { state: { isSignup: true } })}
              >
                Sign Up Free
              </Button>
            </>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden text-foreground">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-background border-b border-border px-4 pb-4 space-y-3">
          <a href="#" className="block text-sm font-medium text-muted-foreground font-body py-2">Browse Food</a>
          <a href="#" className="block text-sm font-medium text-muted-foreground font-body py-2">For Hotels</a>
          <a href="#" className="block text-sm font-medium text-muted-foreground font-body py-2">How It Works</a>
          <a href="#" className="block text-sm font-medium text-muted-foreground font-body py-2">About</a>
          {user ? (
            <Button
              variant="ghost"
              className="w-full justify-start font-display font-bold text-sm"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          ) : (
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold rounded-lg"
              onClick={() => { navigate("/auth",{ state: { isSignup: true } }); setOpen(false); }}
            >
              Sign Up Free
            </Button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;