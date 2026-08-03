import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { DotBackground } from "@/components/ui/dot-background";
import { SpotlightGroup } from "@/components/ui/spotlight";
import { FlipWords } from "@/components/ui/flip-words";

const ease = [0.22, 1, 0.36, 1] as const;

const LandingHero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden px-4 sm:px-6 pt-24 sm:pt-28 pb-12 sm:pb-16">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 landing-mesh opacity-80" />
        <DotBackground className="opacity-70" size={20} />
        <SpotlightGroup />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="lab-mono inline-flex flex-wrap items-center justify-center gap-2 text-[10px] sm:text-[11px] text-muted-foreground mb-6 sm:mb-8 px-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cf-decision shrink-0" />
          <span>dumpstash lab</span>
          <span className="text-border">/</span>
          <span>public beta</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="font-display text-[clamp(2.1rem,9vw,5.5rem)] font-semibold tracking-[-0.055em] leading-[1.08] mb-5 sm:mb-6 w-full px-1"
        >
          <span className="block text-center">Dump your chaos.</span>
          <span className="mt-1.5 flex flex-wrap items-center justify-center gap-x-[0.35em] gap-y-1 text-muted-foreground font-medium">
            <span>Ship with</span>
            <FlipWords
              words={["clarity.", "structure.", "velocity.", "focus."]}
              className="text-foreground font-semibold"
            />
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          className="text-[14px] sm:text-[16px] md:text-[17px] text-muted-foreground max-w-md mx-auto leading-[1.7] mb-8 sm:mb-10 text-center font-normal tracking-[-0.015em] px-2"
        >
          A thinking lab for builders. Drop raw notes, get structured ideas,
          PRDs, and roadmaps back.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18, ease }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full max-w-sm sm:max-w-none px-2"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/auth")}
            className="group h-11 px-6 text-[13px] font-medium bg-foreground text-background rounded-full inline-flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            Start free
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </motion.button>
          <a
            href="#how-it-works"
            className="h-11 px-6 text-[13px] text-muted-foreground rounded-full border border-border inline-flex items-center justify-center hover:text-foreground hover:border-foreground/25 transition-colors w-full sm:w-auto"
          >
            See how it works
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingHero;
