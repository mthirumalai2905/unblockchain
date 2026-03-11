import { motion } from "framer-motion";
import { Zap, Globe, FileText, Brain, Layers, GitBranch } from "lucide-react";

const integrations = [
  { icon: Globe, label: "Twitter/X", desc: "Import tweets & threads" },
  { icon: FileText, label: "Markdown", desc: "Export anywhere" },
  { icon: Brain, label: "AI Models", desc: "Multi-model processing" },
  { icon: Layers, label: "PDF Export", desc: "Share roadmaps" },
  { icon: GitBranch, label: "Sub-groups", desc: "Branch ideas" },
  { icon: Zap, label: "Real-time", desc: "Instant sync" },
];

const LandingIntegrations = () => {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/40 text-[11px] font-medium text-muted-foreground uppercase tracking-[0.15em] mb-5">
            <span className="w-1 h-1 rounded-full bg-cf-question" />
            Ecosystem
          </span>
          <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.02em]">
            Connects with your
            <br />
            <span className="text-muted-foreground">existing workflow</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {integrations.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group relative p-6 rounded-2xl border border-border bg-card/10 hover:bg-card/30 backdrop-blur-sm transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-4 group-hover:bg-foreground/5 transition-colors">
                <item.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <h3 className="text-[14px] font-semibold mb-1">{item.label}</h3>
              <p className="text-[12px] text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingIntegrations;
