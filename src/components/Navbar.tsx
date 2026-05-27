import { useState } from "react";
import { Heart, Menu, X, LogOut, Mail, KeyRound, Pencil, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// ── helpers ───────────────────────────────────────────────────────────────────
const getInitials = (name: string) => name.slice(0, 2).toUpperCase();

type ModalType = "username" | "password" | null;

// ── modal ─────────────────────────────────────────────────────────────────────
const ActionModal = ({ type, onClose }: { type: ModalType; onClose: () => void }) => {
  const { user } = useAuth();
  const [step, setStep] = useState<"verify" | "change">("verify");
  const [currentPwd, setCurrentPwd] = useState("");
  const [newValue, setNewValue] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  if (!type) return null;

  const verifyPassword = async () => {
    setError("");
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email ?? "",
      password: currentPwd,
    });
    setLoading(false);
    if (signInError) setError("❌ Incorrect password. Please try again.");
    else setStep("change");
  };

  const applyChange = async () => {
    setError("");
    setLoading(true);
    if (type === "password") {
      if (newValue.length < 6) { setError("Password must be at least 6 characters."); setLoading(false); return; }
      if (newValue !== confirmPwd) { setError("Passwords do not match."); setLoading(false); return; }
      const { error: e } = await supabase.auth.updateUser({ password: newValue });
      setLoading(false);
      if (e) setError(e.message); else setSuccess("✅ Password updated successfully!");
    } else {
      if (!newValue.trim()) { setError("Username cannot be empty."); setLoading(false); return; }
      const { error: e } = await supabase.auth.updateUser({ data: { username: newValue.trim() } });
      setLoading(false);
      if (e) setError(e.message); else setSuccess("✅ Username updated successfully!");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
        <h2 className="font-display font-extrabold text-xl text-foreground mb-1">
          {type === "password" ? "Change Password" : "Change Username"}
        </h2>
        <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-5">
          <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
          <p className="text-xs text-yellow-600 font-body leading-relaxed">
            {type === "password"
              ? "Changing your password will sign you out on other devices. Make sure to remember your new password."
              : "Your username is visible to hotels and NGOs on the platform. Choose something professional."}
          </p>
        </div>

        {step === "verify" ? (
          <>
            <p className="text-sm font-body text-muted-foreground mb-4">First, confirm your current password to proceed.</p>
            <div className="relative mb-4">
              <input
                type={showCurrent ? "text" : "password"}
                placeholder="Current password"
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && verifyPassword()}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm font-body bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary pr-10"
              />
              <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold rounded-lg"
              onClick={verifyPassword} disabled={loading || !currentPwd}>
              {loading ? "Verifying…" : "Verify & Continue"}
            </Button>
          </>
        ) : success ? (
          <div className="text-center py-4">
            <p className="text-sm font-body text-foreground mb-4">{success}</p>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold rounded-lg" onClick={onClose}>Done</Button>
          </div>
        ) : (
          <>
            {type === "username" ? (
              <div className="mb-4">
                <label className="text-xs font-body text-muted-foreground mb-1 block">New Username</label>
                <input type="text" placeholder="e.g. john_doe" value={newValue} onChange={(e) => setNewValue(e.target.value)}
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm font-body bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            ) : (
              <>
                <div className="relative mb-3">
                  <label className="text-xs font-body text-muted-foreground mb-1 block">New Password</label>
                  <input type={showNew ? "text" : "password"} placeholder="At least 6 characters" value={newValue} onChange={(e) => setNewValue(e.target.value)}
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm font-body bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary pr-10" />
                  <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 bottom-2.5 text-muted-foreground">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="mb-4">
                  <label className="text-xs font-body text-muted-foreground mb-1 block">Confirm New Password</label>
                  <input type="password" placeholder="Repeat new password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)}
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm font-body bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </>
            )}
            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold rounded-lg"
              onClick={applyChange} disabled={loading}>
              {loading ? "Saving…" : type === "password" ? "Update Password" : "Update Username"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

// ── nav link config ───────────────────────────────────────────────────────────
// CHANGED: Added "Donations" link pointing to /donations
const navLinks = [
  { label: "For Hotels", to: "/hotels", scroll: false },
  { label: "Donations", to: "/donations", scroll: false },
  { label: "How It Works", to: "/#how-it-works", scroll: true },
  { label: "About", to: "/about", scroll: false },
];

// ── Navbar ────────────────────────────────────────────────────────────────────
const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modal, setModal] = useState<ModalType>(null);

  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut();
    navigate("/");
  };

  const openModal = (type: ModalType) => {
    setDropdownOpen(false);
    setModal(type);
  };

  // Smooth scroll — navigates to homepage first if on another page
  const handleHowItWorksClick = (e: React.MouseEvent, closeMobile = false) => {
    e.preventDefault();
    if (closeMobile) setMobileOpen(false);

    const scrollToSection = () => {
      const el = document.getElementById("how-it-works");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(scrollToSection, 350);
    } else {
      scrollToSection();
    }
  };

  const gmailUrl = user?.email
    ? `https://mail.google.com/mail/?view=cm&to=${user.email}`
    : "https://mail.google.com";

  const username = user?.user_metadata?.username || user?.email?.split("@")[0] || "User";

  return (
    <>
      {modal && <ActionModal type={modal} onClose={() => setModal(null)} />}

      <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="w-full max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-extrabold text-xl text-foreground">
              Meal<span className="text-primary">Bridge</span>
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) =>
              link.scroll ? (
                <a
                  key={link.label}
                  href={link.to}
                  onClick={handleHowItWorksClick}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors font-body cursor-pointer"
                >
                  {link.label}
                </a>
              ) : (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors font-body ${
                      isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              )
            )}
          </div>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(v => !v)}
                  className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-display font-bold text-sm hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  title={username}
                >
                  {getInitials(username)}
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 top-12 z-50 w-60 bg-background border border-border rounded-2xl shadow-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-border bg-accent/30">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-display font-bold text-sm shrink-0">
                            {getInitials(username)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-display font-bold text-foreground truncate">{username}</p>
                            <p className="text-xs font-body text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-1.5 space-y-0.5">
                        <a href={gmailUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                          onClick={() => setDropdownOpen(false)}>
                          <Mail className="w-4 h-4 text-primary" /> Open Gmail
                        </a>
                        <button onClick={() => openModal("username")}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body text-muted-foreground hover:bg-accent hover:text-foreground transition-colors text-left">
                          <Pencil className="w-4 h-4 text-primary" /> Change Username
                        </button>
                        <button onClick={() => openModal("password")}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body text-muted-foreground hover:bg-accent hover:text-foreground transition-colors text-left">
                          <KeyRound className="w-4 h-4 text-primary" /> Change Password
                        </button>
                      </div>

                      <div className="p-1.5 border-t border-border">
                        <button onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body text-red-500 hover:bg-red-500/10 transition-colors text-left">
                          <LogOut className="w-4 h-4" /> Log Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Button variant="ghost" className="font-display font-bold text-sm" onClick={() => navigate("/auth")}>
                  Log In
                </Button>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold text-sm rounded-lg"
                  onClick={() => navigate("/auth", { state: { isSignup: true } })}>
                  Sign Up Free
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-foreground">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-background border-b border-border px-4 pb-4 space-y-1">
            {navLinks.map((link) =>
              link.scroll ? (
                <a key={link.label} href={link.to}
                  onClick={(e) => handleHowItWorksClick(e, true)}
                  className="block text-sm font-medium font-body py-2 px-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                  {link.label}
                </a>
              ) : (
                <NavLink key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block text-sm font-medium font-body py-2 px-2 rounded-lg transition-colors ${
                      isActive ? "text-primary bg-accent font-semibold" : "text-muted-foreground hover:text-foreground"
                    }`
                  }>
                  {link.label}
                </NavLink>
              )
            )}

            {user ? (
              <div className="pt-2 space-y-1 border-t border-border mt-2">
                <button onClick={() => { setMobileOpen(false); setModal("username"); }}
                  className="w-full flex items-center gap-2 text-sm font-body text-muted-foreground py-2 px-2">
                  <Pencil className="w-4 h-4 text-primary" /> Change Username
                </button>
                <button onClick={() => { setMobileOpen(false); setModal("password"); }}
                  className="w-full flex items-center gap-2 text-sm font-body text-muted-foreground py-2 px-2">
                  <KeyRound className="w-4 h-4 text-primary" /> Change Password
                </button>
                <Button variant="ghost" className="w-full justify-start font-display font-bold text-sm text-red-500" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" /> Log Out
                </Button>
              </div>
            ) : (
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold rounded-lg mt-2"
                onClick={() => { navigate("/auth", { state: { isSignup: true } }); setMobileOpen(false); }}>
                Sign Up Free
              </Button>
            )}
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;