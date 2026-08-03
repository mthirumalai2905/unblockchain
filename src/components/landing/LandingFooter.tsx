const LandingFooter = () => {
  return (
    <footer className="border-t border-border py-8 px-4 sm:px-6 pb-[calc(2rem+env(safe-area-inset-bottom))]">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center sm:items-center justify-between gap-5 text-center sm:text-left">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-[6px] bg-foreground flex items-center justify-center">
            <span className="text-[10px] font-bold text-background leading-none">D</span>
          </div>
          <span className="font-display text-[14px] font-semibold tracking-tight">DumpStash</span>
          <span className="lab-mono text-[10px] text-muted-foreground">lab</span>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] text-muted-foreground">
          <a href="#how-it-works" className="hover:text-foreground transition-colors py-1">Product</a>
          <a href="#features" className="hover:text-foreground transition-colors py-1">Features</a>
          <a href="#pricing" className="hover:text-foreground transition-colors py-1">Pricing</a>
        </div>

        <span className="lab-mono text-[11px] text-muted-foreground/60">
          © 2026 DumpStash
        </span>
      </div>
    </footer>
  );
};

export default LandingFooter;
