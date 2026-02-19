import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Zap,
  Brain,
  FileText,
  Map,
  Sparkles,
  MessageSquare,
  Slack,
  Github,
  Trello,
  Chrome,
  Figma,
  LayoutGrid,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] },
  }),
};

const connectorApps = [
  { icon: Slack, name: "Slack", color: "from-white/10 to-white/5" },
  { icon: Github, name: "GitHub", color: "from-white/10 to-white/5" },
  { icon: Trello, name: "Trello", color: "from-white/10 to-white/5" },
  { icon: Chrome, name: "Chrome", color: "from-white/10 to-white/5" },
  { icon: Figma, name: "Figma", color: "from-white/10 to-white/5" },
  { icon: MessageSquare, name: "Discord", color: "from-white/10 to-white/5" },
];

const features = [
  {
    icon: Brain,
    title: "AI Auto-Processing",
    desc: "Drop raw thoughts. AI classifies, labels, and extracts actionable insights instantly.",
  },
  {
    icon: FileText,
    title: "PRD Generation",
    desc: "One click transforms chaotic notes into polished product requirements documents.",
  },
  {
    icon: Map,
    title: "Interactive Roadmaps",
    desc: "AI generates step-by-step roadmaps from your ideas. Visualize the path to delivery.",
  },
  {
    icon: Sparkles,
    title: "Theme Extraction",
    desc: "Surfaces recurring patterns across dumps. See the bigger picture emerge automatically.",
  },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Noise overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
      }} />

      {/* Radial glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, hsl(0 0% 15% / 0.4) 0%, transparent 70%)",
        }}
      />

      {/* Nav */}
      <nav className="relative z-40 flex items-center justify-between px-6 md:px-12 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white to-white/60 flex items-center justify-center">
            <Zap className="w-4 h-4 text-background" />
          </div>
          <span className="text-[15px] font-bold tracking-tight">DumpStash</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full border border-border text-muted-foreground ml-1">AI</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[13px] text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#flow" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-[13px] text-muted-foreground hover:text-foreground" onClick={() => navigate("/dashboard")}>
            Log in
          </Button>
          <Button size="sm" className="text-[13px] h-9 px-4 bg-foreground text-background hover:bg-foreground/90 rounded-lg" onClick={() => navigate("/dashboard")}>
            Get Started
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-20 md:pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card/50 backdrop-blur-sm mb-8"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-cf-decision animate-pulse" />
            <span className="text-[11px] font-mono text-muted-foreground">Now in public beta</span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6"
          >
            <span className="cf-gradient-brand">Dump your chaos.</span>
            <br />
            <span className="text-muted-foreground">Ship with clarity.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="text-[15px] md:text-[17px] text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10"
          >
            DumpStash AI turns your raw brain dumps into structured ideas, product docs,
            and interactive roadmaps — powered by AI that thinks with you.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button
              size="lg"
              className="h-12 px-8 text-[14px] font-semibold bg-foreground text-background hover:bg-foreground/90 rounded-xl shadow-[0_0_30px_-5px_hsl(0_0%_100%_/_0.15)]"
              onClick={() => navigate("/dashboard")}
            >
              Start Dumping — Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-8 text-[14px] rounded-xl border-border hover:border-ring/50"
            >
              Watch Demo
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Connector Flow Section */}
      <section id="flow" className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">Integrations</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3 tracking-tight">
              Capture from <span className="cf-gradient-brand">everywhere</span>
            </h2>
          </motion.div>

          {/* Flow diagram */}
          <div className="relative flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
            {/* Source apps */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-3 md:grid-cols-2 gap-3"
            >
              {connectorApps.map((app, i) => (
                <motion.div
                  key={app.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  whileHover={{ scale: 1.05, borderColor: "hsl(0 0% 30%)" }}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-gradient-to-b from-card to-background cursor-default"
                >
                  <app.icon className="w-6 h-6 text-muted-foreground" />
                  <span className="text-[11px] font-mono text-muted-foreground">{app.name}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Connecting lines */}
            <div className="hidden md:flex items-center mx-6">
              <div className="flex items-center gap-1">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className="w-2 h-[2px] bg-gradient-to-r from-muted-foreground/50 to-muted-foreground/20 rounded-full"
                  />
                ))}
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/50 -ml-1" />
            </div>

            {/* Center: DumpStash */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="relative"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 to-transparent blur-xl" />
              <div className="relative p-8 md:p-10 rounded-2xl border border-border bg-card cf-border-glow">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-white to-white/60 flex items-center justify-center shadow-[0_0_40px_-5px_hsl(0_0%_100%_/_0.2)]">
                    <Zap className="w-7 h-7 text-background" />
                  </div>
                  <span className="text-[14px] font-bold">DumpStash AI</span>
                  <span className="text-[10px] font-mono text-muted-foreground">process → structure → ship</span>
                </div>
              </div>
            </motion.div>

            {/* Connecting lines */}
            <div className="hidden md:flex items-center mx-6">
              <ChevronRight className="w-4 h-4 text-muted-foreground/50 -mr-1" />
              <div className="flex items-center gap-1">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 + i * 0.05 }}
                    className="w-2 h-[2px] bg-gradient-to-r from-muted-foreground/20 to-muted-foreground/50 rounded-full"
                  />
                ))}
              </div>
            </div>

            {/* Output cards */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="grid grid-cols-1 gap-3"
            >
              {[
                { icon: LayoutGrid, label: "Structured Ideas", sub: "Auto-classified" },
                { icon: FileText, label: "PRD Documents", sub: "Ready to share" },
                { icon: Map, label: "Roadmaps", sub: "Interactive" },
              ].map((out, i) => (
                <motion.div
                  key={out.label}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  whileHover={{ scale: 1.03 }}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border bg-gradient-to-b from-card to-background"
                >
                  <out.icon className="w-5 h-5 text-foreground" />
                  <div>
                    <p className="text-[13px] font-semibold">{out.label}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">{out.sub}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">Features</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3 tracking-tight">
              Everything you need to <span className="cf-gradient-brand">think clearly</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                whileHover={{ borderColor: "hsl(0 0% 24%)" }}
                className="group relative p-6 md:p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm transition-colors"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-border flex items-center justify-center mb-5">
                    <f.icon className="w-5 h-5 text-foreground" />
                  </div>
                  <h3 className="text-[16px] font-semibold mb-2">{f.title}</h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-12 md:p-16 rounded-3xl border border-border bg-card/30 backdrop-blur-sm overflow-hidden"
          >
            {/* Glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] pointer-events-none"
              style={{
                background: "radial-gradient(ellipse, hsl(0 0% 20% / 0.5) 0%, transparent 70%)",
              }}
            />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Ready to dump <span className="cf-gradient-brand">smarter</span>?
              </h2>
              <p className="text-[14px] text-muted-foreground mb-8 max-w-lg mx-auto">
                Stop losing ideas in scattered notes. Let AI turn your chaos into clarity.
              </p>
              <Button
                size="lg"
                className="h-12 px-8 text-[14px] font-semibold bg-foreground text-background hover:bg-foreground/90 rounded-xl shadow-[0_0_40px_-5px_hsl(0_0%_100%_/_0.2)]"
                onClick={() => navigate("/dashboard")}
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-muted-foreground" />
            <span className="text-[13px] text-muted-foreground">DumpStash AI</span>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">© 2026 DumpStash. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
