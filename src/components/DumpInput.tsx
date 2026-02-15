import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mic,
  Image,
  Link,
  Paperclip,
  Send,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DumpInputProps {
  onSubmit: (content: string) => void;
}

const DumpInput = ({ onSubmit }: DumpInputProps) => {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = () => {
    if (!value.trim()) return;
    onSubmit(value.trim());
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative rounded-xl border-2 transition-all duration-200 bg-card",
        isFocused
          ? "border-primary/40 cf-card-shadow-lg cf-glow"
          : "border-border cf-card-shadow hover:border-primary/20"
      )}
    >
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        placeholder="Dump your thoughts... anything goes. Press Enter to send."
        rows={3}
        className="w-full resize-none bg-transparent px-4 pt-4 pb-2 text-foreground placeholder:text-muted-foreground focus:outline-none text-sm leading-relaxed"
      />
      <div className="flex items-center justify-between px-3 pb-3">
        <div className="flex items-center gap-1">
          {[
            { icon: Mic, label: "Voice" },
            { icon: Image, label: "Image" },
            { icon: Link, label: "Link" },
            { icon: Paperclip, label: "Attach" },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              title={label}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-primary" />
            AI will process
          </span>
          <button
            onClick={handleSubmit}
            disabled={!value.trim()}
            className={cn(
              "p-2 rounded-lg transition-all",
              value.trim()
                ? "cf-gradient-primary text-primary-foreground hover:opacity-90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DumpInput;
