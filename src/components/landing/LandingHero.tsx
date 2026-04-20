import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Command } from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight";
import { FlipWords } from "@/components/ui/flip-words";

const LandingHero = () => {
  const navigate = useNavigate();
  const flipWords = ["sticky notes.", "scattered docs.", "messy threads.", "forgotten ideas.", "abandoned drafts."];

  return (
    <section className="relative pt-36 md:pt-44 pb-32 px-6 overflow-hidden">
      <Spotlight className="z-0" />

      {/* Layered background grid */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black 30%, transparent 80%)",
        }}
      />

      {/* Faint orbs */}
      <div className="absolute top-1/3 left-[8%] w-[420px] h-[420px] rounded-full bg-foreground/[0.025] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-[8%] w-[480px] h-[480px] rounded-full bg-foreground/[0.02] blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Status badge */}
        <motion.button
          onClick={() => navigate("/auth")}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/80 bg-card/40 backdrop-blur-md mb-9 hover:border-foreground/30 transition-colors"
        >
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-foreground text-background">
            <Sparkles className="w-2.5 h-2.5" />
          </span>
          <span className="text-[11px] text-muted-foreground font-medium tracking-wide uppercase">
            Public beta · 2,400+ ideas processed
          </span>
          <ArrowRight className="w-3 h-3 text-muted-foreground/60 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
        </motion.button>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="text-[clamp(2.75rem,8vw,6.5rem)] font-extrabold tracking-[-0.055em] leading-[0.95] mb-7"
        >
          <span className="block">Your ideas deserve</span>
          <span className="block">
            <span className="text-muted-foreground/70">better than </span>
            <FlipWords words={flipWords} className="text-foreground" />
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-[16px] md:text-[18px] text-muted-foreground max-w-2xl mx-auto leading-[1.7] mb-12"
        >
          DumpStash turns raw brain dumps into structured product docs, roadmaps, and
          action plans. The AI workspace that thinks alongside you — not at you.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <button
            onClick={() => navigate("/auth")}
            className="group relative h-12 px-7 text-[14px] font-semibold bg-foreground text-background rounded-full hover:shadow-[0_0_50px_-8px_hsl(var(--foreground)/0.45)] transition-all duration-300 flex items-center gap-2 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start for free
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-background/20 to-transparent" />
          </button>
          <a
            href="#features"
            className="group h-12 px-6 text-[14px] text-foreground/80 rounded-full hover:text-foreground transition-all duration-200 flex items-center gap-2 border border-border hover:border-foreground/30 hover:bg-card/40"
          >
            Explore features
            <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground border border-border rounded bg-background/50">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </a>
        </motion.div>

        {/* Product preview window */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6 }}
          className="mt-24 relative max-w-4xl mx-auto"
        >
          <div className="absolute -inset-x-20 -inset-y-10 bg-gradient-to-b from-foreground/[0.03] to-transparent rounded-[3rem] blur-2xl pointer-events-none" />
          <div className="relative rounded-2xl border border-border bg-card/60 backdrop-blur-md overflow-hidden shadow-[0_30px_80px_-30px_hsl(var(--foreground)/0.15)]">
            {/* Window chrome */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-card/80">
              <div className="w-2.5 h-2.5 rounded-full bg-foreground/15" />
              <div className="w-2.5 h-2.5 rounded-full bg-foreground/15" />
              <div className="w-2.5 h-2.5 rounded-full bg-foreground/15" />
              <span className="ml-3 text-[11px] font-mono text-muted-foreground">dumpstash · my session</span>
            </div>
            {/* Mock content */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
              {[
                { tag: "IDEA", text: "Turn the onboarding flow into a 3-step wizard. Way less friction." },
                { tag: "DECISION", text: "Going with Postgres over Mongo. Relations matter more than scale rn." },
                { tag: "QUESTION", text: "How are we handling rate limits for free-tier users?" },
              ].map((d, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.12 }}
                  className="rounded-lg border border-border bg-background/60 p-3"
                >
                  <span className="text-[9px] font-bold tracking-[0.15em] text-muted-foreground">
                    {d.tag}
                  </span>
                  <p className="text-[12px] mt-1.5 leading-[1.55] text-foreground/80">{d.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingHero;
