import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Zap,
  MessageSquare,
  CheckSquare,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  Clock,
  Archive,
  ChevronDown,
  Plus,
  Settings,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navItems = [
  { id: "dumps", label: "Active Dumps", icon: MessageSquare, count: 12 },
  { id: "structures", label: "AI Structures", icon: Brain, count: 3 },
  { id: "actions", label: "Action Items", icon: CheckSquare, count: 7 },
  { id: "themes", label: "Themes", icon: Lightbulb, count: 5 },
  { id: "questions", label: "Open Questions", icon: HelpCircle, count: 4 },
  { id: "timeline", label: "Timeline", icon: Clock },
  { id: "archive", label: "Archive", icon: Archive },
];

const sessions = [
  { id: "1", name: "Q2 Pricing Strategy", date: "Today", active: true },
  { id: "2", name: "Product Roadmap Review", date: "Yesterday" },
  { id: "3", name: "Design System Sprint", date: "Feb 12" },
  { id: "4", name: "Onboarding Flow Ideas", date: "Feb 10" },
];

const AppSidebar = ({ activeSection, onSectionChange }: SidebarProps) => {
  const [sessionsOpen, setSessionsOpen] = useState(true);

  return (
    <aside className="w-64 h-screen flex flex-col bg-sidebar border-r border-sidebar-border shrink-0">
      {/* Logo */}
      <div className="p-5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg cf-gradient-primary flex items-center justify-center">
          <Zap className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-sidebar-accent-foreground tracking-tight">
          ClarityFlow
        </span>
      </div>

      {/* Search */}
      <div className="px-3 mb-2">
        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-sidebar-muted rounded-md hover:bg-sidebar-accent transition-colors">
          <Search className="w-3.5 h-3.5" />
          <span>Search dumps...</span>
          <kbd className="ml-auto text-[10px] font-mono bg-sidebar-accent px-1.5 py-0.5 rounded text-sidebar-muted">⌘K</kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-3 space-y-0.5 mb-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-all",
              activeSection === item.id
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{item.label}</span>
            {item.count && (
              <span className={cn(
                "ml-auto text-xs font-mono px-1.5 py-0.5 rounded-full",
                activeSection === item.id
                  ? "bg-sidebar-primary/20 text-sidebar-primary"
                  : "bg-sidebar-accent text-sidebar-muted"
              )}>
                {item.count}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Sessions */}
      <div className="px-3 flex-1 overflow-auto">
        <button
          onClick={() => setSessionsOpen(!sessionsOpen)}
          className="w-full flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-muted hover:text-sidebar-foreground transition-colors"
        >
          <ChevronDown className={cn("w-3 h-3 transition-transform", !sessionsOpen && "-rotate-90")} />
          Sessions
        </button>
        <AnimatePresence>
          {sessionsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-0.5 overflow-hidden"
            >
              {sessions.map((session) => (
                <button
                  key={session.id}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md transition-colors",
                    session.active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <div className="text-sm truncate">{session.name}</div>
                  <div className="text-xs text-sidebar-muted mt-0.5">{session.date}</div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* New Session Button */}
      <div className="p-3 border-t border-sidebar-border">
        <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg bg-sidebar-primary text-sidebar-primary-foreground hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          New Session
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
