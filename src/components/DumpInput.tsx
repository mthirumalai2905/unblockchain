import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, Image, Link, Paperclip, Send, Sparkles, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/store/WorkspaceStore";

const DumpInput = () => {
  const { addDump } = useWorkspace();
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = () => {
    if (!value.trim()) return;
    addDump(value.trim());
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const tools = [
    { icon: Mic, label: "Voice note" },
    { icon: Image, label: "Image" },
    { icon: Link, label: "Link" },
    { icon: Paperclip, label: "File" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative rounded-xl border transition-all duration-200 bg-card",
        isFocused ? "border-ring/50 cf-shadow-md" : "border-border cf-shadow-sm hover:border-ring/30"
      )}
    >
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        placeholder="Dump your thoughts... no structure needed"
        rows={3}
        className="w-full resize-none bg-transparent px-4 pt-3.5 pb-1 text-foreground placeholder:text-muted-foreground/60 focus:outline-none text-[14px] leading-relaxed"
      />
      <div className="flex items-center justify-between px-2.5 pb-2.5">
        <div className="flex items-center gap-0.5">
          {tools.map(({ icon: Icon, label }) => (
            <button
              key={label}
              title={label}
              className="p-1.5 rounded-md text-muted-foreground/50 hover:text-muted-foreground hover:bg-accent transition-colors"
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] text-muted-foreground/50 flex items-center gap-1 font-mono">
            <Sparkles className="w-3 h-3" />
            auto-process
          </span>
          <button
            onClick={handleSubmit}
            disabled={!value.trim()}
            className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
              value.trim()
                ? "bg-foreground text-background hover:opacity-80"
                : "bg-accent text-muted-foreground/30 cursor-not-allowed"
            )}
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DumpInput;
