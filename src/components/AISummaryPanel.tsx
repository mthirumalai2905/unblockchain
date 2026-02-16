import { motion } from "framer-motion";
import { Brain, Sparkles, TrendingUp, AlertTriangle, Lightbulb, CheckSquare, HelpCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/store/WorkspaceStore";

const AISummaryPanel = () => {
  const { dumps, themes, actions, questions } = useWorkspace();

  const pendingActions = actions.filter((a) => !a.done).length;
  const openQuestions = questions.filter((q) => !q.answered).length;

  // Compute type distribution
  const typeCounts = dumps.reduce((acc, d) => {
    acc[d.type] = (acc[d.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeItems = [
    { type: "idea", label: "Ideas", color: "bg-cf-idea", count: typeCounts.idea || 0 },
    { type: "decision", label: "Decisions", color: "bg-cf-decision", count: typeCounts.decision || 0 },
    { type: "question", label: "Questions", color: "bg-cf-question", count: typeCounts.question || 0 },
    { type: "blocker", label: "Blockers", color: "bg-cf-blocker", count: typeCounts.blocker || 0 },
    { type: "action", label: "Actions", color: "bg-cf-action", count: typeCounts.action || 0 },
    { type: "note", label: "Notes", color: "bg-cf-note", count: typeCounts.note || 0 },
  ].filter((t) => t.count > 0);

  const total = dumps.length;

  if (total === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-6">
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-3">
          <Brain className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-[13px] text-muted-foreground">Start dumping your thoughts.</p>
        <p className="text-[11px] text-muted-foreground/50 mt-1">AI insights will appear here.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto cf-scrollbar p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-foreground flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-background" />
        </div>
        <span className="text-[13px] font-semibold text-foreground">Session Summary</span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Dumps", value: total, icon: Zap, color: "text-foreground" },
          { label: "Themes", value: themes.length, icon: Lightbulb, color: "text-cf-idea" },
          { label: "Pending", value: pendingActions, icon: CheckSquare, color: "text-cf-action" },
          { label: "Open Qs", value: openQuestions, icon: HelpCircle, color: "text-cf-question" },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 rounded-lg bg-card border border-border"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <stat.icon className={cn("w-3.5 h-3.5", stat.color)} />
              <span className="text-[10px] text-muted-foreground font-mono uppercase">{stat.label}</span>
            </div>
            <div className="text-xl font-bold text-foreground tabular-nums">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Type distribution */}
      <div className="p-3 rounded-lg bg-card border border-border space-y-2.5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Content Mix</div>
        <div className="flex gap-0.5 h-2 rounded-full overflow-hidden bg-accent">
          {typeItems.map((t) => (
            <motion.div
              key={t.type}
              initial={{ width: 0 }}
              animate={{ width: `${(t.count / total) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={cn("h-full", t.color)}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {typeItems.map((t) => (
            <div key={t.type} className="flex items-center gap-1.5">
              <div className={cn("w-2 h-2 rounded-full", t.color)} />
              <span className="text-[10px] text-muted-foreground font-mono">{t.label} {t.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top themes */}
      {themes.length > 0 && (
        <div className="p-3 rounded-lg bg-card border border-border space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3" />
            Top Themes
          </div>
          {themes.slice(0, 3).map((theme) => (
            <div key={theme.id} className="flex items-center justify-between py-1">
              <span className="text-[12px] text-foreground/80 truncate flex-1">{theme.title}</span>
              <span className="text-[10px] font-mono text-muted-foreground ml-2">{theme.confidence}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Pending actions preview */}
      {pendingActions > 0 && (
        <div className="p-3 rounded-lg bg-card border border-border space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3" />
            Needs Attention
          </div>
          {actions.filter((a) => !a.done && a.priority === "high").slice(0, 3).map((action) => (
            <div key={action.id} className="flex items-center gap-2 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-cf-blocker shrink-0" />
              <span className="text-[12px] text-foreground/80 truncate">{action.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AISummaryPanel;
