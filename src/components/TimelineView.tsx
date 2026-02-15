import { motion } from "framer-motion";
import { useWorkspace } from "@/store/WorkspaceStore";
import { cn } from "@/lib/utils";

const typeColors: Record<string, string> = {
  idea: "bg-cf-idea",
  decision: "bg-cf-decision",
  question: "bg-cf-question",
  blocker: "bg-cf-blocker",
  action: "bg-cf-action",
  note: "bg-cf-note",
};

const TimelineView = () => {
  const { dumps, getThemesForDump, selectDump, selectTheme, setActiveSection } = useWorkspace();

  return (
    <div className="max-w-3xl">
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-4 px-0.5">
        Timeline
      </div>
      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

        <div className="space-y-1">
          {dumps.map((dump, i) => {
            const themes = getThemesForDump(dump.id);
            return (
              <motion.div
                key={dump.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => { selectDump(dump.id); setActiveSection("dumps"); }}
                className="relative flex items-start gap-3 p-3 rounded-lg hover:bg-card cursor-pointer transition-colors group"
              >
                {/* Dot */}
                <div className={cn("absolute left-[-19px] top-[18px] w-2.5 h-2.5 rounded-full border-2 border-background", typeColors[dump.type] || "bg-cf-note")} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-mono text-muted-foreground/50">{dump.timestamp}</span>
                    <span className="text-[12px] font-medium text-muted-foreground">{dump.author}</span>
                  </div>
                  <p className="text-[13px] text-foreground/70 leading-relaxed truncate">{dump.content}</p>
                  {themes.length > 0 && (
                    <div className="flex gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {themes.map((t) => (
                        <span
                          key={t.id}
                          onClick={(e) => { e.stopPropagation(); selectTheme(t.id); setActiveSection("themes"); }}
                          className="text-[9px] font-mono px-1.5 py-[1px] rounded bg-accent text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                        >
                          {t.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimelineView;
