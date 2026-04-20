import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight";

const LandingCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-28 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative p-12 md:p-20 rounded-3xl border border-border overflow-hidden bg-card/30 backdrop-blur-md"
        >
          <Spotlight />

          {/* Animated grid */}
          <div
            className="absolute inset-0 -z-10 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
              maskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, black 30%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, black 30%, transparent 75%)",
            }}
          />

          {/* Background gradient */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-card/60 via-background/40 to-card/40" />

          <div className="relative z-10 text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-background/40 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.18em] mb-7">
              <span className="w-1 h-1 rounded-full bg-foreground animate-pulse" />
              Free to start
            </span>
            <h2 className="text-3xl md:text-[3rem] font-bold tracking-[-0.04em] mb-5 leading-[1.02]">
              Stop losing ideas.
              <br />
              <span className="text-muted-foreground/70">Start shipping them.</span>
            </h2>
            <p className="text-[15px] text-muted-foreground mb-10 max-w-md mx-auto leading-[1.7]">
              Join hundreds of builders who use DumpStash to turn chaos into clarity.
              No credit card. No setup. Just dump and ship.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate("/auth")}
                className="group h-12 px-7 text-[14px] font-semibold bg-foreground text-background rounded-full hover:shadow-[0_0_50px_-8px_hsl(var(--foreground)/0.5)] transition-all duration-300 inline-flex items-center gap-2 relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get started free
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-background/20 to-transparent" />
              </button>
              <a
                href="#features"
                className="h-12 px-6 text-[14px] text-foreground/80 rounded-full hover:text-foreground transition-all duration-200 flex items-center gap-2 border border-border hover:border-foreground/30 hover:bg-card/40"
              >
                See how it works
              </a>
            </div>

            <div className="mt-10 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-foreground/60" />
                No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-foreground/60" />
                Free forever plan
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-foreground/60" />
                Cancel anytime
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingCTA;
