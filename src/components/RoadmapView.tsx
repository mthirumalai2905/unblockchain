import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map, Play, Loader2, RefreshCw, Check, ChevronDown, ChevronRight,
  Flag, Circle, Target, Search, Milestone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/store/WorkspaceStore";
import { toast } from "sonner";

const ROADMAP_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-roadmap`;

interface Substep {
  id: string;
  title: string;
  status: "done" | "current" | "upcoming";
}

interface Step {
  id: string;
  title: string;
  description: string;
  type: "task" | "milestone" | "decision" | "research";
  status: "done" | "current" | "upcoming";
  substeps?: Substep[];
}

interface Phase {
  id: string;
  title: string;
  description: string;
  status: "done" | "current" | "upcoming";
  steps: Step[];
}

interface Roadmap {
  title: string;
  phases: Phase[];
}

const statusColors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  done: { bg: "bg-cf-decision/10", border: "border-cf-decision/30", text: "text-cf-decision", dot: "bg-cf-decision" },
  current: { bg: "bg-cf-idea/10", border: "border-cf-idea/30", text: "text-cf-idea", dot: "bg-cf-idea" },
  upcoming: { bg: "bg-accent/50", border: "border-border", text: "text-muted-foreground", dot: "bg-muted-foreground/30" },
};

const typeIcons: Record<string, typeof Flag> = {
  task: Check,
  milestone: Flag,
  decision: Target,
  research: Search,
};

const RoadmapView = () => {
  const { activeSessionId, dumps } = useWorkspace();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const generate = useCallback(async () => {
    if (!activeSessionId || dumps.length === 0) {
      toast.error("Add some dumps first before generating a roadmap");
      return;
    }
    setIsGenerating(true);
    try {
      const resp = await fetch(ROADMAP_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ session_id: activeSessionId }),
      });

      if (!resp.ok) throw new Error(`Failed: ${resp.status}`);
      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      setRoadmap(data);
      // Expand all phases by default
      setExpandedPhases(new Set(data.phases.map((p: Phase) => p.id)));
      toast.success("Roadmap generated!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate roadmap");
    } finally {
      setIsGenerating(false);
    }
  }, [activeSessionId, dumps.length]);

  const togglePhase = (id: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleStep = (id: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4 text-muted-foreground" />
          <span className="text-[13px] font-semibold text-foreground">Product Roadmap</span>
        </div>
        <button
          onClick={generate}
          disabled={isGenerating || dumps.length === 0}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all",
            isGenerating
              ? "bg-accent text-muted-foreground cursor-not-allowed"
              : "bg-foreground text-background hover:opacity-90"
          )}
        >
          {isGenerating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : roadmap ? (
            <RefreshCw className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
          {isGenerating ? "Generating..." : roadmap ? "Regenerate" : "Generate Roadmap"}
        </button>
      </div>

      {/* Roadmap content */}
      <div className="flex-1 overflow-auto cf-scrollbar p-6">
        {roadmap ? (
          <div className="max-w-3xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg font-semibold text-foreground mb-6"
            >
              {roadmap.title}
            </motion.h2>

            <div className="space-y-1">
              {roadmap.phases.map((phase, phaseIdx) => {
                const isPhaseExpanded = expandedPhases.has(phase.id);
                const phaseColors = statusColors[phase.status] || statusColors.upcoming;
                const completedSteps = phase.steps.filter((s) => s.status === "done").length;

                return (
                  <motion.div
                    key={phase.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: phaseIdx * 0.1 }}
                  >
                    {/* Phase node */}
                    <button
                      onClick={() => togglePhase(phase.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-4 rounded-lg border transition-all hover:cf-shadow-md",
                        phaseColors.bg, phaseColors.border
                      )}
                    >
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", phaseColors.bg)}>
                        <Milestone className={cn("w-4 h-4", phaseColors.text)} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-semibold text-foreground">{phase.title}</span>
                          <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded", phaseColors.bg, phaseColors.text)}>
                            {phase.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{phase.description}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {completedSteps}/{phase.steps.length}
                        </span>
                        {isPhaseExpanded ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {/* Steps */}
                    <AnimatePresence>
                      {isPhaseExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-8 pl-4 border-l-2 border-border space-y-1 py-2">
                            {phase.steps.map((step, stepIdx) => {
                              const stepColors = statusColors[step.status] || statusColors.upcoming;
                              const StepIcon = typeIcons[step.type] || Circle;
                              const isStepExpanded = expandedSteps.has(step.id);
                              const hasSubsteps = step.substeps && step.substeps.length > 0;

                              return (
                                <motion.div
                                  key={step.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: stepIdx * 0.05 }}
                                >
                                  <button
                                    onClick={() => hasSubsteps && toggleStep(step.id)}
                                    className={cn(
                                      "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md border transition-all text-left",
                                      stepColors.border,
                                      hasSubsteps ? "cursor-pointer hover:cf-shadow-sm" : "cursor-default",
                                      step.status === "current" && "ring-1 ring-cf-idea/20"
                                    )}
                                  >
                                    {/* Connector dot */}
                                    <div className={cn("absolute -left-[21px] w-2.5 h-2.5 rounded-full border-2 border-background", stepColors.dot)} />

                                    <StepIcon className={cn("w-3.5 h-3.5 shrink-0", stepColors.text)} />
                                    <div className="flex-1 min-w-0">
                                      <span className={cn("text-[12px] font-medium", step.status === "done" ? "line-through text-muted-foreground" : "text-foreground")}>
                                        {step.title}
                                      </span>
                                      {step.description && (
                                        <p className="text-[10px] text-muted-foreground/70 mt-0.5 truncate">
                                          {step.description}
                                        </p>
                                      )}
                                    </div>
                                    <span className={cn("text-[9px] font-mono px-1.5 py-0.5 rounded shrink-0", stepColors.bg, stepColors.text)}>
                                      {step.type}
                                    </span>
                                    {hasSubsteps && (
                                      isStepExpanded ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                    )}
                                  </button>

                                  {/* Substeps */}
                                  <AnimatePresence>
                                    {isStepExpanded && hasSubsteps && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden ml-6 pl-3 border-l border-border/50 space-y-0.5 py-1"
                                      >
                                        {step.substeps!.map((sub) => {
                                          const subColors = statusColors[sub.status] || statusColors.upcoming;
                                          return (
                                            <div key={sub.id} className="flex items-center gap-2 px-2 py-1.5 rounded">
                                              <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", subColors.dot)} />
                                              <span className={cn("text-[11px]", sub.status === "done" ? "line-through text-muted-foreground" : "text-foreground/70")}>
                                                {sub.title}
                                              </span>
                                            </div>
                                          );
                                        })}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Connector between phases */}
                    {phaseIdx < roadmap.phases.length - 1 && (
                      <div className="flex justify-center py-1">
                        <div className="w-0.5 h-4 bg-border" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-3">
              <Map className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-[13px] text-muted-foreground mb-1">No roadmap generated yet</p>
            <p className="text-[11px] text-muted-foreground/50">
              Click "Generate Roadmap" to create a step-by-step product roadmap from your session
            </p>
          </div>
        )}
      </div>

      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-4 py-2 border-t border-border flex items-center gap-2"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-cf-idea animate-pulse" />
          <span className="text-[11px] font-mono text-muted-foreground">AI is building your roadmap...</span>
        </motion.div>
      )}
    </div>
  );
};

export default RoadmapView;
