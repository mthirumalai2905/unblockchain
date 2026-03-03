import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, User, ArrowRight, Loader2, Brain, FileText, Map } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName || email.split("@")[0] },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account!");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — dark branding */}
      <div className="hidden lg:flex flex-1 bg-background relative overflow-hidden flex-col justify-between p-12">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `linear-gradient(hsl(0 0% 50%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 50%) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }} />

        {/* Gradient orbs */}
        <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(262 83% 58% / 0.3) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] rounded-full opacity-15 pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(142 71% 45% / 0.2) 0%, transparent 70%)" }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-foreground flex items-center justify-center">
            <Zap className="w-5 h-5 text-background" />
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">DumpStash</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full border border-border text-muted-foreground">AI</span>
        </div>

        {/* Center content */}
        <div className="relative z-10 max-w-md">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.1] mb-4"
          >
            <span className="bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent">
              Turn chaos into clarity.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-[14px] text-muted-foreground leading-relaxed mb-8"
          >
            AI-powered workspace that transforms your raw brain dumps into structured insights, PRDs, and roadmaps.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-3"
          >
            {[
              { icon: Brain, text: "AI auto-classifies your thoughts" },
              { icon: FileText, text: "Generate PRDs in one click" },
              { icon: Map, text: "Interactive roadmap builder" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border bg-card/30">
                <item.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-[13px] text-foreground/70">{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10">
          <p className="text-[11px] font-mono text-muted-foreground/50">
            "The best ideas start as messy thoughts."
          </p>
        </div>
      </div>

      {/* Right panel — white form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12" style={{ background: "hsl(0 0% 98%)" }}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 justify-center mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "hsl(0 0% 8%)" }}>
              <Zap className="w-4 h-4" style={{ color: "hsl(0 0% 98%)" }} />
            </div>
            <span className="text-lg font-bold tracking-tight" style={{ color: "hsl(0 0% 8%)" }}>DumpStash</span>
          </div>

          <h2 className="text-[22px] font-bold mb-1" style={{ color: "hsl(0 0% 8%)" }}>
            {isLogin ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-[13px] mb-8" style={{ color: "hsl(0 0% 45%)" }}>
            {isLogin ? "Sign in to continue to your workspace" : "Start organizing your thoughts today"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {!isLogin && (
              <div>
                <label className="block text-[12px] font-medium mb-1.5" style={{ color: "hsl(0 0% 25%)" }}>Display Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(0 0% 60%)" }} />
                  <input
                    type="text"
                    placeholder="Your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-black transition-all"
                    style={{
                      background: "hsl(0 0% 100%)",
                      border: "1px solid hsl(0 0% 85%)",
                      color: "hsl(0 0% 8%)",
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: "hsl(0 0% 25%)" }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(0 0% 60%)" }} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg text-[13px] focus:outline-none focus:ring-2 transition-all"
                  style={{
                    background: "hsl(0 0% 100%)",
                    border: "1px solid hsl(0 0% 85%)",
                    color: "hsl(0 0% 8%)",
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: "hsl(0 0% 25%)" }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(0 0% 60%)" }} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg text-[13px] focus:outline-none focus:ring-2 transition-all"
                  style={{
                    background: "hsl(0 0% 100%)",
                    border: "1px solid hsl(0 0% 85%)",
                    color: "hsl(0 0% 8%)",
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
              style={{
                background: "hsl(0 0% 8%)",
                color: "hsl(0 0% 98%)",
              }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {isLogin ? "Sign in" : "Create account"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[12px] hover:underline transition-colors"
              style={{ color: "hsl(0 0% 45%)" }}
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          <p className="mt-8 text-center text-[10px]" style={{ color: "hsl(0 0% 70%)" }}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
