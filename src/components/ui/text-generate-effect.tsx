import { useEffect, useState } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
}: {
  words: string;
  className?: string;
}) => {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");

  useEffect(() => {
    animate(
      "span",
      { opacity: 1, filter: "blur(0px)" },
      { duration: 0.4, delay: stagger(0.05) }
    );
  }, [scope, animate]);

  return (
    <motion.div ref={scope} className={cn(className)}>
      {wordsArray.map((word, idx) => (
        <motion.span
          key={word + idx}
          className="opacity-0"
          style={{ filter: "blur(8px)" }}
        >
          {word}{" "}
        </motion.span>
      ))}
    </motion.div>
  );
};
