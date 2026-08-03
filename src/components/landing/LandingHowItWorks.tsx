import { motion } from "framer-motion";
import { Brain, FileText, Sparkles } from "lucide-react";

const steps = [
  {
    num: "01",
    title: "Dump everything",
    tag: "INPUT",
    desc: "Type, paste, drop a link, attach an image, or record a voice note. No structure required.",
    visual: "dump" as const,
  },
  {
    num: "02",
    title: "AI does the heavy lifting",
    tag: "PROCESS",
    desc: "Dumps get classified, themed, and grouped. Todos, blockers, and decisions extract automatically.",
    visual: "ai" as const,
  },
  {
    num: "03",
    title: "Ship with confidence",
    tag: "OUTPUT",
    desc: "Generate a PRD or roadmap in one click. Share with your team and move from idea to delivery.",
    visual: "ship" as const,
  },
];

const StepVisual = ({ kind }: { kind: (typeof steps)[number]["visual"] }) => {
  return (
    <div className="relative w-full h-[180px] rounded-xl border border-border bg-card/40 backdrop-blur-md overflow-hidden p-4 flex flex-col">
      <div className="flex items-center gap-1.5 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-foreground/20" />
        <div className="w-1.5 h-1.5 rounded-full bg-foreground/20" />
        <div className="w-1.5 h-1.5 rounded-full bg-foreground/20" />
        <span className="ml-2 text-[9px] font-mono text-muted-foreground">
          {kind === "dump" ? "session.input" : kind === "ai" ? "engine.run" : "session.export"}
        </span>
      </div>

      {kind === "dump" && (
        <div className="space-y-1.5 flex-1">
          {["onboarding in 3 questions", "blocker: stripe webhooks", "ship MVP friday"].map((t) => (
            <div
              key={t}
              className="px-2.5 py-1.5 rounded-md bg-background/60 border border-border text-[11px] text-foreground/80 font-mono truncate"
            >
              {t}
            </div>
          ))}
        </div>
      )}

      {kind === "ai" && (
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
            <Sparkles className="w-3 h-3 text-foreground" />
            <span>analyzing · extracting…</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: "IDEA", text: "Onboarding" },
              { label: "BLOCKER", text: "Webhooks" },
              { label: "DECISION", text: "MVP friday" },
              { label: "QUESTION", text: "Pricing" },
            ].map((d) => (
              <div key={d.label} className="px-2 py-1.5 rounded-md border border-border bg-background/60">
                <div className="text-[8px] font-bold tracking-[0.12em] text-muted-foreground">{d.label}</div>
                <div className="text-[10px] font-medium">{d.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {kind === "ship" && (
        <div className="flex-1 space-y-2">
          <div className="rounded-md border border-border bg-background/60 p-2.5">
            <div className="flex items-center gap-2 mb-1.5">
              <FileText className="w-3 h-3 text-foreground" />
              <span className="text-[9px] font-mono text-muted-foreground">PRD · Onboarding v2</span>
            </div>
            <div className="space-y-1">
              <div className="h-1 w-3/4 bg-foreground rounded-full" />
              <div className="h-1 w-full bg-foreground/15 rounded-full" />
              <div className="h-1 w-5/6 bg-foreground/15 rounded-full" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-muted-foreground">
            <Brain className="w-2.5 h-2.5" />
            roadmap ready · 3 phases
          </div>
        </div>
      )}
    </div>
  );
};

const LandingHowItWorks = () => {
  return (
    <section id="how-it-works" className="relative px-4 sm:px-6 py-14 sm:py-16 md:py-20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-8 sm:mb-10 px-1"
        >
          <p className="lab-mono text-[11px] text-muted-foreground mb-3">
            how it works
          </p>
          <h2 className="font-display text-[1.75rem] sm:text-3xl md:text-[2.75rem] font-semibold tracking-[-0.045em] leading-[1.1]">
            Three steps
            <span className="text-muted-foreground"> from chaos to clarity</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-border bg-card/30 p-4 sm:p-5 flex flex-col gap-4 min-w-0"
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold tracking-[0.18em] text-muted-foreground">
                  {step.tag}
                </span>
                <div className="h-px flex-1 bg-border" />
                <span className="text-[11px] font-mono text-muted-foreground">{step.num}</span>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold tracking-[-0.02em] mb-2">{step.title}</h3>
                <p className="text-[13px] text-muted-foreground leading-[1.65]">{step.desc}</p>
              </div>
              <StepVisual kind={step.visual} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingHowItWorks;
