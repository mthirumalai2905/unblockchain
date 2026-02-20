import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useCallback } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
// Updated DumpStash AI center alignment

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] },
  }),
};
const SidebarStyles = 'w-[160px] md:w-[180px]';

const connectorApps = [
  { icon: Slack, name: "Slack" },
  { icon: Github, name: "GitHub" },
  { icon: Trello, name: "Trello" },
  { icon: Chrome, name: "Chrome" },
  { icon: Figma, name: "Figma" },
  { icon: MessageSquare, name: "Discord" },
];
// Existing code where the sidebars are used
const LeftSidebar = () => <div className={SidebarStyles}>Left Sidebar Content</div>;
const RightSidebar = () => <div className={SidebarStyles}>Right Sidebar Content</div>;

const outputItems = [
  { icon: LayoutGrid, label: "Structured Ideas", sub: "Auto-classified" },
  { icon: FileText, label: "PRD Documents", sub: "Ready to share" },
  { icon: Map, label: "Roadmaps", sub: "Interactive" },
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

/* ───── Neural Flow Canvas ───── */
const NeuralFlowCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Define neural paths (bezier curves from left nodes to center, center to right nodes)
    const leftNodes = [
      { x: 0.08, y: 0.12 }, { x: 0.08, y: 0.32 }, { x: 0.08, y: 0.52 },
      { x: 0.08, y: 0.72 }, { x: 0.08, y: 0.88 }, { x: 0.14, y: 0.48 },
    ];
    const center = { x: 0.5, y: 0.5 };
    const rightNodes = [
      { x: 0.92, y: 0.25 }, { x: 0.92, y: 0.5 }, { x: 0.92, y: 0.75 },
    ];

    interface Particle {
      path: { sx: number; sy: number; cp1x: number; cp1y: number; cp2x: number; cp2y: number; ex: number; ey: number };
      t: number;
      speed: number;
      size: number;
      opacity: number;
    }

    const particles: Particle[] = [];

    const makePath = (from: { x: number; y: number }, to: { x: number; y: number }) => {
      const mx = (from.x + to.x) / 2;
      const jitter = () => (Math.random() - 0.5) * 0.08;
      return {
        sx: from.x, sy: from.y,
        cp1x: mx - 0.05 + jitter(), cp1y: from.y + jitter(),
        cp2x: mx + 0.05 + jitter(), cp2y: to.y + jitter(),
        ex: to.x, ey: to.y,
      };
    };

    const spawnParticle = () => {
      const isLeft = Math.random() > 0.35;
      const from = isLeft
        ? leftNodes[Math.floor(Math.random() * leftNodes.length)]
        : center;
      const to = isLeft
        ? center
        : rightNodes[Math.floor(Math.random() * rightNodes.length)];
      particles.push({
        path: makePath(from, to),
        t: 0,
        speed: 0.003 + Math.random() * 0.004,
        size: 1.5 + Math.random() * 2,
        opacity: 0.4 + Math.random() * 0.5,
      });
    };

    let frame = 0;
    const draw = () => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      // Draw static neural lines
      ctx.lineWidth = 0.5;
      const allPaths = [
        ...leftNodes.map((n) => makePath(n, center)),
        ...rightNodes.map((n) => makePath(center, n)),
      ];
      allPaths.forEach((p) => {
        ctx.beginPath();
        ctx.moveTo(p.sx * w, p.sy * h);
        ctx.bezierCurveTo(p.cp1x * w, p.cp1y * h, p.cp2x * w, p.cp2y * h, p.ex * w, p.ey * h);
        ctx.strokeStyle = "hsla(0, 0%, 25%, 0.3)";
        ctx.stroke();
      });

      // Spawn particles
      if (frame % 8 === 0) spawnParticle();

      // Update & draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.t += p.speed;
        if (p.t > 1) { particles.splice(i, 1); continue; }

        const { sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey } = p.path;
        const t = p.t;
        const u = 1 - t;
        const px = u * u * u * sx + 3 * u * u * t * cp1x + 3 * u * t * t * cp2x + t * t * t * ex;
        const py = u * u * u * sy + 3 * u * u * t * cp1y + 3 * u * t * t * cp2y + t * t * t * ey;

        // Glow trail
        const fadeInOut = Math.sin(t * Math.PI);
        const gradient = ctx.createRadialGradient(px * w, py * h, 0, px * w, py * h, p.size * 4);
        gradient.addColorStop(0, `hsla(142, 71%, 55%, ${fadeInOut * p.opacity * 0.6})`);
        gradient.addColorStop(1, `hsla(142, 71%, 55%, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(px * w, py * h, p.size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(px * w, py * h, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(142, 71%, 60%, ${fadeInOut * p.opacity})`;
        ctx.fill();
      }

      frame++;
      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

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
        style={{ background: "radial-gradient(ellipse at center, hsl(0 0% 15% / 0.4) 0%, transparent 70%)" }}
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
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card/50 backdrop-blur-sm mb-8"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-cf-decision animate-pulse" />
            <span className="text-[11px] font-mono text-muted-foreground">Now in public beta</span>
          </motion.div>

          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6"
          >
            <span className="cf-gradient-brand">Dump your chaos.</span>
            <br />
            <span className="text-muted-foreground">Ship with clarity.</span>
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
              className="h-12 px-8 text-[14px] font-semibold bg-foreground text-background hover:bg-foreground/90 rounded-xl shadow-[0_0_30px_-5px_hsl(0_0%_100%_/_0.15)]"
              onClick={() => navigate("/dashboard")}
            >
              Start Dumping — Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8 text-[14px] rounded-xl border-border hover:border-ring/50">
              Watch Demo
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ═══ Neural Flow Connector Section ═══ */}
      <section id="flow" className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">Integrations</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3 tracking-tight">
              Capture from <span className="cf-gradient-brand">everywhere</span>
            </h2>
          </motion.div>

          {/* Neural flow container */}
          <div className="relative h-[420px] md:h-[380px]">
            {/* Canvas with animated neural lines + particles */}
            <NeuralFlowCanvas />

            {/* Left: Source app nodes */}
            <div className="absolute left-0 top-0 bottom-0 w-[140px] md:w-[160px] flex flex-col justify-center gap-2 z-10">
              {connectorApps.map((app, i) => (
                <motion.div
                  key={app.name}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  whileHover={{ scale: 1.08, boxShadow: "0 0 20px -3px hsla(142, 71%, 55%, 0.15)" }}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-card/80 backdrop-blur-sm cursor-default transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center shrink-0">
                    <app.icon className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground">{app.name}</span>
                </motion.div>
              ))}
            </div>

            {/* Center: DumpStash hub */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
            >
              <div className="relative">
                {/* Pulsing rings */}
                <div className="absolute inset-0 -m-4 rounded-3xl border border-cf-decision/10 animate-pulse" />
                <div className="absolute inset-0 -m-8 rounded-3xl border border-cf-decision/5" />

                <div className="relative p-8 md:p-10 rounded-2xl border border-border bg-card/90 backdrop-blur-md"
                  style={{ boxShadow: "0 0 60px -10px hsla(142, 71%, 55%, 0.12), 0 0 0 1px hsl(0 0% 20%)" }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-white to-white/60 flex items-center justify-center"
                      style={{ boxShadow: "0 0 40px -5px hsla(0, 0%, 100%, 0.2)" }}
                    >
                      <Zap className="w-7 h-7 text-background" />
                    </div>
                    <span className="text-[14px] font-bold">DumpStash AI</span>
                    <span className="text-[10px] font-mono text-muted-foreground">process → structure → ship</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Output nodes */}
            <div className="absolute right-0 top-0 bottom-0 w-[160px] md:w-[180px] flex flex-col justify-center gap-3 z-10">
              {outputItems.map((out, i) => (
                <motion.div
                  key={out.label}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px -3px hsla(142, 71%, 55%, 0.12)" }}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl border border-border bg-card/80 backdrop-blur-sm transition-all"
                >
                  <out.icon className="w-4 h-4 text-foreground shrink-0" />
                  <div>
                    <p className="text-[12px] font-semibold leading-tight">{out.label}</p>
                    <p className="text-[9px] font-mono text-muted-foreground">{out.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
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
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                whileHover={{ borderColor: "hsl(0 0% 24%)" }}
                className="group relative p-6 md:p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm transition-colors"
              >
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
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative p-12 md:p-16 rounded-3xl border border-border bg-card/30 backdrop-blur-sm overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] pointer-events-none"
              style={{ background: "radial-gradient(ellipse, hsl(0 0% 20% / 0.5) 0%, transparent 70%)" }}
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
// Rest of the Landing component
