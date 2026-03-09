import { useEffect, useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, animate } from "framer-motion";
import { cn } from "@/lib/utils";

const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981"];

export const Spotlight = ({ className }: { className?: string }) => {
  const color = useMotionValue(COLORS[0]);

  useEffect(() => {
    animate(color, COLORS, {
      ease: "easeInOut",
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror",
    });
  }, [color]);

  const backgroundImage = useMotionTemplate`radial-gradient(350px circle at 50% 0%, ${color}15, transparent 80%)`;

  return (
    <motion.div
      className={cn("pointer-events-none absolute inset-0 z-0", className)}
      style={{ backgroundImage }}
    />
  );
};
