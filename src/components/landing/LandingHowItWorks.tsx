import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Dump everything",
    desc: "Type your raw thoughts, ideas, blockers, questions — no structure needed. Just get it out of your head.",
  },
  {
    num: "02",
    title: "AI does the heavy lifting",
    desc: "Our AI classifies each dump, extracts themes, identifies actions, and surfaces patterns you'd miss.",
  },
  {
    num: "03",
    title: "Ship with confidence",
    desc: "Get structured PRDs, interactive roadmaps, and clear action items ready for your team.",
  },
];

const LandingHowItWorks = () => {
  return (
    <section id="how-it-works" className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-[0.2em]">How it works</span>
          <h2 className="text-3xl md:text-[2.75rem] font-bold mt-4 tracking-tight">Three steps to clarity</h2>
        </motion.div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-border hidden md:block" />

          <div className="space-y-16 md:space-y-24">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`relative flex flex-col md:flex-row items-start gap-8 ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}
              >
                <div className={`flex-1 ${i % 2 === 1 ? "md:text-right" : ""}`}>
                  <span className="text-[48px] md:text-[64px] font-extrabold text-foreground/[0.04] leading-none block">{step.num}</span>
                  <h3 className="text-[20px] font-bold mt-[-8px] mb-3">{step.title}</h3>
                  <p className="text-[14px] text-muted-foreground leading-[1.7] max-w-sm">{step.desc}</p>
                </div>
                <div className="hidden md:flex items-center justify-center relative z-10">
                  <div className="w-10 h-10 rounded-full bg-background border-2 border-border flex items-center justify-center text-[13px] font-bold text-muted-foreground">
                    {step.num}
                  </div>
                </div>
                <div className="flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHowItWorks;
