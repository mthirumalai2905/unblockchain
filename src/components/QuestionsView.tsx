import { motion } from "framer-motion";
import { ChevronUp, ArrowUpRight, MessageCircle } from "lucide-react";
import { useWorkspace } from "@/store/WorkspaceStore";

const QuestionsView = () => {
  const { questions, voteQuestion, selectDump, setActiveSection, dumps } = useWorkspace();

  const sorted = [...questions].sort((a, b) => b.votes - a.votes);

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center gap-2 px-0.5 mb-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Open Questions</h3>
        <span className="text-[11px] font-mono text-muted-foreground/50">{questions.length}</span>
      </div>

      {sorted.map((q, i) => {
        const sourceDump = dumps.find((d) => q.sourceDumpIds.includes(d.id));
        return (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="group flex items-start gap-4 p-4 rounded-lg bg-card border border-border hover:border-ring/30 transition-all"
          >
            <button
              onClick={() => voteQuestion(q.id)}
              className="shrink-0 flex flex-col items-center gap-0.5 pt-0.5 min-w-[28px]"
            >
              <ChevronUp className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
              <span className="text-[13px] font-mono font-semibold text-foreground tabular-nums">{q.votes}</span>
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] text-foreground/90 leading-relaxed">{q.text}</p>
              {sourceDump && (
                <button
                  onClick={() => { selectDump(sourceDump.id); setActiveSection("dumps"); }}
                  className="mt-2 text-[11px] text-muted-foreground/50 hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  <ArrowUpRight className="w-3 h-3" />
                  from {sourceDump.author}
                </button>
              )}
            </div>
            <button className="shrink-0 text-muted-foreground/30 hover:text-foreground transition-colors p-1">
              <MessageCircle className="w-4 h-4" />
            </button>
          </motion.div>
        );
      })}
    </div>
  );
};

export default QuestionsView;
