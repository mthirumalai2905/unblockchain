import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, MessageSquare, Brain, CheckSquare, Lightbulb,
  HelpCircle, Clock, Archive, ChevronDown, Plus, Search,
  Command,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace, ViewSection } from "@/store/WorkspaceStore";
import { useState } from "react";

const navItems: { id: ViewSection; label: string; icon: typeof Brain }[] = [
  { id: "dumps", label: "Brain Dump", icon: MessageSquare },
  { id: "structures", label: "AI Insights", icon: Brain },
  { id: "actions", label: "Actions", icon: CheckSquare },
  { id: "themes", label: "Themes", icon: Lightbulb },
  { id: "questions", label: "Questions", icon: HelpCircle },
  { id: "timeline", label: "Timeline", icon: Clock },
  { id: "archive", label: "Archive", icon: Archive },
];

const sessions = [
  { id: "1", name: "Q2 Pricing Strategy", dumps: 10, active: true },
  { id: "2", name: "Product Roadmap Review", dumps: 8 },
  { id: "3", name: "Design System Sprint", dumps: 15 },
  { id: "4", name: "Onboarding Flow Ideas", dumps: 6 },
];

const AppSidebar = () => {
  const { activeSection, setActiveSection, actions, questions, themes, dumps } = useWorkspace();
  const [sessionsOpen, setSessionsOpen] = useState(true);

  const counts: Partial<Record<ViewSection, number>> = {
    dumps: dumps.length,
    actions: actions.filter((a) => !a.done).length,
    themes: themes.length,
    questions: questions.filter((q) => !q.answered).length,
  };

  return (
    <aside className="w-[240px] h-screen flex flex-col bg-sidebar border-r border-sidebar-border shrink-0 select-none">
      {/* Logo */}
      <div className="h-14 px-4 flex items-center gap-2.5 border-b border-sidebar-border">
        <div className="w-6 h-6 rounded-md bg-foreground flex items-center justify-center">
          <Zap className="w-3.5 h-3.5 text-background" />
        </div>
        <span className="text-sm font-semibold text-sidebar-primary tracking-tight">
          ClarityFlow
        </span>
      </div>

      {/* Search */}
      <div className="px-3 pt-3 pb-1">
        <button className="w-full flex items-center gap-2 px-2.5 py-[7px] text-[13px] text-sidebar-muted rounded-md border border-sidebar-border hover:border-sidebar-muted/30 transition-colors bg-sidebar-accent/50">
          <Search className="w-3.5 h-3.5" />
          <span>Search...</span>
          <div className="ml-auto flex items-center gap-0.5 text-[10px] font-mono text-sidebar-muted">
            <Command className="w-2.5 h-2.5" />K
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-2 py-2 space-y-px">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          const count = counts[item.id];
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 py-[7px] text-[13px] rounded-md transition-all duration-150",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className={cn("w-4 h-4 shrink-0", isActive && "text-foreground")} />
              <span>{item.label}</span>
              {count !== undefined && (
                <span className={cn(
                  "ml-auto text-[11px] font-mono tabular-nums",
                  isActive ? "text-sidebar-accent-foreground/60" : "text-sidebar-muted"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mx-3 my-1 h-px bg-sidebar-border" />

      {/* Sessions */}
      <div className="px-2 flex-1 overflow-auto cf-scrollbar">
        <button
          onClick={() => setSessionsOpen(!sessionsOpen)}
          className="w-full flex items-center gap-1 px-2.5 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-sidebar-muted hover:text-sidebar-foreground transition-colors"
        >
          <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", !sessionsOpen && "-rotate-90")} />
          Sessions
        </button>
        <AnimatePresence>
          {sessionsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden space-y-px"
            >
              {sessions.map((session) => (
                <button
                  key={session.id}
                  className={cn(
                    "w-full text-left px-2.5 py-2 rounded-md transition-colors group",
                    session.active
                      ? "bg-sidebar-accent"
                      : "hover:bg-sidebar-accent/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-[13px] truncate",
                      session.active ? "text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground"
                    )}>
                      {session.name}
                    </span>
                    {session.active && (
                      <div className="w-1.5 h-1.5 rounded-full bg-cf-decision shrink-0" />
                    )}
                  </div>
                  <span className="text-[11px] text-sidebar-muted">{session.dumps} dumps</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* New Session */}
      <div className="p-3 border-t border-sidebar-border">
        <button className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-[13px] font-medium rounded-md bg-foreground text-background hover:opacity-90 transition-opacity">
          <Plus className="w-3.5 h-3.5" />
          New Session
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
