import { motion } from "framer-motion";
import {
  Lightbulb, CheckCircle2, HelpCircle, AlertTriangle,
  ListTodo, MessageSquare, ThumbsUp, Reply, MoreHorizontal,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace, Dump, DumpType } from "@/store/WorkspaceStore";

const typeConfig: Record<DumpType, { icon: typeof Lightbulb; label: string; dotColor: string; bgClass: string; textClass: string }> = {
  idea: { icon: Lightbulb, label: "Idea", dotColor: "bg-cf-idea", bgClass: "bg-cf-idea/10", textClass: "text-cf-idea" },
  decision: { icon: CheckCircle2, label: "Decision", dotColor: "bg-cf-decision", bgClass: "bg-cf-decision/10", textClass: "text-cf-decision" },
  question: { icon: HelpCircle, label: "Question", dotColor: "bg-cf-question", bgClass: "bg-cf-question/10", textClass: "text-cf-question" },
  blocker: { icon: AlertTriangle, label: "Blocker", dotColor: "bg-cf-blocker", bgClass: "bg-cf-blocker/10", textClass: "text-cf-blocker" },
  action: { icon: ListTodo, label: "Action", dotColor: "bg-cf-action", bgClass: "bg-cf-action/10", textClass: "text-cf-action" },
  note: { icon: MessageSquare, label: "Note", dotColor: "bg-cf-note", bgClass: "bg-cf-note/10", textClass: "text-cf-note" },
};

interface DumpCardProps {
  dump: Dump;
  index: number;
}

const DumpCard = ({ dump, index }: DumpCardProps) => {
  const { getThemesForDump, selectTheme, setActiveSection, selectDump } = useWorkspace();
  const config = typeConfig[dump.type];
  const themes = getThemesForDump(dump.id);

  const handleThemeClick = (themeId: string) => {
    selectTheme(themeId);
    setActiveSection("themes");
  };

  const handleCardClick = () => {
    selectDump(dump.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      onClick={handleCardClick}
      className="group relative p-4 rounded-lg bg-card border border-border hover:border-ring/30 transition-all duration-150 cursor-pointer hover:cf-shadow-md"
    >
      {/* Type indicator line */}
      <div className={cn("absolute left-0 top-3 bottom-3 w-[2px] rounded-full", config.dotColor)} />

      <div className="flex items-start gap-3 pl-2">
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-[10px] font-semibold text-muted-foreground shrink-0 mt-0.5">
          {dump.avatar}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[13px] font-medium text-foreground">{dump.author}</span>
            <span className="text-[11px] text-muted-foreground font-mono">{dump.timestamp}</span>
            <span className={cn("inline-flex items-center gap-1 px-1.5 py-[1px] rounded text-[10px] font-medium", config.bgClass, config.textClass)}>
              {config.label}
            </span>
          </div>

          <p className="text-[13px] text-foreground/80 leading-[1.6]">{dump.content}</p>

          {/* Connected Themes */}
          {themes.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={(e) => { e.stopPropagation(); handleThemeClick(theme.id); }}
                  className="inline-flex items-center gap-1 px-2 py-[2px] rounded-md text-[10px] font-medium bg-accent text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-colors"
                >
                  <ArrowUpRight className="w-2.5 h-2.5" />
                  {theme.title}
                </button>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <button className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
              <ThumbsUp className="w-3 h-3" />
              {dump.reactions}
            </button>
            <button className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
              <Reply className="w-3 h-3" />
              {dump.replies}
            </button>
          </div>
        </div>

        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-accent text-muted-foreground">
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

export default DumpCard;
