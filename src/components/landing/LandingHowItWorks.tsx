import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Brain, FileText, Sparkles } from "lucide-react";

const steps = [
  {
    num: "01",
    title: "Dump everything",
    tag: "INPUT",
    desc: "Type, paste, drop a link, attach an image, or record a voice note. No structure, no judgment. Just get it out of your head before you lose it.",
    visual: "dump",
  },
  {
    num: "02",
    title: "AI does the heavy lifting",
    tag: "PROCESS",
    desc: "Your dumps get classified, themed, and grouped. Recurring patterns surface. To-dos, blockers, decisions, and questions are extracted automatically.",
    visual: "ai",
  },
  {
    num: "03",
    title: "Ship with confidence",
    tag: "OUTPUT",
    desc: "Generate a full PRD or interactive roadmap from your session in one click. Share read or write access with your team. Move from idea to delivery.",
    visual: "ship",
  },
];

const StepVisual = ({ kind, active }: { kind: string; active: number }) => {
  return (
    <div className="relative w-full h-full rounded-2xl border border-border bg-card/40 backdrop-blur-md overflow-hidden p-6 flex flex-col">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 mb-5">
        <div className="w-2 h-2 rounded-full bg-foreground/20" />
        <div className="w-2 h-2 rounded-full bg-foreground/20" />
        <div className="w-2 h-2 rounded-full bg-foreground/20" />
        <span className="ml-2 text-[10px] font-mono text-muted-foreground">
          {kind === "dump" ? "session.input" : kind === "ai" ? "engine.run" : "session.export"}
        </span>
      </div>

      {kind === "dump" && (
        <div className="space-y-2.5 flex-1">
          {[
            "what if onboarding was just 3 questions",
            "blocker: stripe webhooks failing intermittently",
            "decision — ship MVP friday no matter what",
            "ask jess about the new pricing model",
          ].map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className="px-3 py-2 rounded-md bg-background/60 border border-border text-[12px] text-foreground/80 font-mono"
            >
              {t}
            </motion.div>
          ))}
        </div>
      )}

      {kind === "ai" && (
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
            <Sparkles className="w-3 h-3 text-foreground" />
            <span>analyzing 4 dumps · extracting patterns…</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "IDEA", text: "Onboarding rewrite" },
              { label: "BLOCKER", text: "Webhook retries" },
              { label: "DECISION", text: "MVP friday" },
              { label: "QUESTION", text: "Pricing model" },
            ].map((d, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.12 }}
                className="px-3 py-2.5 rounded-md border border-border bg-background/60"
              >
                <div className="text-[8px] font-bold tracking-[0.15em] text-muted-foreground mb-0.5">
                  {d.label}
                </div>
                <div className="text-[11px] font-medium">{d.text}</div>
              </motion.div>
            ))}
          </div>
          <div className="mt-auto pt-2 flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
            <Brain className="w-2.5 h-2.5" />
            themes: onboarding · billing · velocity
          </div>
        </div>
      )}

      {kind === "ship" && (
        <div className="flex-1 space-y-3">
          <div className="rounded-md border border-border bg-background/60 p-3">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-3 h-3 text-foreground" />
              <span className="text-[10px] font-mono text-muted-foreground">PRD · Onboarding v2</span>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 w-3/4 bg-foreground rounded-full" />
              <div className="h-1 w-full bg-foreground/15 rounded-full" />
              <div className="h-1 w-5/6 bg-foreground/15 rounded-full" />
              <div className="h-1 w-4/6 bg-foreground/15 rounded-full" />
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/60 p-3">
            <div className="text-[10px] font-mono text-muted-foreground mb-2">Roadmap · 3 phases</div>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-1">
                  <div className="w-5 h-5 rounded-full border-2 border-foreground/40 bg-background mx-auto mb-1.5 flex items-center justify-center text-[8px] font-bold">
                    {i}
                  </div>
                  <div className="h-1 bg-foreground/20 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LandingHowItWorks = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const cardLength = steps.length;
  const activeStep = useTransform(scrollYProgress, (latest) =>
    Math.min(cardLength - 1, Math.floor(latest * cardLength))
  );

  return (
    <section id="how-it-works" className="relative px-6">
      <div className="max-w-6xl mx-auto pt-20 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/40 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.18em] mb-5">
            <span className="w-1 h-1 rounded-full bg-foreground" />
            How it works
          </span>
          <h2 className="text-3xl md:text-[3rem] font-bold tracking-[-0.035em] leading-[1.05]">
            Three steps
            <span className="text-muted-foreground/70"> from chaos to clarity</span>
          </h2>
        </motion.div>
      </div>

      {/* Sticky scroll section */}
      <div ref={containerRef} className="relative max-w-6xl mx-auto px-6" style={{ height: `${cardLength * 60}vh` }}>
        <div className="sticky top-0 h-screen flex items-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 w-full items-center">
            {/* Left: text steps */}
            <div className="space-y-12">
              {steps.map((step, i) => (
                <StepText key={step.num} step={step} index={i} activeStep={activeStep} />
              ))}
            </div>

            {/* Right: sticky visual */}
            <div className="relative h-[420px] hidden md:block">
              {steps.map((step, i) => (
                <StickyVisual key={step.num} index={i} activeStep={activeStep} kind={step.visual} />
              ))}
            </div>
          </div>
        </div>
      </div>

      
    </section>
  );
};

const StepText = ({ step, index, activeStep }: any) => {
  const opacity = useTransform(activeStep, (v: number) => (v === index ? 1 : 0.35));
  return (
    <motion.div style={{ opacity }} transition={{ duration: 0.3 }} className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground">
          {step.tag}
        </span>
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] font-mono text-muted-foreground">{step.num}</span>
      </div>
      <h3 className="text-2xl md:text-3xl font-bold tracking-[-0.02em]">{step.title}</h3>
      <p className="text-[14px] text-muted-foreground leading-[1.75]">{step.desc}</p>
    </motion.div>
  );
};

const StickyVisual = ({ index, activeStep, kind }: any) => {
  const opacity = useTransform(activeStep, (v: number) => (v === index ? 1 : 0));
  const scale = useTransform(activeStep, (v: number) => (v === index ? 1 : 0.96));
  return (
    <motion.div style={{ opacity, scale }} className="absolute inset-0 transition-opacity">
      <StepVisual kind={kind} active={index} />
    </motion.div>
  );
};

export default LandingHowItWorks;
