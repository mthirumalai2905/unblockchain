import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight";

const LandingCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-32 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative p-16 md:p-20 rounded-3xl border border-border overflow-hidden"
        >
          <Spotlight />
          
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-card/80 via-background to-card/40 -z-10" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-[2.5rem] font-bold tracking-[-0.02em] mb-5 leading-[1.15]">
              Stop losing ideas.
              <br />
              <span className="text-muted-foreground">Start shipping them.</span>
            </h2>
            <p className="text-[15px] text-muted-foreground mb-10 max-w-md mx-auto leading-[1.7]">
              Join hundreds of builders who use DumpStash to turn chaos into clarity, every day.
            </p>
            <button
              onClick={() => navigate("/auth")}
              className="group h-12 px-8 text-[14px] font-semibold bg-foreground text-background rounded-full hover:shadow-[0_0_30px_-5px_hsl(var(--foreground)/0.3)] transition-all duration-300 inline-flex items-center gap-2 relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-background/10 to-transparent" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingCTA;
