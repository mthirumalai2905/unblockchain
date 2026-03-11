import { Zap } from "lucide-react";

const LandingFooter = () => {
  return (
    <footer className="border-t border-border py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                <Zap className="w-4 h-4 text-background" />
              </div>
              <span className="text-[15px] font-bold tracking-tight">DumpStash</span>
            </div>
            <p className="text-[13px] text-muted-foreground leading-[1.8] max-w-sm">
              The AI-powered workspace where messy ideas become structured products. Stop losing thoughts. Start shipping them.
            </p>
          </div>
          
          <div>
            <h4 className="text-[12px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">Product</h4>
            <div className="space-y-2.5">
              <a href="#features" className="block text-[13px] text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="block text-[13px] text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#how-it-works" className="block text-[13px] text-muted-foreground hover:text-foreground transition-colors">How it works</a>
            </div>
          </div>

          <div>
            <h4 className="text-[12px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">Legal</h4>
            <div className="space-y-2.5">
              <span className="block text-[13px] text-muted-foreground">Privacy Policy</span>
              <span className="block text-[13px] text-muted-foreground">Terms of Service</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[11px] text-muted-foreground/50 tracking-wide">© 2026 DumpStash. All rights reserved.</span>
          <span className="text-[11px] text-muted-foreground/30 font-mono tracking-wider">BUILT FOR THE FUTURE OF IDEAS</span>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
