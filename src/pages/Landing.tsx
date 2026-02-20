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
        ctx.strokeStyle = "hsla(142, 71%, 55%, 0.15)";
        ctx.lineWidth = 1;
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

      {/* Neural flow container */}
<div className="relative h-[420px] md:h-[380px]">
  {/* Canvas with animated neural lines + particles */}
  <NeuralFlowCanvas />

  {/* Grid layout: left | center | right */}
  <div className="absolute inset-0 grid grid-cols-3 items-center z-10">
    
    {/* Left: Source app nodes */}
    {/* Left: Source message cards — scattered groups */}
<div className="flex flex-col justify-center gap-12 pr-4">

  {/* ── Tweet Group ── */}
  <div style={{ position:"relative", width:300, height:190 }}>
    {[
      { name:"Thiruman", handle:"@piratethiru", time:"2m", text:"Just dumped 3 weeks of chaotic product notes into @DumpStashAI — got a full PRD, roadmap + theme clusters back in 30s. This is the future 🤯🔥", reply:"47", rt:"312", like:"2.1k", views:"89k", useAvatar:true },
      { name:"Priya Sharma", handle:"@priya_builds", time:"14m", text:"been using @DumpStashAI for a week. I type messy voice-to-text thoughts, it spits out structured ideas + PRDs. my PM life is changed 💀", reply:"31", rt:"198", like:"1.4k", views:"52k", useAvatar:false, grad:"linear-gradient(135deg,#f59e0b,#ef4444)", initials:"PS" },
      { name:"Jake Morrow", handle:"@jakemorrow_dev", time:"1h", text:"ok @DumpStashAI just turned my random 2am idea dump into a 12-step roadmap with milestones. I don't even know what to do rn", reply:"89", rt:"441", like:"3.8k", views:"121k", useAvatar:false, grad:"linear-gradient(135deg,#6366f1,#8b5cf6)", initials:"JM" },
    ].map((t, i) => (
      <motion.div key={i}
        initial={{ opacity:0, x:-30 }} whileInView={{ opacity:1, x:0 }}
        viewport={{ once:true }} transition={{ delay:i*0.1, duration:.5 }}
        style={{
          position:"absolute",
          transform:`translateX(${[0,18,-10][i]}px) translateY(${[0,-8,10][i]}px) rotate(${[-1.5,1.2,-0.8][i]}deg)`,
          width:280, background:"#000", border:"1px solid #2f3336", borderRadius:16,
          padding:"12px 14px", fontFamily:"-apple-system,'TwitterChirp',sans-serif",
          boxShadow:"0 4px 20px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:8 }}>
          {t.useAvatar
            ? <img src="https://pbs.twimg.com/profile_images/YOUR_PHOTO_ID/photo.jpg" alt="@piratethiru"
                onError={(e)=>{(e.target as HTMLImageElement).src="https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png"}}
                style={{ width:36,height:36,borderRadius:"50%",objectFit:"cover",flexShrink:0,background:"#333" }} />
            : <div style={{ width:36,height:36,borderRadius:"50%",background:(t as any).grad,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:12 }}>{(t as any).initials}</div>
          }
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ display:"flex",alignItems:"center",gap:3,marginBottom:1 }}>
              <span style={{ color:"#fff",fontSize:13,fontWeight:700 }}>{t.name}</span>
              <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#ffd700" d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91C3.38 9.33 2.5 10.57 2.5 12s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.26 3.91.8c.66 1.31 1.9 2.19 3.33 2.19s2.68-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81s1.26-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z"/></svg>
            </div>
            <span style={{ color:"#71767b",fontSize:11 }}>{t.handle} · {t.time}</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 1200 1227" fill="#71767b"><path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163Z"/></svg>
        </div>
        <p style={{ color:"#e7e9ea",fontSize:12,lineHeight:1.55,margin:"0 0 8px",wordBreak:"break-word" }}>
          {t.text.split("@DumpStashAI").map((p,j,arr)=> j<arr.length-1 ? <span key={j}>{p}<span style={{color:"#1d9bf0"}}>@DumpStashAI</span></span> : <span key={j}>{p}</span>)}
        </p>
        <div style={{ borderTop:"1px solid #2f3336",marginBottom:7 }} />
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",color:"#71767b" }}>
          {[
            [<svg key="r" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, t.reply, "#1d9bf0"],
            [<svg key="rt" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>, t.rt, "#00ba7c"],
            [<svg key="l" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>, t.like, "#f91880"],
            [<svg key="v" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>, t.views, "#1d9bf0"],
          ].map(([icon,count,hc],j)=>(
            <div key={j} style={{ display:"flex",alignItems:"center",gap:3,fontSize:11,cursor:"default",transition:"color .15s" }}
              onMouseEnter={e=>(e.currentTarget.style.color=hc as string)}
              onMouseLeave={e=>(e.currentTarget.style.color="#71767b")}
            >{icon}<span>{count}</span></div>
          ))}
        </div>
      </motion.div>
    ))}
  </div>

  {/* ── Slack Group ── */}
  <div style={{ position:"relative", width:300, height:160 }}>
    {[
      { workspace:"Product Team", channel:"ideas", emoji:"🧠", grad:"linear-gradient(135deg,#36c5f0,#2eb67d)", user:"Priya M.", time:"9:41 AM", text:"What if we auto-generate the PRD from the brain dump? 🤔 Could save hours per sprint honestly", reactions:[["🔥","12"],["👀","8"],["💡","5"]], unread:3 },
      { workspace:"Design Sync", channel:"feedback", emoji:"🎨", grad:"linear-gradient(135deg,#ecb22e,#e01e5a)", user:"James K.", time:"10:02 AM", text:"Roadmap from DumpStash is 🔥 — stakeholders actually understood the priorities for once", reactions:[["🚀","9"],["🙌","6"]], unread:0 },
      { workspace:"Growth", channel:"wins", emoji:"📈", grad:"linear-gradient(135deg,#2eb67d,#36c5f0)", user:"Ritu A.", time:"11:30 AM", text:"used DumpStash to prep for board meeting. dropped messy notes, got back a clean exec summary ✨", reactions:[["💯","15"],["🔥","11"]], unread:1 },
    ].map((s, i) => (
      <motion.div key={i}
        initial={{ opacity:0, x:-30 }} whileInView={{ opacity:1, x:0 }}
        viewport={{ once:true }} transition={{ delay:.15+i*0.1, duration:.5 }}
        style={{
          position:"absolute",
          transform:`translateX(${[0,16,-8][i]}px) translateY(${[0,-6,8][i]}px) rotate(${[1,-1.5,0.7][i]}deg)`,
          width:280, background:"#1a1d21", border:"1px solid #2d2d2d", borderRadius:12,
          overflow:"hidden", fontFamily:"Lato,-apple-system,sans-serif",
          boxShadow:"0 4px 20px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ background:"#19171d",borderBottom:"1px solid #2d2d2d",padding:"6px 12px",display:"flex",alignItems:"center",gap:7 }}>
          <div style={{ width:18,height:18,borderRadius:4,background:"linear-gradient(135deg,#e01e5a,#ecb22e)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <svg width="11" height="11" viewBox="0 0 54 54" fill="white"><path d="M19.712.133a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386h5.376V5.52A5.381 5.381 0 0 0 19.712.133m0 14.365H5.376A5.381 5.381 0 0 0 0 19.884a5.381 5.381 0 0 0 5.376 5.387h14.336a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386"/><path d="M53.76 19.884a5.381 5.381 0 0 0-5.376-5.386 5.381 5.381 0 0 0-5.376 5.386v5.387h5.376a5.381 5.381 0 0 0 5.376-5.387m-14.336 0V5.52A5.381 5.381 0 0 0 34.048.133a5.381 5.381 0 0 0-5.376 5.387v14.364a5.381 5.381 0 0 0 5.376 5.387 5.381 5.381 0 0 0 5.376-5.387"/><path d="M34.048 54a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386h-5.376v5.386A5.381 5.381 0 0 0 34.048 54m0-14.365h14.336a5.381 5.381 0 0 0 5.376-5.386 5.381 5.381 0 0 0-5.376-5.387H34.048a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386"/><path d="M0 34.249a5.381 5.381 0 0 0 5.376 5.386 5.381 5.381 0 0 0 5.376-5.386v-5.387H5.376A5.381 5.381 0 0 0 0 34.249m14.336 0v14.364A5.381 5.381 0 0 0 19.712 54a5.381 5.381 0 0 0 5.376-5.387V34.249a5.381 5.381 0 0 0-5.376-5.387 5.381 5.381 0 0 0-5.376 5.387"/></svg>
          </div>
          <span style={{ color:"#fff",fontSize:11,fontWeight:700 }}>{s.workspace}</span>
          <span style={{ color:"#97a0af",fontSize:10 }}>· #{s.channel}</span>
          {s.unread>0 && <div style={{ marginLeft:"auto",background:"#e01e5a",borderRadius:10,padding:"1px 6px",fontSize:9,color:"#fff",fontWeight:700 }}>{s.unread}</div>}
        </div>
        <div style={{ padding:"9px 12px",display:"flex",gap:8 }}>
          <div style={{ width:34,height:34,borderRadius:6,background:s.grad,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15 }}>{s.emoji}</div>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ display:"flex",alignItems:"baseline",gap:6,marginBottom:3 }}>
              <span style={{ color:"#fff",fontSize:12,fontWeight:700 }}>{s.user}</span>
              <span style={{ color:"#97a0af",fontSize:10 }}>Today {s.time}</span>
            </div>
            <p style={{ color:"#d1d2d3",fontSize:11,lineHeight:1.5,margin:"0 0 6px" }}>{s.text}</p>
            <div style={{ display:"flex",gap:4 }}>
              {s.reactions.map(([e,c])=>(
                <div key={e} style={{ background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:20,padding:"1px 7px",fontSize:10,color:"#d1d2d3",display:"flex",alignItems:"center",gap:3 }}>
                  <span>{e}</span><span style={{ color:"#97a0af" }}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    ))}
  </div>

  {/* ── Discord Group ── */}
  <div style={{ position:"relative", width:300, height:160 }}>
    {[
      { server:"BuildInPublic", channel:"🚀-launches", emoji:"👾", grad:"linear-gradient(135deg,#5865f2,#eb459e)", user:"n0mad_dev", role:"DEV", rc:"#5865f2", time:"11:15 AM", text:"Just shipped v0.3 — AI tagging for notes. Retention went up 40% 📈 Let's go 🔥", reactions:[["🔥","24"],["🚀","18"],["👏","11"]], online:142 },
      { server:"Indie Hackers", channel:"💡-ideas", emoji:"🦄", grad:"linear-gradient(135deg,#f59e0b,#10b981)", user:"solofounder", role:"MAKER", rc:"#10b981", time:"12:04 PM", text:"DumpStash turned my scattered Notion pages into an actual product roadmap in under a minute. how is this real", reactions:[["😭","19"],["🙏","14"]], online:87 },
      { server:"PM Community", channel:"🛠-tools", emoji:"🧩", grad:"linear-gradient(135deg,#8b5cf6,#3b82f6)", user:"pmAnna", role:"MOD", rc:"#8b5cf6", time:"2:22 PM", text:"pinning this — DumpStash is the best tool for async brain dumps. our team uses it before every sprint ✅", reactions:[["📌","31"],["💜","22"]], online:203 },
    ].map((d, i) => (
      <motion.div key={i}
        initial={{ opacity:0, x:-30 }} whileInView={{ opacity:1, x:0 }}
        viewport={{ once:true }} transition={{ delay:.3+i*0.1, duration:.5 }}
        style={{
          position:"absolute",
          transform:`translateX(${[0,18,-6][i]}px) translateY(${[0,-10,6][i]}px) rotate(${[-1,1.8,-0.6][i]}deg)`,
          width:280, background:"#313338", border:"1px solid #232428", borderRadius:12,
          overflow:"hidden", fontFamily:"'gg sans','Noto Sans',sans-serif",
          boxShadow:"0 4px 20px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ background:"#2b2d31",borderBottom:"1px solid #232428",padding:"6px 12px",display:"flex",alignItems:"center",gap:7 }}>
          <div style={{ width:18,height:18,borderRadius:"50%",background:"#5865f2",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.1.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
          </div>
          <span style={{ color:"#fff",fontSize:11,fontWeight:700 }}>{d.server}</span>
          <span style={{ color:"#949ba4",fontSize:10 }}># {d.channel}</span>
          <div style={{ marginLeft:"auto",display:"flex",alignItems:"center",gap:3 }}>
            <div style={{ width:6,height:6,borderRadius:"50%",background:"#23a559" }} />
            <span style={{ color:"#949ba4",fontSize:10 }}>{d.online}</span>
          </div>
        </div>
        <div style={{ padding:"9px 12px",display:"flex",gap:9 }}>
          <div style={{ position:"relative",flexShrink:0 }}>
            <div style={{ width:36,height:36,borderRadius:"50%",background:d.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>{d.emoji}</div>
            <div style={{ position:"absolute",bottom:0,right:0,width:9,height:9,borderRadius:"50%",background:"#23a559",border:"2px solid #313338" }} />
          </div>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ display:"flex",alignItems:"center",gap:5,marginBottom:3 }}>
              <span style={{ color:"#c9cdfb",fontSize:12,fontWeight:600 }}>{d.user}</span>
              <span style={{ background:d.rc,color:"#fff",fontSize:8,borderRadius:4,padding:"1px 4px",fontWeight:700 }}>{d.role}</span>
              <span style={{ color:"#949ba4",fontSize:10 }}>{d.time}</span>
            </div>
            <p style={{ color:"#dbdee1",fontSize:11,lineHeight:1.5,margin:"0 0 7px" }}>{d.text}</p>
            <div style={{ display:"flex",gap:4,flexWrap:"wrap" }}>
              {d.reactions.map(([e,c])=>(
                <div key={e} style={{ background:"rgba(88,101,242,0.15)",border:"1px solid rgba(88,101,242,0.3)",borderRadius:20,padding:"2px 7px",fontSize:11,color:"#dbdee1",display:"flex",alignItems:"center",gap:3 }}>
                  <span>{e}</span><span style={{ fontSize:10,color:"#c9cdfb",fontWeight:600 }}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    ))}
  </div>

</div>

    {/* Center: DumpStash hub — always perfectly centered */}
    <div className="flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.5 }}
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
    </div>

    {/* Right: Output nodes */}
    <div className="flex flex-col justify-center gap-3 pl-4">
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
