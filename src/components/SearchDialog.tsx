import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, MessageSquare, Lightbulb, CheckCircle2, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace, Dump } from "@/store/WorkspaceStore";

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const typeIcons: Record<string, typeof MessageSquare> = {
  idea: Lightbulb,
  decision: CheckCircle2,
  question: HelpCircle,
  note: MessageSquare,
};

const SearchDialog = ({ isOpen, onClose }: SearchDialogProps) => {
  const { dumps, selectDump, setActiveSection } = useWorkspace();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent toggles
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const results: Dump[] = query.trim()
    ? dumps.filter((d) =>
        d.content.toLowerCase().includes(query.toLowerCase()) ||
        d.type.toLowerCase().includes(query.toLowerCase()) ||
        d.author.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10)
    : [];

  const handleSelect = (dump: Dump) => {
    selectDump(dump.id);
    setActiveSection("dumps");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: -10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: -10 }}
        className="relative z-10 w-full max-w-md mx-4 rounded-xl border border-border bg-card overflow-hidden cf-shadow-lg"
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dumps, themes, actions..."
            className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          />
          <button onClick={onClose} className="p-1 rounded hover:bg-accent text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {query.trim() && (
          <div className="max-h-[300px] overflow-auto cf-scrollbar">
            {results.length === 0 ? (
              <div className="px-4 py-8 text-center text-[12px] text-muted-foreground">No results found</div>
            ) : (
              results.map((dump) => {
                const Icon = typeIcons[dump.type] || MessageSquare;
                return (
                  <button
                    key={dump.id}
                    onClick={() => handleSelect(dump)}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-accent/50 transition-colors text-left"
                  >
                    <Icon className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] text-foreground/80 truncate">{dump.content}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono text-muted-foreground">{dump.type}</span>
                        <span className="text-[10px] text-muted-foreground">{dump.author}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default SearchDialog;
