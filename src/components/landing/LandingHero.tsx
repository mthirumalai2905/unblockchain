import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";

const LandingHero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-32 md:pt-44 pb-32 px-6">
      {/* Ambient glow */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full pointer-events-none opacity-[0.07]"
        style={{ background: "radial-gradient(ellipse, hsl(var(--foreground)) 0%, transparent 70%)" }} />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/60 backdrop-blur-sm mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[12px] text-muted-foreground">Now in public beta — 2,400+ ideas processed</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-[clamp(2.5rem,7vw,5.5rem)] font-extrabold tracking-[-0.03em] leading-[1.05] mb-6"
        >
          Your ideas deserve
          <br />
          <span className="text-muted-foreground">better than sticky notes.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[17px] md:text-[19px] text-muted-foreground max-w-2xl mx-auto leading-[1.7] mb-12"
        >
          DumpStash takes your raw brain dumps — messy thoughts, half-baked ideas, random
          notes — and turns them into structured product docs, roadmaps, and action plans.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => navigate("/auth")}
            className="group h-12 px-8 text-[14px] font-semibold bg-foreground text-background rounded-full hover:opacity-90 transition-all flex items-center gap-2 shadow-[0_0_0_1px_hsl(var(--foreground)/0.1),0_4px_20px_-4px_hsl(var(--foreground)/0.15)]"
          >
            Start for free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button className="h-12 px-8 text-[14px] text-muted-foreground rounded-full hover:text-foreground transition-colors flex items-center gap-2 border border-border hover:border-ring/40">
            <Play className="w-3.5 h-3.5" />
            Watch 2-min demo
          </button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 flex items-center justify-center gap-6 text-muted-foreground"
        >
          <div className="flex -space-x-2">
            {["SJ", "MK", "AL", "RD", "VP"].map((initials, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-accent border-2 border-background flex items-center justify-center text-[9px] font-semibold">
                {initials}
              </div>
            ))}
          </div>
          <div className="text-[13px]">
            <span className="text-foreground font-medium">500+</span> builders shipping with DumpStash
          </div>
        </motion.div>
      </div>

      {/* Grid background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }} />
        {/* Fade out at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
      </div>
    </section>
  );
};

export default LandingHero;
