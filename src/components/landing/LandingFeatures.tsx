import { motion } from "framer-motion";
import { Brain, FileText, Map, Sparkles, Layers, Zap } from "lucide-react";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";

const features = [
  {
    icon: <Brain className="w-5 h-5" />,
    title: "AI Auto-Processing",
    desc: "Drop raw thoughts. AI classifies, labels, and extracts actionable insights in seconds — not hours.",
    className: "md:col-span-2",
  },
  {
    icon: <FileText className="w-5 h-5" />,
    title: "PRD Generation",
    desc: "One click transforms chaotic notes into polished product requirements. Share-ready, every time.",
    className: "",
  },
  {
    icon: <Map className="w-5 h-5" />,
    title: "Interactive Roadmaps",
    desc: "AI generates step-by-step roadmaps from your ideas. Visualize the path from concept to delivery.",
    className: "",
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: "Theme Extraction",
    desc: "Surfaces recurring patterns across all your dumps. See the bigger picture emerge automatically.",
    className: "md:col-span-2",
  },
  {
    icon: <Layers className="w-5 h-5" />,
    title: "Social Brainstorming",
    desc: "Collaborate with your team in real-time. Vote on ideas, create sub-groups, and ship together.",
    className: "md:col-span-2",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Instant Actions",
    desc: "Every dump gets analyzed for next steps. AI extracts to-dos, blockers, and decisions automatically.",
    className: "",
  },
];

const LandingFeatures = () => {
  return (
    <section id="features" className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/40 text-[11px] font-medium text-muted-foreground uppercase tracking-[0.15em] mb-5"
          >
            <span className="w-1 h-1 rounded-full bg-cf-idea" />
            Features
          </motion.span>
          <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.02em] leading-[1.15]">
            Built for the way
            <br className="hidden md:block" />
            <span className="text-muted-foreground"> you actually think</span>
          </h2>
        </motion.div>

        <BentoGrid className="gap-4">
          {features.map((f, i) => (
            <BentoCard
              key={f.title}
              title={f.title}
              description={f.desc}
              icon={f.icon}
              className={f.className}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
};

export default LandingFeatures;
