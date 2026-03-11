import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { FlipWords } from "@/components/ui/flip-words";
import { BackgroundGridBeams } from "@/components/ui/background-grid-beams";

const LandingHero = () => {
  const navigate = useNavigate();
  const flipWords = ["sticky notes.", "scattered docs.", "messy Slack threads.", "forgotten ideas."];

  return (
    <section className="relative pt-32 md:pt-48 pb-40 px-6 overflow-hidden">
      <Spotlight className="z-0" />
      <BackgroundGridBeams className="-z-10" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-[10%] w-[300px] h-[300px] rounded-full bg-foreground/[0.02] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-[10%] w-[400px] h-[400px] rounded-full bg-foreground/[0.015] blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-border bg-card/60 backdrop-blur-md mb-10"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground" />
          </span>
          <span className="text-[12px] text-muted-foreground font-medium tracking-wide">NOW IN PUBLIC BETA — 2,400+ IDEAS PROCESSED</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-[clamp(2.5rem,7vw,6rem)] font-extrabold tracking-[-0.05em] leading-[1.02] mb-8"
        >
          Your ideas deserve
          <br />
          <span className="text-muted-foreground">better than <FlipWords words={flipWords} className="text-foreground" /></span>
        </motion.h1>

        {/* Subtitle */}
        <div className="mb-16">
          <TextGenerateEffect
            words="DumpStash takes your raw brain dumps — messy thoughts, half-baked ideas, random notes — and turns them into structured product docs, roadmaps, and action plans. Powered by AI that thinks with you."
            className="text-[16px] md:text-[19px] text-muted-foreground max-w-2xl mx-auto leading-[1.9]"
          />
        </div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => navigate("/auth")}
            className="group relative h-14 px-10 text-[15px] font-semibold bg-foreground text-background rounded-full hover:shadow-[0_0_40px_-5px_hsl(var(--foreground)/0.4)] transition-all duration-300 flex items-center gap-2.5 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2.5">
              Start for free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-background/10 to-transparent" />
          </button>
          <button className="group h-14 px-10 text-[15px] text-muted-foreground rounded-full hover:text-foreground transition-all duration-200 flex items-center gap-2.5 border border-border hover:border-ring/40 hover:bg-card/30">
            <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center group-hover:bg-accent transition-colors">
              <Play className="w-3.5 h-3.5 ml-0.5" />
            </div>
            Watch demo
          </button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-24 flex flex-col sm:flex-row items-center justify-center gap-5"
        >
          <div className="flex -space-x-2.5">
            {["SJ", "MK", "AL", "RD", "VP"].map((initials, i) => (
              <div key={i} className="w-10 h-10 rounded-full bg-accent border-2 border-background flex items-center justify-center text-[10px] font-semibold text-muted-foreground">
                {initials}
              </div>
            ))}
            <div className="w-10 h-10 rounded-full bg-card border-2 border-background flex items-center justify-center text-[10px] font-medium text-muted-foreground">
              +495
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {[1,2,3,4,5].map(i => (
              <svg key={i} className="w-4 h-4 text-foreground fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-[13px] text-muted-foreground ml-1">Loved by <span className="text-foreground font-semibold">500+</span> builders</span>
          </div>
        </motion.div>

        {/* Gradient line */}
        <div className="mt-32 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
    </section>
  );
};

export default LandingHero;
