import { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const FlipWords = ({
  words,
  duration = 2800,
  className,
}: {
  words: string[];
  duration?: number;
  className?: string;
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, duration);
    return () => window.clearInterval(id);
  }, [words.length, duration]);

  const minCh = useMemo(
    () => Math.max(...words.map((w) => w.length)),
    [words]
  );

  return (
    <span
      className="relative inline-grid justify-items-center text-center align-baseline max-w-full"
      style={{ width: `min(${minCh}ch, 100%)` }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "col-start-1 row-start-1 inline-block whitespace-nowrap",
            className
          )}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};
