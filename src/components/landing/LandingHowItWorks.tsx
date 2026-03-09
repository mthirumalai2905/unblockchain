import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Dump everything",
    desc: "Type your raw thoughts, ideas, blockers, questions — no structure needed. Just get it out of your head.",
    color: "from-cf-idea/20",
  },
  {
    num: "02",
    title: "AI does the heavy lifting",
    desc: "Our AI classifies each dump, extracts themes, identifies actions, and surfaces patterns you'd miss.",
    color: "from-cf-action/20",
  },
  {
    num: "03",
    title: "Ship with confidence",
    desc: "Get structured PRDs, interactive roadmaps, and clear action items ready for your team.",
    color: "from-cf-decision/20",
  },
];

const LandingHowItWorks = () => {
  return (
    <section id="how-it-works" className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/40 text-[11px] font-medium text-muted-foreground uppercase tracking-[0.15em] mb-5">
            <span className="w-1 h-1 rounded-full bg-cf-decision" />
            How it works
          </span>
          <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.02em]">Three steps to clarity</h2>
        </motion.div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="group relative"
            >
              <div className="relative p-8 rounded-2xl border border-border bg-card/20 backdrop-blur-sm hover:bg-card/40 transition-all duration-300 overflow-hidden h-full">
                {/* Top gradient accent */}
                <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${step.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                
                {/* Step number */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full border border-border bg-background flex items-center justify-center relative z-10">
                    <span className="text-[13px] font-bold text-muted-foreground">{step.num}</span>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                </div>

                <h3 className="text-[18px] font-bold mb-3">{step.title}</h3>
                <p className="text-[13px] text-muted-foreground leading-[1.8]">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingHowItWorks;
