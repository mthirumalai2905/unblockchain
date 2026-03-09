import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export const BentoGrid = ({ children, className }: BentoGridProps) => {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", className)}>
      {children}
    </div>
  );
};

interface BentoCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  gradient?: string;
}

export const BentoCard = ({ title, description, icon, className, gradient }: BentoCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card/30 p-8 md:p-10 transition-colors hover:bg-card/60",
        className
      )}
    >
      {/* Mouse follow glow */}
      {hovered && (
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(300px circle at ${springX.get()}px ${springY.get()}px, hsl(var(--foreground) / 0.04), transparent 60%)`,
          }}
        />
      )}

      {/* Top gradient bar */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity",
        gradient || "bg-gradient-to-r from-transparent via-foreground/20 to-transparent"
      )} />

      <div className="relative z-10">
        <div className="mb-5 text-muted-foreground">{icon}</div>
        <h3 className="text-[16px] font-semibold mb-2">{title}</h3>
        <p className="text-[13px] text-muted-foreground leading-[1.7]">{description}</p>
      </div>
    </motion.div>
  );
};
