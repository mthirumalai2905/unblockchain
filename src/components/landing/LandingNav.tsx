import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, ArrowRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const LandingNav = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border" : "bg-transparent"
    )}>
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
            <Zap className="w-4 h-4 text-background" />
          </div>
          <span className="text-[15px] font-bold tracking-tight">DumpStash</span>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">How it works</a>
          <a href="#pricing" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => navigate("/auth")}
            className="text-[13px] text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
          >
            Log in
          </button>
          <button
            onClick={() => navigate("/auth")}
            className="text-[13px] font-medium h-9 px-5 bg-foreground text-background rounded-full hover:opacity-90 transition-opacity flex items-center gap-1.5"
          >
            Get Started
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile menu */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border px-6 pb-6 space-y-4">
          <a href="#features" className="block text-[14px] text-muted-foreground" onClick={() => setMobileOpen(false)}>Features</a>
          <a href="#how-it-works" className="block text-[14px] text-muted-foreground" onClick={() => setMobileOpen(false)}>How it works</a>
          <a href="#pricing" className="block text-[14px] text-muted-foreground" onClick={() => setMobileOpen(false)}>Pricing</a>
          <button onClick={() => navigate("/auth")} className="w-full text-[14px] font-medium h-10 bg-foreground text-background rounded-full">
            Get Started
          </button>
        </div>
      )}
    </nav>
  );
};

export default LandingNav;
