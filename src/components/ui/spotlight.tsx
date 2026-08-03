import { useEffect } from "react";
import { motion, useMotionTemplate, useMotionValue, animate } from "framer-motion";
import { cn } from "@/lib/utils";

const COLORS = ["#94a3b8", "#e2e8f0", "#64748b", "#cbd5e1"];

/** Soft color-wash spotlight that gently cycles */
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

  const backgroundImage = useMotionTemplate`radial-gradient(420px circle at 50% 0%, ${color}18, transparent 75%)`;

  return (
    <motion.div
      className={cn("pointer-events-none absolute inset-0 z-0", className)}
      style={{ backgroundImage }}
    />
  );
};

/** Classic Aceternity SVG spotlight beam */
export const SpotlightBeam = ({
  className,
  fill = "white",
}: {
  className?: string;
  fill?: string;
}) => {
  return (
    <svg
      className={cn(
        "pointer-events-none absolute z-[1] h-[169%] w-[138%] lg:w-[84%] opacity-0 animate-spotlight",
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3787 2842"
      fill="none"
      aria-hidden
    >
      <g filter="url(#spotlight-filter)">
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="1924.71"
          ry="273.501"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.9 2291.09)"
          fill={fill}
          fillOpacity="0.22"
        />
      </g>
      <defs>
        <filter
          id="spotlight-filter"
          x="0.860352"
          y="0.838989"
          width="3785.16"
          height="2840.26"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="151" result="effect1_foregroundBlur" />
        </filter>
      </defs>
    </svg>
  );
};

/** Multiple drifting spotlights for depth */
export const SpotlightGroup = ({ className }: { className?: string }) => {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <Spotlight />
      <SpotlightBeam className="-top-40 left-0 md:left-20 md:-top-20" fill="white" />
      <SpotlightBeam
        className="-top-20 left-40 md:left-[40%] md:-top-10 [animation-delay:1.2s]"
        fill="#94a3b8"
      />
      <motion.div
        className="absolute -bottom-24 -right-16 h-[420px] w-[420px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--foreground) / 0.08) 0%, transparent 70%)",
        }}
        animate={{ opacity: [0.35, 0.7, 0.35], scale: [1, 1.08, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};
