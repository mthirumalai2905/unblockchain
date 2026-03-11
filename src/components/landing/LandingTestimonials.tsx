import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "DumpStash replaced my entire note-taking stack. I just dump and it organizes everything.",
    name: "Sarah Kim",
    role: "Product Lead, Stripe",
    initials: "SK",
  },
  {
    quote: "The AI roadmap generation alone is worth 10x the price. Saves me hours every sprint.",
    name: "Marcus Chen",
    role: "CTO, Vercel",
    initials: "MC",
  },
  {
    quote: "Finally, a tool that thinks the way I do — messy first, structured later.",
    name: "Alex Rivera",
    role: "Founder, Arc Browser",
    initials: "AR",
  },
];

const LandingTestimonials = () => {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/40 text-[11px] font-medium text-muted-foreground uppercase tracking-[0.15em] mb-5">
            <span className="w-1 h-1 rounded-full bg-cf-action" />
            Testimonials
          </span>
          <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.02em]">
            Builders love
            <span className="text-muted-foreground"> DumpStash</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative p-8 rounded-2xl border border-border bg-card/20 backdrop-blur-sm hover:bg-card/40 transition-all duration-300 group"
            >
              <Quote className="w-8 h-8 text-muted-foreground/20 mb-4" />
              <p className="text-[14px] text-foreground/80 leading-[1.8] mb-6">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent border border-border flex items-center justify-center text-[11px] font-bold text-muted-foreground">
                  {t.initials}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">{t.name}</p>
                  <p className="text-[11px] text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingTestimonials;
