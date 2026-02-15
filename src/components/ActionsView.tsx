import { motion } from "framer-motion";
import { Check, Circle, ArrowUpRight, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/store/WorkspaceStore";

const ActionsView = () => {
  const { actions, toggleAction, selectDump, setActiveSection, getDumpsForAction } = useWorkspace();

  const pending = actions.filter((a) => !a.done);
  const completed = actions.filter((a) => a.done);

  return (
    <div className="max-w-3xl space-y-6">
      {/* Stats */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-6 px-0.5">
        <div>
          <div className="text-2xl font-bold text-foreground tabular-nums">{pending.length}</div>
          <div className="text-[11px] text-muted-foreground font-mono">pending</div>
        </div>
        <div className="w-px h-8 bg-border" />
        <div>
          <div className="text-2xl font-bold text-muted-foreground tabular-nums">{completed.length}</div>
          <div className="text-[11px] text-muted-foreground font-mono">completed</div>
        </div>
      </motion.div>

      {/* Pending */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground px-0.5 mb-2">Pending</div>
        {pending.map((action, i) => {
          const sourceDumps = getDumpsForAction(action.id);
          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="group flex items-center gap-3 p-3.5 rounded-lg bg-card border border-border hover:border-ring/30 transition-all"
            >
              <button onClick={() => toggleAction(action.id)} className="shrink-0">
                <Circle className={cn(
                  "w-[18px] h-[18px]",
                  action.priority === "high" ? "text-cf-blocker" : action.priority === "medium" ? "text-cf-question" : "text-muted-foreground/30"
                )} />
              </button>
              <div className="flex-1 min-w-0">
                <span className="text-[13px] text-foreground/90">{action.text}</span>
                {sourceDumps.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {sourceDumps.slice(0, 2).map((d) => (
                      <button
                        key={d.id}
                        onClick={() => { selectDump(d.id); setActiveSection("dumps"); }}
                        className="text-[10px] text-muted-foreground/50 hover:text-foreground bg-accent px-1.5 py-[1px] rounded flex items-center gap-0.5 transition-colors"
                      >
                        <ArrowUpRight className="w-2.5 h-2.5" />
                        {d.author}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span className={cn(
                "px-2 py-[2px] text-[10px] font-mono rounded",
                action.priority === "high" ? "bg-cf-blocker/10 text-cf-blocker"
                  : action.priority === "medium" ? "bg-cf-question/10 text-cf-question"
                  : "bg-accent text-muted-foreground"
              )}>
                {action.priority}
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">{action.owner}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Completed */}
      {completed.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground px-0.5 mb-2">Completed</div>
          {completed.map((action) => (
            <div
              key={action.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50"
            >
              <button onClick={() => toggleAction(action.id)} className="shrink-0">
                <Check className="w-4 h-4 text-cf-decision" />
              </button>
              <span className="text-[13px] text-muted-foreground line-through flex-1">{action.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionsView;
