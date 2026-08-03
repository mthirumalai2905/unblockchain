import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const testimonials = [
  { quote: "DumpStash replaced my entire notes stack. I just dump and it organizes everything.", name: "Sarah Kim", role: "Product Lead, Stripe", initials: "SK" },
  { quote: "The AI roadmap generation alone is worth 10x the price. Saves me hours every sprint.", name: "Marcus Chen", role: "CTO, Vercel", initials: "MC" },
  { quote: "Finally, a tool that thinks the way I do. Messy first, structured later.", name: "Alex Rivera", role: "Founder, Arc", initials: "AR" },
  { quote: "We replaced three tools with this. It's the only thing on my second monitor now.", name: "Priya Shah", role: "Eng Manager, Linear", initials: "PS" },
  { quote: "It feels like having a partner who reads my brain at 3am.", name: "Jordan Wells", role: "Solo founder", initials: "JW" },
  { quote: "The threading and theme extraction is unreasonably good. I'm spoiled now.", name: "Tomás Reyes", role: "Design lead, Figma", initials: "TR" },
];

const TestimonialCard = ({ t }: { t: typeof testimonials[0] }) => (
  <div className="shrink-0 w-[min(300px,85vw)] sm:w-[340px] md:w-[380px] mx-2 sm:mx-3 p-4 sm:p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-md">
    <Quote className="w-5 h-5 text-muted-foreground/30 mb-3" />
    <p className="text-[13px] text-foreground/85 leading-[1.7] mb-5 min-h-[72px] sm:min-h-[80px]">&quot;{t.quote}&quot;</p>
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="w-8 h-8 rounded-full bg-accent border border-border flex items-center justify-center text-[10px] font-bold shrink-0">
        {t.initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold truncate">{t.name}</p>
        <p className="text-[10px] text-muted-foreground truncate">{t.role}</p>
      </div>
      <div className="ml-auto flex items-center gap-0.5 shrink-0">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className="w-2.5 h-2.5 text-foreground fill-current" />
        ))}
      </div>
    </div>
  </div>
);

const LandingTestimonials = () => {
  const row1 = [...testimonials, ...testimonials];
  const row2 = [...testimonials.slice().reverse(), ...testimonials.slice().reverse()];

  return (
    <section className="relative py-14 sm:py-16 md:py-20 px-0 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 px-1"
        >
          <p className="lab-mono text-[11px] text-muted-foreground mb-3">
            builders
          </p>
          <h2 className="font-display text-[1.75rem] sm:text-3xl md:text-[2.75rem] font-semibold tracking-[-0.045em] leading-[1.1]">
            Real teams.
            <span className="text-muted-foreground"> Real shipping velocity.</span>
          </h2>
        </motion.div>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-20 md:w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-20 md:w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="flex overflow-hidden mb-3 sm:mb-4">
          <motion.div
            className="flex shrink-0"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          >
            {row1.map((t, i) => (
              <TestimonialCard key={`r1-${i}`} t={t} />
            ))}
          </motion.div>
        </div>

        <div className="hidden sm:flex overflow-hidden">
          <motion.div
            className="flex shrink-0"
            animate={{ x: ["-50%", "0%"] }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          >
            {row2.map((t, i) => (
              <TestimonialCard key={`r2-${i}`} t={t} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LandingTestimonials;
