import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { DotBackground } from "@/components/ui/dot-background";

const LandingCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-14 sm:py-16 md:py-20 px-4 sm:px-6 overflow-hidden">
      <DotBackground className="opacity-40" />
      <div className="absolute inset-0 landing-mesh opacity-50 pointer-events-none" />

      <div className="max-w-3xl mx-auto text-center relative z-10 px-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="lab-mono text-[11px] text-muted-foreground mb-4">ready when you are</p>
          <h2 className="font-display text-[1.75rem] sm:text-3xl md:text-[2.75rem] font-semibold tracking-[-0.045em] mb-4 leading-[1.1]">
            Stop losing ideas.
            <br />
            <span className="text-muted-foreground">Start shipping them.</span>
          </h2>
          <p className="text-[14px] sm:text-[15px] text-muted-foreground mb-8 max-w-md mx-auto leading-[1.65]">
            Free to start. No credit card. Dump once, walk away with structure.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/auth")}
            className="group h-11 px-6 text-[13px] font-medium bg-foreground text-background rounded-full inline-flex items-center justify-center gap-2 w-full sm:w-auto max-w-xs"
          >
            Start free
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingCTA;
