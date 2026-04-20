import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const testimonials = [
  { quote: "DumpStash replaced my entire note-taking stack. I just dump and it organizes everything.", name: "Sarah Kim", role: "Product Lead, Stripe", initials: "SK" },
  { quote: "The AI roadmap generation alone is worth 10x the price. Saves me hours every sprint.", name: "Marcus Chen", role: "CTO, Vercel", initials: "MC" },
  { quote: "Finally, a tool that thinks the way I do — messy first, structured later.", name: "Alex Rivera", role: "Founder, Arc", initials: "AR" },
  { quote: "We replaced three tools with this. It's the only thing on my second monitor now.", name: "Priya Shah", role: "Eng Manager, Linear", initials: "PS" },
  { quote: "It feels like having a co-founder who reads my brain at 3am.", name: "Jordan Wells", role: "Solo founder", initials: "JW" },
  { quote: "The threading and theme extraction is unreasonably good. I'm spoiled now.", name: "Tomás Reyes", role: "Design lead, Figma", initials: "TR" },
];

const TestimonialCard = ({ t }: { t: typeof testimonials[0] }) => (
  <div className="shrink-0 w-[340px] md:w-[380px] mx-3 p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-md">
    <Quote className="w-5 h-5 text-muted-foreground/30 mb-3" />
    <p className="text-[13px] text-foreground/85 leading-[1.7] mb-5 min-h-[80px]">"{t.quote}"</p>
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full bg-accent border border-border flex items-center justify-center text-[10px] font-bold">
        {t.initials}
      </div>
      <div className="min-w-0">
        <p className="text-[12px] font-semibold truncate">{t.name}</p>
        <p className="text-[10px] text-muted-foreground truncate">{t.role}</p>
      </div>
      <div className="ml-auto flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className="w-2.5 h-2.5 text-foreground fill-current" />
        ))}
      </div>
    </div>
  </div>
);

const LandingTestimonials = () => {
  // Duplicate the array for seamless infinite scroll
  const row1 = [...testimonials, ...testimonials];
  const row2 = [...testimonials.slice().reverse(), ...testimonials.slice().reverse()];

  return (
    <section className="relative py-28 px-0 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/40 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.18em] mb-5">
            <span className="w-1 h-1 rounded-full bg-foreground" />
            Loved by builders
          </span>
          <h2 className="text-3xl md:text-[3rem] font-bold tracking-[-0.035em] leading-[1.05]">
            Real teams.
            <span className="text-muted-foreground/70"> Real shipping velocity.</span>
          </h2>
        </motion.div>
      </div>

      {/* Edge fade masks */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Row 1 */}
        <div className="flex overflow-hidden mb-4">
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

        {/* Row 2 (reverse) */}
        <div className="flex overflow-hidden">
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
