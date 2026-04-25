import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, ArrowRight, Menu, X, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";

const LandingNav = () => {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "py-2" : "py-4"
      )}
    >
      <div
        className={cn(
          "mx-auto flex items-center justify-between transition-all duration-300 px-5",
          scrolled
            ? "max-w-3xl rounded-full border border-border bg-background/70 backdrop-blur-xl py-2 shadow-[0_8px_32px_-12px_hsl(var(--foreground)/0.12)]"
            : "max-w-6xl py-3"
        )}
      >
        <a href="/" className="flex items-center gap-2 cursor-pointer shrink-0">
          <div className="w-7 h-7 rounded-md bg-foreground flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-background" />
          </div>
          <span className="text-[14px] font-bold tracking-tight">DumpStash</span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
          <a href="#features" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">How it works</a>
          <a href="#pricing" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
        </div>

        <div className="hidden md:flex items-center gap-1.5">
          <button
            onClick={toggle}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => navigate("/auth")}
            className="text-[12px] text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
          >
            Log in
          </button>
          <button
            onClick={() => navigate("/auth")}
            className="text-[12px] font-medium h-8 px-4 bg-foreground text-background rounded-full hover:opacity-90 transition-opacity flex items-center gap-1.5"
          >
            Get started
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Mobile menu */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden mx-4 mt-2 rounded-2xl border border-border bg-background/95 backdrop-blur-xl px-6 py-5 space-y-4">
          <a href="#features" className="block text-[13px] text-muted-foreground" onClick={() => setMobileOpen(false)}>Features</a>
          <a href="#how-it-works" className="block text-[13px] text-muted-foreground" onClick={() => setMobileOpen(false)}>How it works</a>
          <a href="#pricing" className="block text-[13px] text-muted-foreground" onClick={() => setMobileOpen(false)}>Pricing</a>
          <button onClick={() => navigate("/auth")} className="w-full text-[13px] font-medium h-10 bg-foreground text-background rounded-full">
            Get started
          </button>
        </div>
      )}
    </nav>
  );
};

export default LandingNav;
