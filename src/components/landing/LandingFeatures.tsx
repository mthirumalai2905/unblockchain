import { motion } from "framer-motion";
import { Brain, FileText, Map, Sparkles, Zap, MessageSquare } from "lucide-react";
import { useRef, useState } from "react";
import { useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface FeatureItem {
  icon: typeof Brain;
  title: string;
  desc: string;
  size: "lg" | "md" | "sm";
  visual: "process" | "doc" | "roadmap" | "themes" | "actions" | "share";
}

const features: FeatureItem[] = [
  {
    icon: Brain,
    title: "AI auto-processing",
    desc: "Drop raw thoughts. AI classifies, labels, and extracts insights in seconds — not hours.",
    size: "lg",
    visual: "process",
  },
  {
    icon: FileText,
    title: "PRD generation",
    desc: "One click turns chaos into polished product docs. Share-ready, every time.",
    size: "md",
    visual: "doc",
  },
  {
    icon: Map,
    title: "Interactive roadmaps",
    desc: "AI charts a path from concept to delivery, phase by phase.",
    size: "md",
    visual: "roadmap",
  },
  {
    icon: Sparkles,
    title: "Theme extraction",
    desc: "Surfaces recurring patterns across all your dumps. The big picture, automatically.",
    size: "lg",
    visual: "themes",
  },
  {
    icon: Zap,
    title: "Instant actions",
    desc: "Every dump analyzed for next steps. To-dos, blockers, decisions — captured.",
    size: "md",
    visual: "actions",
  },
  {
    icon: MessageSquare,
    title: "Granular sharing",
    desc: "Invite collaborators with read or write access on a per-session basis.",
    size: "md",
    visual: "share",
  },
];

const FeatureVisual = ({ kind }: { kind: FeatureItem["visual"] }) => {
  switch (kind) {
    case "process":
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="space-y-2 w-full max-w-sm">
            {["raw thought goes in", "ai parses + classifies", "structured output"].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-background/50"
              >
                <span className="text-[9px] font-mono text-muted-foreground tabular-nums">0{i + 1}</span>
                <span className="text-[11px] text-foreground/80">{t}</span>
                <div className="ml-auto h-1 flex-1 max-w-[60px] rounded-full bg-foreground/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.15, duration: 0.6 }}
                    className="h-full bg-foreground"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      );
    case "doc":
      return (
        <div className="relative h-full flex items-end justify-center">
          <div className="rounded-md border border-border bg-background/60 p-3 w-full">
            <div className="h-1.5 w-2/3 bg-foreground rounded-full mb-2" />
            <div className="h-1 w-full bg-foreground/15 rounded-full mb-1" />
            <div className="h-1 w-5/6 bg-foreground/15 rounded-full mb-1" />
            <div className="h-1 w-4/6 bg-foreground/15 rounded-full" />
          </div>
        </div>
      );
    case "roadmap":
      return (
        <div className="h-full flex items-center justify-center">
          <div className="flex items-center gap-2 w-full">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1">
                <div className="w-5 h-5 rounded-full border-2 border-foreground/40 bg-background mx-auto mb-1.5 flex items-center justify-center text-[8px] font-bold">
                  {i}
                </div>
                <div className="h-1 bg-foreground/15 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      );
    case "themes":
      return (
        <div className="h-full flex items-center justify-center flex-wrap gap-1.5">
          {["onboarding", "billing", "ai/ml", "growth", "infra", "design"].map((t, i) => (
            <motion.span
              key={t}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="px-2 py-0.5 rounded-md text-[10px] font-medium border border-border bg-background/60 text-foreground/80"
            >
              #{t}
            </motion.span>
          ))}
        </div>
      );
    case "actions":
      return (
        <div className="h-full flex flex-col justify-center gap-1.5">
          {["Wire up Stripe webhooks", "Decision: ship MVP friday"].map((t, i) => (
            <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-background/60 border border-border">
              <div className="w-3 h-3 rounded-sm border border-foreground/40 shrink-0" />
              <span className="text-[10px] text-foreground/80 truncate">{t}</span>
            </div>
          ))}
        </div>
      );
    case "share":
      return (
        <div className="h-full flex items-center justify-center">
          <div className="flex -space-x-2">
            {["AK", "MJ", "RP", "SV"].map((init, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-card border-2 border-background flex items-center justify-center text-[10px] font-bold text-foreground"
              >
                {init}
              </div>
            ))}
            <div className="w-8 h-8 rounded-full bg-foreground border-2 border-background flex items-center justify-center text-[9px] font-bold text-background">
              +3
            </div>
          </div>
        </div>
      );
  }
};

const ModernBentoCard = ({ feature, className }: { feature: FeatureItem; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 300, damping: 30 });
  const Icon = feature.icon;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card/30 backdrop-blur-sm p-6 hover:bg-card/60 transition-colors flex flex-col",
        className
      )}
    >
      {/* Cursor follow gradient */}
      {hovered && (
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(360px circle at ${springX.get()}px ${springY.get()}px, hsl(var(--foreground) / 0.06), transparent 60%)`,
          }}
        />
      )}

      {/* Top conic border */}
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, hsl(var(--foreground)) 50%, transparent 100%)",
        }}
      />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-md border border-border bg-background/60 flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 text-foreground" />
          </div>
        </div>
        <h3 className="text-[16px] font-semibold mb-2 tracking-tight">{feature.title}</h3>
        <p className="text-[13px] text-muted-foreground leading-[1.65] mb-5">{feature.desc}</p>
        {/* Visual */}
        <div className="mt-auto h-24 rounded-lg border border-border/60 bg-background/30 p-3 overflow-hidden">
          <FeatureVisual kind={feature.visual} />
        </div>
      </div>
    </motion.div>
  );
};

const LandingFeatures = () => {
  return (
    <section id="features" className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/40 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.18em] mb-5">
            <span className="w-1 h-1 rounded-full bg-foreground" />
            Capabilities
          </span>
          <h2 className="text-3xl md:text-[3rem] font-bold tracking-[-0.035em] leading-[1.05]">
            Built for the way
            <br className="hidden md:block" />
            <span className="text-muted-foreground/70"> you actually think</span>
          </h2>
        </motion.div>

        {/* Asymmetric bento */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 md:gap-4 auto-rows-[260px]">
          <ModernBentoCard feature={features[0]} className="md:col-span-4" />
          <ModernBentoCard feature={features[1]} className="md:col-span-2" />
          <ModernBentoCard feature={features[2]} className="md:col-span-2" />
          <ModernBentoCard feature={features[3]} className="md:col-span-4" />
          <ModernBentoCard feature={features[4]} className="md:col-span-3" />
          <ModernBentoCard feature={features[5]} className="md:col-span-3" />
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;
