import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";

const LandingNav = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 pt-[env(safe-area-inset-top)]",
        scrolled ? "py-2" : "py-3 sm:py-4"
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "mx-auto flex items-center justify-between transition-all duration-300 px-3 sm:px-5",
          scrolled
            ? "max-w-[calc(100%-1.5rem)] sm:max-w-3xl rounded-full border border-border bg-background/70 backdrop-blur-xl py-2 shadow-[0_8px_30px_-12px_hsl(0_0%_0%_/_0.4)]"
            : "max-w-5xl py-2 sm:py-3"
        )}
      >
        <a href="/" className="flex items-center gap-2 sm:gap-2.5 cursor-pointer shrink-0 min-w-0">
          <div className="w-6 h-6 rounded-[6px] bg-foreground flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-background leading-none">D</span>
          </div>
          <span className="text-[14px] font-semibold tracking-[-0.03em] truncate">DumpStash</span>
          <span className="lab-mono hidden sm:inline text-[10px] font-medium text-muted-foreground border border-border px-1.5 py-0.5 rounded shrink-0">
            lab
          </span>
        </a>

        <div className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          <a href="#how-it-works" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">Product</a>
          <a href="#features" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#pricing" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
        </div>

        <div className="hidden md:flex items-center gap-1.5 shrink-0">
          <ThemeToggle size="sm" />
          <button
            onClick={() => navigate("/auth")}
            className="text-[13px] text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
          >
            Log in
          </button>
          <button
            onClick={() => navigate("/auth")}
            className="text-[13px] font-medium h-8 px-3.5 bg-foreground text-background rounded-full hover:opacity-90 transition-opacity flex items-center gap-1.5"
          >
            Deploy ideas
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="md:hidden flex items-center gap-0.5 shrink-0">
          <ThemeToggle size="sm" />
          <button
            className="p-2 min-w-[40px] min-h-[40px] inline-flex items-center justify-center"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-background/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="md:hidden relative mx-3 mt-2 rounded-2xl border border-border bg-background/95 backdrop-blur-xl px-5 py-5 space-y-1"
            >
              {[
                { href: "#how-it-works", label: "Product" },
                { href: "#features", label: "Features" },
                { href: "#pricing", label: "Pricing" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block text-[14px] text-muted-foreground hover:text-foreground py-2.5"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <button
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/auth");
                }}
                className="w-full mt-2 text-[13px] font-medium h-11 bg-foreground text-background rounded-full"
              >
                Get started
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default LandingNav;
