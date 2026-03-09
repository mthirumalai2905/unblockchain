import { motion } from "framer-motion";
import { Brain, FileText, Map, Sparkles, Layers, Zap } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Auto-Processing",
    desc: "Drop raw thoughts. AI classifies, labels, and extracts actionable insights in seconds — not hours.",
    gradient: "from-blue-500/20 to-transparent",
  },
  {
    icon: FileText,
    title: "PRD Generation",
    desc: "One click transforms chaotic notes into polished product requirements. Share-ready, every time.",
    gradient: "from-emerald-500/20 to-transparent",
  },
  {
    icon: Map,
    title: "Interactive Roadmaps",
    desc: "AI generates step-by-step roadmaps from your ideas. Visualize the path from concept to delivery.",
    gradient: "from-violet-500/20 to-transparent",
  },
  {
    icon: Sparkles,
    title: "Theme Extraction",
    desc: "Surfaces recurring patterns across all your dumps. See the bigger picture emerge automatically.",
    gradient: "from-amber-500/20 to-transparent",
  },
  {
    icon: Layers,
    title: "Social Brainstorming",
    desc: "Collaborate with your team in real-time. Vote on ideas, create sub-groups, and ship together.",
    gradient: "from-pink-500/20 to-transparent",
  },
  {
    icon: Zap,
    title: "Instant Actions",
    desc: "Every dump gets analyzed for next steps. AI extracts to-dos, blockers, and decisions automatically.",
    gradient: "from-cyan-500/20 to-transparent",
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
          <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-[0.2em]">Features</span>
          <h2 className="text-3xl md:text-[2.75rem] font-bold mt-4 tracking-tight leading-[1.15]">
            Built for the way
            <br className="hidden md:block" />
            <span className="text-muted-foreground"> you actually think</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden border border-border">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="group relative bg-background p-8 md:p-10 hover:bg-card/50 transition-colors duration-300"
            >
              <div className={`absolute top-0 left-0 w-full h-px bg-gradient-to-r ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <f.icon className="w-5 h-5 text-muted-foreground mb-5" />
              <h3 className="text-[15px] font-semibold mb-2.5 text-foreground">{f.title}</h3>
              <p className="text-[13px] text-muted-foreground leading-[1.7]">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;
