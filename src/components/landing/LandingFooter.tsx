import { Zap } from "lucide-react";

const LandingFooter = () => {
  return (
    <footer className="border-t border-border py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-muted-foreground" />
          <span className="text-[13px] font-medium text-muted-foreground">DumpStash</span>
        </div>

        <div className="flex items-center gap-8 text-[12px] text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          <span>Privacy</span>
          <span>Terms</span>
        </div>

        <span className="text-[11px] text-muted-foreground/50">© 2026 DumpStash. All rights reserved.</span>
      </div>
    </footer>
  );
};

export default LandingFooter;
