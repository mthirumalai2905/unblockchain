import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, Check, Loader2, X, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export interface ThinkingStep {
  dumpId: string;
  dumpContent: string;
  status: "pending" | "processing" | "done" | "error";
  reasoning: string[];
  result?: {
    type: string;
    actionsCount: number;
    questionsCount: number;
    themesCount: number;
  };
}

interface ThinkingPanelProps {
  steps: ThinkingStep[];
  isOpen: boolean;
  onClose: () => void;
}

const ThinkingPanel = ({ steps, isOpen, onClose }: ThinkingPanelProps) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const completedCount = steps.filter((s) => s.status === "done").length;
  const processingStep = steps.find((s) => s.status === "processing");

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 right-4 w-[420px] max-h-[70vh] rounded-xl border border-border bg-card cf-shadow-lg z-50 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-accent/30">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-cf-action/20 flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-cf-action" />
            </div>
            <span className="text-[13px] font-semibold text-foreground">AI Thinking</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-muted-foreground">
              {completedCount}/{steps.length} processed
            </span>
            <button onClick={onClose} className="p-1 rounded hover:bg-accent transition-colors">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-accent">
          <motion.div
            className="h-full bg-cf-decision"
            animate={{ width: `${steps.length > 0 ? (completedCount / steps.length) * 100 : 0}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Steps list */}
        <div className="flex-1 overflow-auto cf-scrollbar p-2 space-y-1">
          {steps.map((step, i) => {
            const isExpanded = expandedIds.has(step.dumpId) || step.status === "processing";
            return (
              <motion.div
                key={step.dumpId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "rounded-lg border transition-all",
                  step.status === "processing"
                    ? "border-cf-action/30 bg-cf-action/5"
                    : step.status === "done"
                    ? "border-border bg-card"
                    : step.status === "error"
                    ? "border-cf-blocker/30 bg-cf-blocker/5"
                    : "border-border/50 bg-card/50"
                )}
              >
                <button
                  onClick={() => toggleExpand(step.dumpId)}
                  className="w-full flex items-center gap-2 px-3 py-2"
                >
                  {step.status === "processing" ? (
                    <Loader2 className="w-3.5 h-3.5 text-cf-action animate-spin shrink-0" />
                  ) : step.status === "done" ? (
                    <Check className="w-3.5 h-3.5 text-cf-decision shrink-0" />
                  ) : step.status === "error" ? (
                    <X className="w-3.5 h-3.5 text-cf-blocker shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30 shrink-0" />
                  )}

                  <span className="text-[12px] text-foreground/80 truncate flex-1 text-left">
                    {step.dumpContent.slice(0, 60)}{step.dumpContent.length > 60 ? "..." : ""}
                  </span>

                  {step.result && (
                    <span className="text-[10px] font-mono text-cf-decision shrink-0">
                      {step.result.type}
                    </span>
                  )}

                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && step.reasoning.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 space-y-1.5 border-t border-border/50 pt-2 ml-5">
                        {step.reasoning.map((reason, j) => (
                          <motion.div
                            key={j}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: j * 0.1 }}
                            className="flex items-start gap-2"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-cf-question mt-1 shrink-0" />
                            <span className="text-[11px] text-muted-foreground leading-relaxed">
                              {reason}
                            </span>
                          </motion.div>
                        ))}
                        {step.result && (
                          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border/30">
                            <span className="text-[10px] font-mono text-cf-idea">
                              {step.result.actionsCount} actions
                            </span>
                            <span className="text-[10px] font-mono text-cf-question">
                              {step.result.questionsCount} questions
                            </span>
                            <span className="text-[10px] font-mono text-cf-action">
                              {step.result.themesCount} themes
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Current thinking indicator */}
        {processingStep && (
          <div className="px-4 py-2.5 border-t border-border flex items-center gap-2 bg-accent/20">
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-cf-action animate-pulse" style={{ animationDelay: "0ms" }} />
              <div className="w-1 h-1 rounded-full bg-cf-action animate-pulse" style={{ animationDelay: "200ms" }} />
              <div className="w-1 h-1 rounded-full bg-cf-action animate-pulse" style={{ animationDelay: "400ms" }} />
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">
              Analyzing dump {completedCount + 1} of {steps.length}...
            </span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ThinkingPanel;
