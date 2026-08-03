import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

const ThemeToggle = ({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md";
}) => {
  const { theme, toggleWithBubble, isTransitioning } = useTheme();
  const dim = size === "sm" ? "w-8 h-8" : "w-9 h-9";
  const icon = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <button
      onClick={toggleWithBubble}
      disabled={isTransitioning}
      className={cn(
        dim,
        "relative rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors overflow-hidden disabled:opacity-60",
        className
      )}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: 10, opacity: 0, rotate: -40, scale: 0.7 }}
          animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
          exit={{ y: -10, opacity: 0, rotate: 40, scale: 0.7 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex"
        >
          {theme === "dark" ? <Sun className={icon} /> : <Moon className={icon} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
};

export default ThemeToggle;
