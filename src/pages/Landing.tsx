import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Zap, Brain, FileText, Map, Sparkles, Check, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] },
  }),
};

const features = [
  { icon: Brain, title: "AI Auto-Processing", desc: "Drop raw thoughts. AI classifies, labels, and extracts actionable insights instantly." },
  { icon: FileText, title: "PRD Generation", desc: "One click transforms chaotic notes into polished product requirements documents." },
  { icon: Map, title: "Interactive Roadmaps", desc: "AI generates step-by-step roadmaps from your ideas. Visualize the path to delivery." },
  { icon: Sparkles, title: "Theme Extraction", desc: "Surfaces recurring patterns across dumps. See the bigger picture emerge automatically." },
];

const pricingPlans = [
  {
    name: "Basic",
    price: "$0",
    period: "forever",
    description: "For individuals getting started",
    features: [
      "1 brainstorming session",
      "AI-powered dump processing",
      "Basic theme extraction",
      "Export to markdown",
      "Community support",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Premium",
    price: "$19",
    period: "/month",
    description: "For power users & small teams",
    features: [
      "10 concurrent sessions",
      "Unlimited AI processing",
      "PRD & roadmap generation",
      "Twitter Intelligence connector",
      "PDF & markdown export",
      "Priority support",
      "Session data persistence",
    ],
    cta: "Upgrade to Premium",
    popular: true,
  },
  {
    name: "Advanced",
    price: "$49",
    period: "/month",
    description: "For teams that ship fast",
    features: [
      "Unlimited sessions",
      "Unlimited AI processing",
      "All connectors (Twitter, Slack, Discord)",
      "PRD, roadmap & timeline generation",
      "Team collaboration (coming soon)",
      "Custom AI model tuning",
      "Dedicated support & SLA",
      "API access",
    ],
    cta: "Go Advanced",
    popular: false,
  },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Noise overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
      }} />

      {/* Gradient orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none opacity-20"
        style={{ background: "radial-gradient(circle, hsl(262 83% 58% / 0.3) 0%, transparent 70%)" }} />
      <div className="fixed top-[10%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none opacity-15"
        style={{ background: "radial-gradient(circle, hsl(217 91% 60% / 0.25) 0%, transparent 70%)" }} />
      <div className="fixed bottom-[-10%] left-[30%] w-[700px] h-[700px] rounded-full pointer-events-none opacity-10"
        style={{ background: "radial-gradient(circle, hsl(142 71% 45% / 0.2) 0%, transparent 70%)" }} />

      {/* Nav */}
      <nav className="relative z-40 flex items-center justify-between px-6 md:px-12 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-foreground to-foreground/60 flex items-center justify-center">
            <Zap className="w-4 h-4 text-background" />
          </div>
          <span className="text-[15px] font-bold tracking-tight">DumpStash</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full border border-border text-muted-foreground ml-1">AI</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[13px] text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-[13px] text-muted-foreground hover:text-foreground" onClick={() => navigate("/auth")}>
            Log in
          </Button>
          <Button size="sm" className="text-[13px] h-9 px-4 bg-foreground text-background hover:bg-foreground/90 rounded-lg" onClick={() => navigate("/auth")}>
            Get Started
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-24 md:pt-36 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card/50 backdrop-blur-sm mb-8"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-cf-decision animate-pulse" />
            <span className="text-[11px] font-mono text-muted-foreground">Now in public beta</span>
          </motion.div>

          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.02] mb-6"
          >
            <span className="bg-gradient-to-b from-foreground via-foreground/90 to-foreground/50 bg-clip-text text-transparent">Dump your chaos.</span>
            <br />
            <span className="bg-gradient-to-r from-muted-foreground/80 via-muted-foreground/60 to-muted-foreground/40 bg-clip-text text-transparent">Ship with clarity.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="text-[15px] md:text-[17px] text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10"
          >
            DumpStash AI turns your raw brain dumps into structured ideas, product docs,
            and interactive roadmaps — powered by AI that thinks with you.
          </motion.p>

          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button
              size="lg"
              className="h-12 px-8 text-[14px] font-semibold bg-foreground text-background hover:bg-foreground/90 rounded-xl shadow-[0_0_40px_-8px_hsl(0_0%_100%_/_0.2)]"
              onClick={() => navigate("/auth")}
            >
              Start Dumping — Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8 text-[14px] rounded-xl border-border hover:border-ring/50">
              Watch Demo
            </Button>
          </motion.div>

          {/* Subtle grid lines behind hero */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: `linear-gradient(hsl(0 0% 50%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 50%) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }} />
          </div>
        </div>
      </section>

      {/* Bento-style feature grid */}
      <section id="features" className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">Features</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-3 tracking-tight">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">think clearly</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className="group relative p-8 rounded-2xl border border-border bg-card/30 backdrop-blur-sm transition-all hover:border-ring/30 hover:bg-card/50"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-foreground/10 to-foreground/5 border border-border flex items-center justify-center mb-5">
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

      {/* How it works */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">How it works</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-3 tracking-tight">Three steps to clarity</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Dump everything", desc: "Type your raw thoughts, ideas, blockers — no structure needed." },
              { step: "02", title: "AI processes", desc: "Our AI classifies, extracts themes, actions, and questions automatically." },
              { step: "03", title: "Ship with clarity", desc: "Get PRDs, roadmaps, and structured outputs ready for your team." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className="relative p-6 rounded-2xl border border-border bg-card/20 text-center"
              >
                <span className="text-[40px] font-extrabold bg-gradient-to-b from-foreground/15 to-transparent bg-clip-text text-transparent">{item.step}</span>
                <h3 className="text-[15px] font-semibold mt-2 mb-2">{item.title}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">Pricing</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-3 tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-[14px] text-muted-foreground mt-4 max-w-lg mx-auto">Start free. Upgrade when you need more power.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className={`relative p-6 md:p-8 rounded-2xl border transition-all ${
                  plan.popular
                    ? "border-foreground/20 bg-card/60 shadow-[0_0_60px_-15px_hsl(0_0%_100%_/_0.08)]"
                    : "border-border bg-card/20 hover:border-ring/30"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full bg-foreground text-background text-[10px] font-semibold">
                    <Star className="w-3 h-3" /> Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-[15px] font-semibold mb-1">{plan.name}</h3>
                  <p className="text-[12px] text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold">{plan.price}</span>
                    <span className="text-[13px] text-muted-foreground">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-[13px]">
                      <Check className="w-4 h-4 text-cf-decision shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full h-10 text-[13px] font-medium rounded-xl ${
                    plan.popular
                      ? "bg-foreground text-background hover:bg-foreground/90"
                      : "bg-accent text-foreground hover:bg-accent/80 border border-border"
                  }`}
                  onClick={() => navigate("/auth")}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative p-12 md:p-16 rounded-3xl border border-border bg-card/20 backdrop-blur-sm overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.02] via-transparent to-foreground/[0.01]" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Ready to dump{" "}
                <span className="bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">smarter</span>?
              </h2>
              <p className="text-[14px] text-muted-foreground mb-8 max-w-lg mx-auto">
                Stop losing ideas in scattered notes. Let AI turn your chaos into clarity.
              </p>
              <Button
                size="lg"
                className="h-12 px-8 text-[14px] font-semibold bg-foreground text-background hover:bg-foreground/90 rounded-xl shadow-[0_0_40px_-8px_hsl(0_0%_100%_/_0.2)]"
                onClick={() => navigate("/auth")}
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
