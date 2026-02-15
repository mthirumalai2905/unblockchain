import { motion } from "framer-motion";
import {
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  AlertTriangle,
  ListTodo,
  MessageSquare,
  MoreHorizontal,
  ThumbsUp,
  Reply,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type DumpType = "idea" | "decision" | "question" | "blocker" | "action" | "note";

export interface Dump {
  id: string;
  content: string;
  author: string;
  avatar: string;
  timestamp: string;
  type: DumpType;
  aiDetected?: boolean;
  reactions?: number;
  replies?: number;
}

const typeConfig: Record<DumpType, { icon: typeof Lightbulb; label: string; colorClass: string; bgClass: string }> = {
  idea: { icon: Lightbulb, label: "Idea", colorClass: "text-cf-idea", bgClass: "bg-cf-idea/10" },
  decision: { icon: CheckCircle2, label: "Decision", colorClass: "text-cf-decision", bgClass: "bg-cf-decision/10" },
  question: { icon: HelpCircle, label: "Question", colorClass: "text-cf-question", bgClass: "bg-cf-question/10" },
  blocker: { icon: AlertTriangle, label: "Blocker", colorClass: "text-cf-blocker", bgClass: "bg-cf-blocker/10" },
  action: { icon: ListTodo, label: "Action", colorClass: "text-cf-action", bgClass: "bg-cf-action/10" },
  note: { icon: MessageSquare, label: "Note", colorClass: "text-cf-note", bgClass: "bg-cf-note/10" },
};

interface DumpCardProps {
  dump: Dump;
  index: number;
}

const DumpCard = ({ dump, index }: DumpCardProps) => {
  const config = typeConfig[dump.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group p-4 rounded-xl bg-card border border-border hover:border-primary/20 cf-card-shadow hover:cf-card-shadow-lg transition-all"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-accent-foreground shrink-0">
          {dump.avatar}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-semibold text-foreground">{dump.author}</span>
            <span className="text-xs text-muted-foreground">{dump.timestamp}</span>
            {dump.aiDetected && (
              <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium", config.bgClass, config.colorClass)}>
                <Icon className="w-3 h-3" />
                {config.label}
              </span>
            )}
            <button className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-accent">
              <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <p className="text-sm text-foreground/90 leading-relaxed">{dump.content}</p>

          {/* Footer */}
          <div className="flex items-center gap-3 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ThumbsUp className="w-3 h-3" />
              {dump.reactions || 0}
            </button>
            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Reply className="w-3 h-3" />
              {dump.replies || 0}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DumpCard;
