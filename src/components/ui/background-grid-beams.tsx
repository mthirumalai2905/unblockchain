import { cn } from "@/lib/utils";

export const BackgroundGridBeams = ({ className }: { className?: string }) => {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
        backgroundSize: "80px 80px",
      }} />

      {/* Animated beam lines */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="beam1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(217 91% 60%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(217 91% 60%)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="hsl(217 91% 60%)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="beam2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(262 83% 58%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(262 83% 58%)" stopOpacity="0.08" />
            <stop offset="100%" stopColor="hsl(262 83% 58%)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="10%" y1="0" x2="90%" y2="100%" stroke="url(#beam1)" strokeWidth="1">
          <animate attributeName="opacity" values="0;1;0" dur="4s" repeatCount="indefinite" />
        </line>
        <line x1="30%" y1="0" x2="70%" y2="100%" stroke="url(#beam1)" strokeWidth="0.5">
          <animate attributeName="opacity" values="0;0.8;0" dur="5s" begin="1s" repeatCount="indefinite" />
        </line>
        <line x1="80%" y1="0" x2="20%" y2="100%" stroke="url(#beam2)" strokeWidth="1">
          <animate attributeName="opacity" values="0;1;0" dur="6s" begin="2s" repeatCount="indefinite" />
        </line>
        <line x1="60%" y1="0" x2="40%" y2="100%" stroke="url(#beam2)" strokeWidth="0.5">
          <animate attributeName="opacity" values="0;0.6;0" dur="4.5s" begin="0.5s" repeatCount="indefinite" />
        </line>
      </svg>

      {/* Fade edges */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background to-transparent" />
    </div>
  );
};
