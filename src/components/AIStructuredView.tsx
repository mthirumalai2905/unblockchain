import { motion } from "framer-motion";
import {
  CheckSquare, Lightbulb, AlertTriangle, HelpCircle,
  FileText, ArrowRight, Check, X, Pencil, Sparkles,
  ChevronUp, ArrowUpRight, Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/store/WorkspaceStore";

const AIStructuredView = () => {
  const { themes, actions, questions, selectTheme, setActiveSection } = useWorkspace();

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Status Bar */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-3.5 rounded-lg border border-border bg-card"
      >
        <div className="w-7 h-7 rounded-md bg-foreground flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-background" />
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-medium text-foreground">12 dumps processed</p>
          <p className="text-[11px] text-muted-foreground font-mono">3 themes · 5 actions · 4 questions · updated 2m ago</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-cf-decision animate-pulse-dot" />
          <span className="text-[11px] text-muted-foreground font-mono">94%</span>
        </div>
      </motion.div>

      {/* Themes */}
      <Section title="Themes" count={themes.length}>
        {themes.map((theme) => (
          <motion.button
            key={theme.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => { selectTheme(theme.id); setActiveSection("themes"); }}
            className="w-full text-left p-3.5 rounded-lg bg-card border border-border hover:border-ring/30 transition-all group cursor-pointer hover:cf-shadow-md"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-[13px] font-medium text-foreground group-hover:text-foreground">{theme.title}</h4>
              <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {theme.tags.map((tag) => (
                <span key={tag} className="px-2 py-[2px] text-[10px] font-mono rounded bg-accent text-muted-foreground">
                  {tag}
                </span>
              ))}
              <span className="text-[10px] text-muted-foreground/50 font-mono ml-auto">
                {theme.dumpIds.length} dumps · {theme.confidence}%
              </span>
            </div>
          </motion.button>
        ))}
      </Section>

      {/* Actions */}
      <Section title="Action Items" count={actions.filter((a) => !a.done).length}>
        {actions.map((action) => (
          <ActionRow key={action.id} action={action} />
        ))}
      </Section>

      {/* Questions */}
      <Section title="Open Questions" count={questions.filter((q) => !q.answered).length}>
        {questions.map((q) => (
          <QuestionRow key={q.id} question={q} />
        ))}
      </Section>

    </div>
  );
};

const Section = ({ title, count, children }: { title: string; count: number; children: React.ReactNode }) => (
  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
    <div className="flex items-center gap-2 px-0.5">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{title}</h3>
      <span className="text-[11px] font-mono text-muted-foreground/50">{count}</span>
    </div>
    <div className="space-y-1.5">{children}</div>
  </motion.div>
);

const ActionRow = ({ action }: { action: ReturnType<typeof useWorkspace>["actions"][0] }) => {
  const { toggleAction, setActiveSection, selectDump } = useWorkspace();
  return (
    <div className="group flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-ring/30 transition-all">
      <button onClick={() => toggleAction(action.id)} className="shrink-0">
        {action.done ? (
          <Check className="w-4 h-4 text-cf-decision" />
        ) : (
          <Circle className={cn(
            "w-4 h-4",
            action.priority === "high" ? "text-cf-blocker" : action.priority === "medium" ? "text-cf-question" : "text-muted-foreground/30"
          )} />
        )}
      </button>
      <span className={cn("text-[13px] flex-1", action.done ? "line-through text-muted-foreground" : "text-foreground/80")}>
        {action.text}
      </span>
      <span className="text-[11px] font-mono text-muted-foreground">{action.owner}</span>
      <button
        onClick={() => { selectDump(action.sourceDumpIds[0]); setActiveSection("dumps"); }}
        className="text-[11px] text-muted-foreground/50 hover:text-foreground flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all"
      >
        <ArrowUpRight className="w-3 h-3" />
        source
      </button>
    </div>
  );
};

const QuestionRow = ({ question }: { question: ReturnType<typeof useWorkspace>["questions"][0] }) => {
  const { voteQuestion, selectDump, setActiveSection } = useWorkspace();
  return (
    <div className="group flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-ring/30 transition-all">
      <button
        onClick={() => voteQuestion(question.id)}
        className="shrink-0 flex flex-col items-center gap-0.5 px-1"
      >
        <ChevronUp className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
        <span className="text-[11px] font-mono text-muted-foreground">{question.votes}</span>
      </button>
      <span className="text-[13px] text-foreground/80 flex-1">{question.text}</span>
      <button
        onClick={() => { selectDump(question.sourceDumpIds[0]); setActiveSection("dumps"); }}
        className="text-[11px] text-muted-foreground/50 hover:text-foreground flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all"
      >
        <ArrowUpRight className="w-3 h-3" />
        source
      </button>
    </div>
  );
};

export default AIStructuredView;
